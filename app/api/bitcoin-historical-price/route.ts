import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import axios from 'axios';
import { redisHandler } from '@/lib/redis';


export async function GET() {
  try {
    const cachedData = await redisHandler.get('bitcoin-historical-price');

    if (cachedData) {
      return NextResponse.json({ data: JSON.parse(cachedData as string), success: true });
    }

    const existingDataCount = await prisma.bitcoinPriceHistory.count();

    const latestEntry = await prisma.bitcoinPriceHistory.findFirst({
      orderBy: { timestamp: 'desc' }
    });

    const now = Date.now();
    const shouldFetchNewData = existingDataCount === 0 ||
      !latestEntry ||
      ((now - Number(latestEntry.timestamp)) > 5 * 60 * 1000);


    if (shouldFetchNewData) {
      console.log('Fetching fresh Bitcoin price data from external API...');
      const response = await axios.get('https://api.droomdroom.online/api/v1/bitcoin/prices');
      const priceData = response.data;

      if (Array.isArray(priceData) && priceData.length > 0) {
        await prisma.bitcoinPriceHistory.deleteMany({});

        const dataToInsert = priceData.map((item: [number, number]) => ({
          timestamp: BigInt(item[0]),
          date: new Date(item[0]),
          price: item[1]
        }));

        await prisma.bitcoinPriceHistory.createMany({
          data: dataToInsert
        });

        console.log(`Inserted ${dataToInsert.length} Bitcoin price records`);
      }
    }

    const historicalData = await prisma.bitcoinPriceHistory.findMany({
      orderBy: { timestamp: 'asc' }
    });

    const formattedData = historicalData.map(record => [
      Number(record.timestamp),
      record.price
    ]);

    await redisHandler.set(`bitcoin-historical-price`, JSON.stringify(formattedData), { expirationTime: 10 * 60 }); 

    return NextResponse.json({
      data: formattedData,
      success: true,
    });

  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return NextResponse.json({
      message: 'Error fetching Bitcoin price',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } 
  } 