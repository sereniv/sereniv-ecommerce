import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Entity } from '@prisma/client';
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

async function updateBalanceSheetFromAPI(entity: Entity) {
  try {
    console.log(`Fetching balance sheet data from API for entity: ${entity.slug}`);
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
    const balanceSheet = apiData.balanceSheet || { rows: [] };

    if (balanceSheet.rows.length > 0) {
      await prisma.balanceSheet.deleteMany({ where: { entityId: entity.id } });

      const validBalanceRows = [];
      
      for (const row of balanceSheet.rows) {
        if (!row.date) {
          console.error(`Missing date in balance sheet for entity ${entity.id}`);
          continue;
        }
        
        const date = new Date(row.date);
        if (isNaN(date.getTime())) {
          console.error(`Invalid balance sheet date for entity ${entity.id}: ${row.date}`);
          continue;
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

      if (validBalanceRows.length) {
        await prisma.balanceSheet.createMany({
          data: validBalanceRows
        });
        console.log(`Updated ${validBalanceRows.length} balance sheet records for entity: ${entity.slug}`);
      }
    }

    await prisma.entity.update({
      where: { id: entity.id },
      data: { lastUpdated: new Date() }
    });

  } catch (error) {
    console.error(`Failed to update balance sheet for entity ${entity.slug}:`, error);
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

    let balanceSheet = await prisma.balanceSheet.findMany({
      where: { entityId: entity.id },
      orderBy: { date: 'desc' }
    });

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const needsUpdate = 
      balanceSheet.length === 0 || 
      (entity.lastUpdated && entity.lastUpdated < twelveHoursAgo);

    if (needsUpdate) {
      try {
        await updateBalanceSheetFromAPI(entity as Entity);
        balanceSheet = await prisma.balanceSheet.findMany({
          where: { entityId: entity.id },
          orderBy: { date: 'desc' }
        });
      } catch (updateError) {
        console.error('Failed to update balance sheet from API:', updateError);
      }
    }

    const serializedBalanceSheet = serializeData(balanceSheet);
    
    return NextResponse.json({
      success: true,
      data: serializedBalanceSheet
    });
  } catch (error) {
    console.error('Error in GET /api/entity/balance-sheet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 