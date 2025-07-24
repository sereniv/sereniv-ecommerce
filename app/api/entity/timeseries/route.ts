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

async function updateTimeSeriesFromAPI(entity: Entity) {
  try {
    console.log(`Fetching timeseries data from API for entity: ${entity.slug}`);
    const response = await fetch(`https://api.droomdroom.online/api/v1/bitcoin/entity/${entity.slug}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiResponse = await response.json();

    if (!apiResponse.success) {
      console.error(`API request failed for slug: ${entity.slug}:`, apiResponse.error);
      return;
    }

    const apiData = apiResponse.data;
    const timeSeries = apiData.timeseries || {};

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
            continue;
          }
          
          const date = new Date(rawDate);
          if (isNaN(date.getTime())) {
            console.error(`Invalid date format in ${key} for entity ${entity.id}: ${rawDate}`);
            continue;
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
      console.log(`Updated ${timeSeriesData.length} timeseries records for entity: ${entity.slug}`);
    }

    await prisma.entity.update({
      where: { id: entity.id },
      data: { lastUpdated: new Date() }
    });

  } catch (error) {
    console.error(`Failed to update timeseries for entity ${entity.slug}:`, error);
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
    const entity = await prisma.entity.findFirst({
      where: { slug: slug },
      select: { id: true, slug: true, lastUpdated: true }
    });

    if (!entity) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    let timeSeries = await prisma.entityTimeSeries.findMany({
      where: { entityId: entity.id },
      orderBy: { date: 'asc' }
    });

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const needsUpdate = 
      timeSeries.length === 0 || 
      (entity.lastUpdated && entity.lastUpdated < twelveHoursAgo);

    if (needsUpdate) {
      try {
        await updateTimeSeriesFromAPI(entity as Entity);
        timeSeries = await prisma.entityTimeSeries.findMany({
          where: { entityId: entity.id },
          orderBy: { date: 'asc' }
        });
      } catch (updateError) {
        console.error('Failed to update timeseries from API:', updateError);
      }
    }

    const serializedTimeSeries = serializeData(timeSeries);
    
    return NextResponse.json({
      success: true,
      data: serializedTimeSeries
    });
  } catch (error) {
    console.error('Error in GET /api/entity/timeseries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 