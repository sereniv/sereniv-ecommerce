import { NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { redisHandler } from '@/lib/redis';

type ApiDataItem = [string, [number, number][]];

interface AggregateData {
  timestamp: number;
  totalPrivateHeld: number;
  totalPublicHeld: number;
  totalGovernmentHeld: number;
  totalBitcoinHeld: number;
  totalDefiHeld: number;
  totalExchangeHeld: number;
  totalEtfHeld: number;
  }

export async function GET() {
  try {
    const cachedData = await redisHandler.get('aggregate-balances');

    if (cachedData) {
      return NextResponse.json({ data: JSON.parse(cachedData as string), success: true });
    }

      const existingDataCount = await prisma.aggregateHoldings.count();

    const latestEntry = await prisma.aggregateHoldings.findFirst({
      orderBy: { timestamp: 'desc' }
    });

    const now = Date.now();
    const shouldFetchNewData = existingDataCount === 0 ||
      !latestEntry ||
      ((now - Number(latestEntry.timestamp)) > 5 * 60 * 1000);

    if (shouldFetchNewData) {
      console.log('Fetching fresh aggregate balance data from external API...');
      const response = await axios.get('https://api.droomdroom.online/api/v1/bitcoin/aggregate');
      const aggregateData = response.data;

      if (Array.isArray(aggregateData) && aggregateData.length > 0) {
        await prisma.aggregateHoldings.deleteMany({});

        const privateCompanyData = aggregateData.find((item: ApiDataItem) => item[0] === "PRIVATE_COMPANY")?.[1] || [];
        const publicCompanyData = aggregateData.find((item: ApiDataItem) => item[0] === "PUBLIC_COMPANY")?.[1] || [];
        const governmentData = aggregateData.find((item: ApiDataItem) => item[0] === "GOVERNMENT")?.[1] || [];
        const defiData = aggregateData.find((item: ApiDataItem) => item[0] === "DEFI")?.[1] || [];
        const exchangeData = aggregateData.find((item: ApiDataItem) => item[0] === "EXCHANGE")?.[1] || [];
        const etfData = aggregateData.find((item: ApiDataItem) => item[0] === "FUND")?.[1] || [];

        const timestampMap = new Map<number, AggregateData>();

        privateCompanyData.forEach(([timestamp, value]: [number, number]) => {
          timestampMap.set(timestamp, {
            timestamp,
            totalPrivateHeld: value,
            totalPublicHeld: 0,
            totalGovernmentHeld: 0,
            totalBitcoinHeld: value,
            totalDefiHeld: 0,
            totalExchangeHeld: 0,
            totalEtfHeld: 0
          });
        });

        publicCompanyData.forEach(([timestamp, value]: [number, number]) => {
          if (timestampMap.has(timestamp)) {
            const point = timestampMap.get(timestamp)!;
            point.totalPublicHeld = value;
            point.totalBitcoinHeld = point.totalPrivateHeld + point.totalPublicHeld + point.totalGovernmentHeld;
          } else {
            timestampMap.set(timestamp, {
              timestamp,
              totalPrivateHeld: 0,
              totalPublicHeld: value,
              totalGovernmentHeld: 0,
              totalBitcoinHeld: value,
              totalDefiHeld: 0,
              totalExchangeHeld: 0,
              totalEtfHeld: 0
            });
          }
        });

        governmentData.forEach(([timestamp, value]: [number, number]) => {
          if (timestampMap.has(timestamp)) {
            const point = timestampMap.get(timestamp)!;
            point.totalGovernmentHeld = value;
            point.totalBitcoinHeld = point.totalPrivateHeld + point.totalPublicHeld + point.totalGovernmentHeld;
          } else {
            timestampMap.set(timestamp, {
              timestamp,
              totalPrivateHeld: 0,
              totalPublicHeld: 0,
              totalGovernmentHeld: value,
              totalBitcoinHeld: value,
              totalDefiHeld: 0,
              totalExchangeHeld: 0,
              totalEtfHeld: 0
            });
          }
        });

        defiData.forEach(([timestamp, value]: [number, number]) => {
          if (timestampMap.has(timestamp)) {
            const point = timestampMap.get(timestamp)!;
            point.totalDefiHeld = value;
            point.totalBitcoinHeld = point.totalPrivateHeld + point.totalPublicHeld + point.totalGovernmentHeld + point.totalDefiHeld;
          } else {
            timestampMap.set(timestamp, {
              timestamp,
              totalPrivateHeld: 0,
              totalPublicHeld: 0,
              totalGovernmentHeld: 0,
              totalBitcoinHeld: value,
              totalDefiHeld: value,
              totalExchangeHeld: 0,
              totalEtfHeld: 0
            });
          }
        });

        exchangeData.forEach(([timestamp, value]: [number, number]) => {
          if (timestampMap.has(timestamp)) {
            const point = timestampMap.get(timestamp)!;
            point.totalExchangeHeld = value;
            point.totalBitcoinHeld = point.totalPrivateHeld + point.totalPublicHeld + point.totalGovernmentHeld + point.totalDefiHeld + point.totalExchangeHeld;
          } else {
            timestampMap.set(timestamp, {
              timestamp,
              totalPrivateHeld: 0,
              totalPublicHeld: 0,
              totalGovernmentHeld: 0,
              totalBitcoinHeld: value,
              totalDefiHeld: 0,
              totalExchangeHeld: value,
              totalEtfHeld: 0
            });
          }
        });

        etfData.forEach(([timestamp, value]: [number, number]) => {
          if (timestampMap.has(timestamp)) {
            const point = timestampMap.get(timestamp)!;
            point.totalEtfHeld = value;
            point.totalBitcoinHeld = point.totalPrivateHeld + point.totalPublicHeld + point.totalGovernmentHeld + point.totalDefiHeld + point.totalExchangeHeld + point.totalEtfHeld;
          } else {
            timestampMap.set(timestamp, {
              timestamp,
              totalPrivateHeld: 0,
              totalPublicHeld: 0,
              totalGovernmentHeld: 0,
              totalBitcoinHeld: value,
              totalDefiHeld: 0,
              totalExchangeHeld: 0,
              totalEtfHeld: value
            });
          }
        });

        const dataToInsert = Array.from(timestampMap.values()).map((item) => ({
          timestamp: BigInt(item.timestamp),
          date: new Date(item.timestamp),
          totalBitcoinHeld: item.totalBitcoinHeld,
          totalPublicHeld: item.totalPublicHeld,
          totalPrivateHeld: item.totalPrivateHeld,
          totalGovernmentHeld: item.totalGovernmentHeld,
          totalDefiHeld: item.totalDefiHeld,
          totalExchangeHeld: item.totalExchangeHeld,
          totalEtfHeld: item.totalEtfHeld,
          totalUsdValue: null,
          btcPrice: null
        }));

        await prisma.aggregateHoldings.createMany({
          data: dataToInsert
        });

        console.log(`Inserted ${dataToInsert.length} aggregate holdings records`);
      }
    }

    const holdingsData = await prisma.aggregateHoldings.findMany({
      orderBy: { timestamp: 'asc' }
    });

    const formattedData = [
      [
        "PRIVATE_COMPANY",
        holdingsData.map(record => [
          Number(record.timestamp),
          record.totalPrivateHeld || 0
        ])
      ],
      [
        "PUBLIC_COMPANY", 
        holdingsData.map(record => [
          Number(record.timestamp),
          record.totalPublicHeld || 0
        ])
      ],
      [
        "GOVERNMENT",
        holdingsData.map(record => [
          Number(record.timestamp),
          record.totalGovernmentHeld || 0
        ])
      ],
      [
        "DEFI",
        holdingsData.map(record => [
          Number(record.timestamp),
          record.totalDefiHeld || 0
        ])
      ],
      [
        "EXCHANGE",
        holdingsData.map(record => [
          Number(record.timestamp),
          record.totalExchangeHeld || 0
        ])
      ],
      [
        "ETF",
        holdingsData.map(record => [
          Number(record.timestamp),
          record.totalEtfHeld || 0
        ])
      ]
    ];
    
    await redisHandler.set('aggregate-balances', JSON.stringify(formattedData), { expirationTime: 10 * 60 });

    return NextResponse.json({
      data: formattedData,
      success: true,
    });

  } catch (error) {
    console.error('Error fetching aggregate balances:', error);
    return NextResponse.json({
      message: 'Error fetching aggregate balances',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } 
} 