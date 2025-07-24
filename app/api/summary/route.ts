import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EntityType } from '@prisma/client';
import axios from 'axios';
import { redisHandler } from '@/lib/redis';



async function calculateTotalBitcoinFromDb(type: EntityType): Promise<number> {
  const result = await prisma.entity.aggregate({
    where: { type },
    _sum: {
      bitcoinHoldings: true
    }
  });

  return result._sum.bitcoinHoldings || 0;
}

async function getEntityCountFromDb(type: EntityType): Promise<number> {
  return await prisma.entity.count({
    where: { type }
  });
}

async function getTopCountriesByEntityCount(limit = 10) {
  const results = await prisma.entity.groupBy({
    by: ['countryName'],
    _count: { countryName: true },
    orderBy: { _count: { countryName: 'desc' } },
    where: { countryName: { not: null } },
    take: limit,
  });
  return results.map(r => ({ countryName: r.countryName, count: r._count.countryName }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';
  try {

    let CACHE = await redisHandler.get('bitcoin-treasury-summary');
    if (CACHE && !force) {
      return NextResponse.json(
        {
          success: true,
          data: JSON.parse(CACHE as any)
        }
      );
    }
    
    let holdingsData;
    let entitiesData;
    let totalEntities;
    let totalBitcoin;
    let percentageOfSupply;
    let totalValueUSD;
    let bitcoinPrice;

    const publicHoldings = await calculateTotalBitcoinFromDb('PUBLIC');
    const privateHoldings = await calculateTotalBitcoinFromDb('PRIVATE');
    const governmentHoldings = await calculateTotalBitcoinFromDb('GOVERNMENT');
    const defiHoldings = await calculateTotalBitcoinFromDb('DEFI');
    const exchangeHoldings = await calculateTotalBitcoinFromDb('EXCHANGE');
    const etfHoldings = await calculateTotalBitcoinFromDb('ETF');

    const publicCount = await getEntityCountFromDb('PUBLIC');
    const privateCount = await getEntityCountFromDb('PRIVATE');
    const governmentCount = await getEntityCountFromDb('GOVERNMENT');
    const defiCount = await getEntityCountFromDb('DEFI');
    const exchangeCount = await getEntityCountFromDb('EXCHANGE');
    const etfCount = await getEntityCountFromDb('ETF');

    holdingsData = {
      publicCompanies: publicHoldings,
      privateCompanies: privateHoldings,
      governments: governmentHoldings,
      defi: defiHoldings,
      exchange: exchangeHoldings,
      etf: etfHoldings,
    };

    entitiesData = {
      publicCompanies: publicCount,
      privateCompanies: privateCount,
      governments: governmentCount,
      defi: defiCount,
      exchange: exchangeCount,
      etf: etfCount,
    };

    totalEntities = publicCount + privateCount + governmentCount + defiCount + exchangeCount + etfCount;
    totalBitcoin = publicHoldings + privateHoldings + governmentHoldings + defiHoldings + exchangeHoldings + etfHoldings;

    const totalSupply = 21000000;
    percentageOfSupply = (totalBitcoin / totalSupply) * 100;

    try {
      const BITCOIN_CMC_ID = '1';
      const url = `https://droomdroom.com/price/api/coin/price/${BITCOIN_CMC_ID}`;
      console.log(url);
      const response = await axios.get(url, {});
      bitcoinPrice = response.data.price;
    } catch (error) {
      console.error('Error fetching bitcoin price:', error);
      bitcoinPrice = 100000;
    }

    totalValueUSD = totalBitcoin * bitcoinPrice;

    const holdingsPercentages = calculatePercentages(holdingsData, totalBitcoin);
    const entitiesPercentages = calculatePercentages(entitiesData, totalEntities);

    const topCountriesByEntityCount = await getTopCountriesByEntityCount(5);

    const responseData = {
      summary: {
        totalEntities,
        totalBitcoin,
        holdingsData,
        entitiesData,
        holdingsPercentages,
        entitiesPercentages,
        percentageOfSupply,
        totalValueUSD,
        bitcoinPrice: bitcoinPrice,
        bitcoinMarketCap: bitcoinPrice * 21000000,
        source: 'database',
        lastUpdated: new Date().toISOString(),
        topCountriesByEntityCount,
      }
    };
    // expires every 5 minutes
    await redisHandler.set('bitcoin-treasury-summary', JSON.stringify(responseData), {
      expirationTime: 60 * 5
    });

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching treasuries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}


function calculatePercentages(data: Record<string, number>, total: number): Record<string, number> {
  const percentages: Record<string, number> = {};

  for (const [key, value] of Object.entries(data)) {
    percentages[key] = total > 0 ? (value / total) * 100 : 0;
  }

  return percentages;
}
