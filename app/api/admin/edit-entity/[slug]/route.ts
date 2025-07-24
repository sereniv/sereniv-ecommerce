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

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {  
  try {
    const data = await request.json()
    
    // Find the entity by slug
    const entityBeforeUpdate = await prisma.entity.findFirst({
      where: { slug: params.slug },
      select: { id: true } 
    });

    if (!entityBeforeUpdate) {
      return NextResponse.json(
        { success: false, error: 'Entity not found' },
        { status: 404 }
      )
    }

    const entityId = entityBeforeUpdate.id;

    // Update the entity with new details
    const updatedEntity = await prisma.entity.update({
      where: { id: entityId },
      data: {
        slug: data.slug || undefined,
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

    // Handle EntityAbout update
    if (data.entityAbout && Array.isArray(data.entityAbout)) {
      // First delete existing EntityAbout
      await prisma.entityAbout.deleteMany({
        where: { entityId: entityId }
      });
      
      // Then create new EntityAbout
      if (data.entityAbout.length > 0) {
        await Promise.all(data.entityAbout.map(async (about: any) => {
          await prisma.entityAbout.create({
            data: {
              title: about.title || '',
              content: about.content || '',
              headings: about.headings || [],
              keyPoints: about.keyPoints || [],
              entityId: entityId
            }
          });
        }));
      }
    }

    // Handle EntityLinks update
    if (data.entityLinks && Array.isArray(data.entityLinks)) {
      // First delete existing EntityLinks
      await prisma.entityLink.deleteMany({
        where: { entityId: entityId }
      });
      
      // Then create new EntityLinks
      if (data.entityLinks.length > 0) {
        await Promise.all(data.entityLinks.map(async (link: any) => {
          await prisma.entityLink.create({
            data: {
              text: link.text || '',
              url: link.url || '',
              entityId: entityId,
              type: link.type || LinkType.UNOFFICIAL
            }
          });
        }));
      }
    }

    // Handle BalanceSheet update
    if (data.balanceSheet && Array.isArray(data.balanceSheet)) {
      // First delete existing BalanceSheet
      await prisma.balanceSheet.deleteMany({
        where: { entityId: entityId }
      });
      
      // Then create new BalanceSheet
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
              entityId: entityId
            }
          });
        }));
      }
    }

    // Return the updated entity with all related data
    const completeEntity = await prisma.entity.findUnique({
      where: { id: entityId },
      include: {
        entityAbout: true,
        entityLinks: true,
        balanceSheet: true,
        entityHistorical: true,
        entityTimeSeries: true
      }
    });

    // Serialize the data to handle BigInt values
    const serializedEntity = serializeData(completeEntity);

    return NextResponse.json({
      success: true,
      message: 'Entity updated successfully',
      data: serializedEntity
    });
    
  } catch (error) {
    console.error('Error updating entity:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update entity',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 