import { prisma } from "@/lib/prisma"
import { EntityType } from "@prisma/client"
import StaticHomePage from "@/components/static-home-page"
import { BreadcrumbSchema, EntityListSchema, OrganizationSchema, WebsiteSchema } from "@/components/schema-markup"
import { Entity } from "@/lib/types/entity"
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js';
import { redisHandler } from "@/lib/redis"

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);


async function getTopCountriesWithTypeBreakdown(limit = 5) {
  const topCountries = await prisma.entity.groupBy({
    by: ['countryName'],
    _count: { countryName: true },
    orderBy: { _count: { countryName: 'desc' } },
    where: { countryName: { not: null } },
    take: limit,
  });
  const countryNames = topCountries.map(c => c.countryName).filter((name): name is string => !!name);
  const typeCounts = await prisma.entity.groupBy({
    by: ['countryName', 'type'],
    where: { countryName: { in: countryNames } },
    _count: { _all: true },
  });
  return topCountries.map(c => {
    const breakdown = {
      public: 0,
      private: 0,
      government: 0,
      defi: 0,
      exchange: 0,
      etf: 0,
    };
    typeCounts.forEach(tc => {
      if (tc.countryName === c.countryName) {
        if (tc.type === 'PUBLIC') breakdown.public = tc._count?._all ?? 0;
        if (tc.type === 'PRIVATE') breakdown.private = tc._count?._all ?? 0;
        if (tc.type === 'GOVERNMENT') breakdown.government = tc._count?._all ?? 0;
        if (tc.type === 'DEFI') breakdown.defi = tc._count?._all ?? 0;
        if (tc.type === 'EXCHANGE') breakdown.exchange = tc._count?._all ?? 0;
        if (tc.type === 'ETF') breakdown.etf = tc._count?._all ?? 0;
      }
    });
    return {
      countryName: c.countryName,
      total: c._count.countryName,
      ...breakdown,
    };
  });
}

async function calculateTotalBitcoinFromDb(type: string): Promise<number> {
  const result = await prisma.entity.aggregate({
    where: { type: type as EntityType },
    _sum: { bitcoinHoldings: true }
  });
  return result._sum.bitcoinHoldings || 0;
}

async function getEntityCountFromDb(type: EntityType): Promise<number> {
  return await prisma.entity.count({
    where: { type }
  });
}

function calculatePercentages(data: any, total: number) {
  const percentages: any = {};
  for (const [key, value] of Object.entries(data)) {
    percentages[key] = total > 0 ? ((value as number) / total) * 100 : 0;
  }
  return percentages;
}

async function getSummaryData() {
  try {
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

    const holdingsData = {
      publicCompanies: publicHoldings,
      privateCompanies: privateHoldings,
      governments: governmentHoldings,
      defi: defiHoldings,
      exchange: exchangeHoldings,
      etf: etfHoldings,
    };

    const entitiesData = {
      publicCompanies: publicCount,
      privateCompanies: privateCount,
      governments: governmentCount,
      defi: defiCount,
      exchange: exchangeCount,
      etf: etfCount,
    };

    const totalEntities = publicCount + privateCount + governmentCount + defiCount + exchangeCount + etfCount;
    const totalBitcoin = publicHoldings + privateHoldings + governmentHoldings + defiHoldings + exchangeHoldings + etfHoldings;
    const totalSupply = 21000000;
    const percentageOfSupply = (totalBitcoin / totalSupply) * 100;

    let bitcoinPrice = 100000; // Default fallback
    try {
      const BITCOIN_CMC_ID = '1';
      const response = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${BITCOIN_CMC_ID}`, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
        }
      });
      bitcoinPrice = response.data.data[BITCOIN_CMC_ID].quote.USD.price;
    } catch (error) {
      console.error('Error fetching bitcoin price during build:', error);
    }

    const totalValueUSD = totalBitcoin * bitcoinPrice;
    const holdingsPercentages = calculatePercentages(holdingsData, totalBitcoin);
    const entitiesPercentages = calculatePercentages(entitiesData, totalEntities);
    const topCountriesByEntityCount = await getTopCountriesWithTypeBreakdown(5);


    return {
      totalEntities,
      totalBitcoin,
      holdingsData,
      entitiesData,
      holdingsPercentages,
      entitiesPercentages,
      percentageOfSupply,
      totalValueUSD,
      bitcoinPrice,
      bitcoinMarketCap: bitcoinPrice * 21000000,
      source: 'database',
      lastUpdated: new Date().toISOString(),
      topCountriesByEntityCount
    };
  } catch (error) {
    console.error('Error calculating summary data:', error);
    return null;
  }
}

async function getInitialData() {
  try {
    const [companiesData, custodiansData, summaryData] = await Promise.all([
      prisma.entity.findMany({
        where: {
          type: {
            in: [EntityType.PUBLIC, EntityType.PRIVATE, EntityType.GOVERNMENT]
          }
        },
        orderBy: {
          bitcoinHoldings: 'desc'
        },
        include: {
          entityAbout: true,
        }
      }),
      prisma.entity.findMany({
        where: {
          type: {
            in: [EntityType.DEFI, EntityType.EXCHANGE, EntityType.ETF]
          }
        },
        orderBy: {
          bitcoinHoldings: 'desc'
        },
        include: {
          entityAbout: true,
        }
      }),
      // Fetch summary data
      getSummaryData()
    ])

    const serializeData = (data: any): any => {
      if (data === null || data === undefined) return data
      if (data instanceof Date) return data.toISOString()
      if (typeof data === 'bigint') return data.toString()
      if (Array.isArray(data)) return data.map(item => serializeData(item))
      if (typeof data === 'object') {
        const serialized: any = {}
        for (const [key, value] of Object.entries(data)) {
          serialized[key] = serializeData(value)
        }
        return serialized
      }
      return data
    }

    return {
      companiesData: serializeData(companiesData),
      custodiansData: serializeData(custodiansData),
      summaryData: serializeData(summaryData)
    }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    return {
      companiesData: [],
      custodiansData: [],
      summaryData: null
    }
  }
}

async function getInitialDataCached() {
  const cacheKey = "initialData";
  const cached = await redisHandler.get(cacheKey);
  if (cached) return cached;
  const data = await getInitialData();
  await redisHandler.set(cacheKey, data, { expirationTime: 300 });
  return data;
}

async function getBitcoinHoldingsDataCached() {
  const cacheKey = "bitcoinHoldingsData";
  const cached = await redisHandler.get(cacheKey);
  if (cached) return cached;
  const holdings = await prisma.aggregateHoldings.findMany({ orderBy: { timestamp: "asc" } });
  const data = holdings.map((record) => ({
    timestamp: Number(record.timestamp),
    privateCompanies: record.totalPrivateHeld || 0,
    publicCompanies: record.totalPublicHeld || 0,
    governments: record.totalGovernmentHeld || 0,
    defi: record.totalDefiHeld || 0,
    exchange: record.totalExchangeHeld || 0,
    etf: record.totalEtfHeld || 0,
    total:
      (record.totalPrivateHeld || 0) +
      (record.totalPublicHeld || 0) +
      (record.totalGovernmentHeld || 0) +
      (record.totalDefiHeld || 0) +
      (record.totalExchangeHeld || 0) +
      (record.totalEtfHeld || 0),
  }));
  await redisHandler.set(cacheKey, data, { expirationTime: 300 });
  return data;
}

export default async function Home() {
  const results = await Promise.all([
    getInitialDataCached(),
    getBitcoinHoldingsDataCached()
  ])
  const initialData: any = results[0]
  const bitcoinHoldingsData = results[1]
  initialData.bitcoinHoldingsData = bitcoinHoldingsData
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }]} />
      <OrganizationSchema name="DroomDroom" url="https://droomdroom.com" logo="https://droomdroom.com/price/DroomDroom_light.svg" description="DroomDroom is a platform for tracking the Bitcoin holdings of public companies and governments." />
      <EntityListSchema entities={initialData.companiesData} />
      <WebsiteSchema title="DroomDroom" description="DroomDroom is a platform for tracking the Bitcoin holdings of public companies and governments." url="https://droomdroom.com" imageUrl="https://droomdroom.com/price/DroomDroom_light.svg" />
      <StaticHomePage initialData={initialData} />
    </>
  )
}