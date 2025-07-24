import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EntityType, LinkType } from '@prisma/client'
import { cleanSEOIMAGEURL } from '@/lib/utils';

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

export async function POST(
  request: Request,
) {  
  try {
    const data = await request.json()

    if (data.slug) {
      const entityBeforeUpdate = await prisma.entity.findFirst({
        where: { slug: data.slug }
      });

      if (entityBeforeUpdate) {
      return NextResponse.json(
          { success: false, error: 'Entity already exists' },
          { status: 400 }
        )
      }
    }

    const createdEntity = await prisma.entity.create({
      data: {
        slug: data.slug || undefined,
        entityId: data.entityId || undefined,
        name: data.name || undefined,
        ticker: data.ticker || undefined,
        type: data.type as EntityType || undefined,
        rank: data.rank || undefined,
        countryFlag: data.countryFlag || undefined,
        countryName: data.countryName || undefined,
        externalWebsiteSlug: data.externalWebsiteSlug || undefined,
        holdingSince: data.holdingSince || undefined,
        marketCap: data.marketCap || undefined,
        sharePrice: data.sharePrice || undefined,
        enterpriseValue: data.enterpriseValue || undefined,
        bitcoinHoldings: data.bitcoinHoldings || undefined,
        btcPerShare: data.btcPerShare || undefined,
        costBasis: data.costBasis || undefined,
        usdValue: data.usdValue || undefined,
        ngu: data.ngu || undefined,
        mNav: data.mNav || undefined,
        marketCapPercentage: data.marketCapPercentage || undefined,
        supplyPercentage: data.supplyPercentage || undefined,
        profitLossPercentage: data.profitLossPercentage || undefined,
        avgCostPerBTC: data.avgCostPerBTC || undefined,
        bitcoinValueInUSD: data.bitcoinValueInUSD || undefined,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
        seoKeywords: data.seoKeywords || undefined,
        seoImage: data.seoImage ? cleanSEOIMAGEURL(data.seoImage)! : undefined,
        lastUpdated: new Date(),
      }
    });

    if (data.entityAbout && Array.isArray(data.entityAbout)) {
      if (data.entityAbout.length > 0) {
        await Promise.all(data.entityAbout.map(async (about: any) => {
          await prisma.entityAbout.create({
            data: {
              title: about.title || '',
              content: about.content || '',
              headings: about.headings || [],
              keyPoints: about.keyPoints || [],
              entityId: createdEntity.id
            }
          });
        }));
      }
    }

    if (data.entityLinks && Array.isArray(data.entityLinks)) {
      if (data.entityLinks.length > 0) {
        await Promise.all(data.entityLinks.map(async (link: any) => {
          await prisma.entityLink.create({
            data: {
              text: link.text || '',
              url: link.url || '',
              entityId: createdEntity.id,
              type: link.type || LinkType.UNOFFICIAL
            }
          });
        }));
      }
    }

    if (data.balanceSheet && Array.isArray(data.balanceSheet)) {
      if (data.balanceSheet.length > 0) {
        await Promise.all(data.balanceSheet.map(async (balance: any) => {
          await prisma.balanceSheet.create({
            data: {
              date: balance.date ? new Date(balance.date) : null,
              btcBalance: balance.btcBalance || 0,
              change: balance.change || 0,
              costBasis: balance.costBasis || 0,
              marketPrice: balance.marketPrice || 0,
              stockPrice: balance.stockPrice || 0,
              entityId: createdEntity.id
            }
          });
        }));
      }
    }

    const completeEntity = await prisma.entity.findUnique({
      where: { id: createdEntity.id },
      include: {
        entityAbout: true,
        entityLinks: true,
        balanceSheet: true,
        entityHistorical: true,
        entityTimeSeries: true
      }
    });

    const serializedEntity = serializeData(completeEntity);

    return NextResponse.json({
      success: true,
      message: 'Entity created successfully',
      data: serializedEntity
    });
    
  } catch (error) {
        console.error('Error creating entity:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create entity',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 