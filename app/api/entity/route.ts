import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Entity, TimeSeriesType } from '@prisma/client';
import { extractNumber } from '@/lib/utils';

function serializeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    if (isNaN(data.getTime())) {
      return null;
    }
    return data.toISOString();
  }

  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  if (typeof data === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value);
    }
    return serialized;
  }

  return data;
}

async function getEntityData(slug: string) {
  try {
    let entity = await prisma.entity.findFirst({
      where: { slug: slug },
      include: {
        entityLinks: true,
        entityAbout: true,
      }
    });
    
    const needsUpdate =
      !entity ||
      !entity.entityAbout || Object.keys(entity.entityAbout).length === 0 ||
      !entity.entityLinks || entity.entityLinks.length === 0;
   
    if (needsUpdate && entity) {
      await updateData(entity);
      entity = await prisma.entity.findFirst({
        where: { slug: slug },
        include: {
          entityLinks: true,
          entityAbout: true,
        }
      });
    }

    const serializedEntity = serializeData(entity);
    
    return serializedEntity;
  } catch (error) {
    console.error('Error fetching entity data:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
  }

  try {
    const entity = await getEntityData(slug);
    
    return NextResponse.json({
      success: true,
      data: entity
    });
  } catch (error) {
    console.error('Error in GET /api/entity:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

const updateData = async (entity: Entity | null) => {
  try {
    const response = await fetch(`https://api.droomdroom.online/api/v1/bitcoin/entity/${entity?.slug}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiResponse = await response.json();

    if (!apiResponse.success) {
      console.error(`API request failed for slug: ${entity?.slug}:`, apiResponse.error);
      return;
    }

    const apiData = apiResponse.data;

    if (entity) {
      updateEntityFromApiData(entity, apiData)
        .then(() => {
          console.log(`updateData process initiated for entity ID: ${entity.id}`);
        })
        .catch(error => {
          console.error(`updateData failed for entity ID: ${entity.id}:`, error);
        });
    }
    return;
  } catch (error) {
    console.error(`updateData failed for entity ID: ${entity?.id}, slug: ${entity?.slug}:`, error);
  }
}

async function updateEntityFromApiData(entity: Entity, apiData: any) {
  try {
    const existing = await prisma.entity.findUnique({
      where: { id: entity.id },
      include: {
        balanceSheet: true,
        entityLinks: true,
        entityAbout: true,
        entityTimeSeries: true
      }
    });

    const bitcoinHoldings = apiData.bitcoinHoldings || {};
    const stockFinancials = apiData.stockFinancials || {};
    const aboutEntity = apiData.aboutEntity || {};
    const balanceSheet = apiData.balanceSheet || { rows: [] };
    const timeSeries = apiData.timeseries || {};

    await prisma.entity.update({
      where: { id: entity.id },
      data: {
        entityId: apiData.entityId,
        rank: apiData.entityId || null,
        holdingSince: bitcoinHoldings.holdingSince || '',
        profitLossPercentage: extractNumber(bitcoinHoldings.profitLossPercent) || null,
        avgCostPerBTC: extractNumber(bitcoinHoldings.avgCostPerBTC) || null,
        sharePrice: extractNumber(stockFinancials.sharePrice) || null,
        lastUpdated: new Date(),
      },
    });

    const hasEntityAbout = existing?.entityAbout && Object.keys(existing.entityAbout).length > 0;
    if (!hasEntityAbout && aboutEntity && aboutEntity.content) {
      await prisma.entityAbout.deleteMany({
        where: { entityId: entity.id }
      });

      await prisma.entityAbout.create({
        data: {
          entity: { connect: { id: entity.id } },
          title: aboutEntity.title || '',
          content: aboutEntity.content || '',
          headings: aboutEntity.headings || [],
          keyPoints: aboutEntity.keyPoints || []
        }
      });
    }

    const hasEntityLinks = existing?.entityLinks && existing.entityLinks.length > 0;
    if (!hasEntityLinks && aboutEntity && aboutEntity.links) {
      await prisma.entityLink.deleteMany({
        where: { entityId: entity.id }
      });

      for (const [index, link] of aboutEntity.links.entries()) {
        await prisma.entityLink.create({
          data: {
            entity: { connect: { id: entity.id } },
            text: link.text || '',
            url: link.url || ''
          }
        });
      }
    }

    const hasBalanceSheet = existing?.balanceSheet && existing.balanceSheet.length > 0;
    if (!hasBalanceSheet && balanceSheet.rows.length) {
      const validBalanceRows = [];
      
      for (const row of balanceSheet.rows) {
        if (!row.date) {
          console.error(`Missing date in balance sheet for entity ${entity.id}`);
          throw new Error('Invalid balance sheet data: missing date');
        }
        
        const date = new Date(row.date);
        if (isNaN(date.getTime())) {
          console.error(`Invalid balance sheet date for entity ${entity.id}: ${row.date}`);
          throw new Error(`Invalid balance sheet date format: ${row.date}`);
        }
        
        validBalanceRows.push({
          ...row,
          date: date,
          btcBalance: extractNumber(row.btcBalance) || 0,
          change: extractNumber(row.change) || 0,
          costBasis: extractNumber(row.costBasis) || 0,
          marketPrice: extractNumber(row.marketPrice) || 0,
          stockPrice: extractNumber(row.stockPrice) || 0,
          entityId: entity.id
        });
      }

      await prisma.balanceSheet.createMany({
        data: validBalanceRows
      });
    }


    if (!existing?.entityTimeSeries.length && timeSeries) {
      await prisma.entityTimeSeries.deleteMany({ where: { entityId: entity.id } });
      const timeSeriesData = [];

      for (const [key, type] of Object.entries({
        btcBalances: TimeSeriesType.BTC_BALANCE,
        btcPrices: TimeSeriesType.BTC_PRICE,
        stockPrices: TimeSeriesType.STOCK_PRICE,
        btcPerShare: TimeSeriesType.BTC_PER_SHARE,
        fiatValues: TimeSeriesType.FIAT_VALUE,
        navMultipliers: TimeSeriesType.NAV_MULTIPLIER
      })) {
        if (timeSeries[key] && timeSeries[key].length) {
          const validSeries = [];
          
          for (const row of timeSeries[key]) {
            const rawDate = row[0];
            if (!rawDate) {
              console.error(`Missing date in ${key} for entity ${entity.id}`);
              throw new Error(`Invalid time series data: missing date in ${key}`);
            }
            
            const date = new Date(rawDate);
            if (isNaN(date.getTime())) {
              console.error(`Invalid date format in ${key} for entity ${entity.id}: ${rawDate}`);
              throw new Error(`Invalid date format in ${key}: ${rawDate}`);
            }

            validSeries.push({
              date: date,
              value: extractNumber(row[1]) || 0,
              type,
              timestamp: rawDate,
              entityId: entity.id
            });
          }

          timeSeriesData.push(...validSeries);
        }
      }

      if (timeSeriesData.length) {
        await prisma.entityTimeSeries.createMany({ data: timeSeriesData });
      }
    }
    
    console.log(`Entity update completed for entity ID: ${entity.id}`);
  } catch (error) {
    console.error(`Entity update error for ID ${entity.id}:`, error);
  }
}