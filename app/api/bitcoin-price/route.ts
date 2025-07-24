import { NextRequest, NextResponse } from 'next/server';
import { redisHandler } from '@/lib/redis';
import axios from 'axios';

const BITCOIN_CMC_ID = '1';

  async function getBitcoinPrice() {
  if (await redisHandler.get(`price_${BITCOIN_CMC_ID}_busy`)) {
    return redisHandler.get(`price_${BITCOIN_CMC_ID}`);
  }
  
  await redisHandler.set(`price_${BITCOIN_CMC_ID}_busy`, 'true');
  
  try {
    const response = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${BITCOIN_CMC_ID}`, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
      }
    });
    
    const data = {
      price: response.data.data[BITCOIN_CMC_ID].quote.USD.price,
      price_change_1h: response.data.data[BITCOIN_CMC_ID].quote.USD.percent_change_1h,
      price_change_24h: response.data.data[BITCOIN_CMC_ID].quote.USD.percent_change_24h,
      price_change_7d: response.data.data[BITCOIN_CMC_ID].quote.USD.percent_change_7d,
      price_change_30d: response.data.data[BITCOIN_CMC_ID].quote.USD.percent_change_30d,
      price_change_90d: response.data.data[BITCOIN_CMC_ID].quote.USD.percent_change_90d,
      volume: response.data.data[BITCOIN_CMC_ID].quote.USD.volume_24h,
      volume_change_24h: response.data.data[BITCOIN_CMC_ID].quote.USD.volume_change_24h,
      market_cap: response.data.data[BITCOIN_CMC_ID].quote.USD.market_cap,
      circulating_supply: response.data.data[BITCOIN_CMC_ID].circulating_supply,
      max_supply: response.data.data[BITCOIN_CMC_ID].max_supply,
      total_supply: response.data.data[BITCOIN_CMC_ID].total_supply,
      fdv: response.data.data[BITCOIN_CMC_ID].quote.USD.fully_diluted_market_cap
    };
    
    await redisHandler.set(`price_${BITCOIN_CMC_ID}`, data, { expirationTime: 10 * 60 }); 
    await redisHandler.delete(`price_${BITCOIN_CMC_ID}_busy`);
    
    return data;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    await redisHandler.delete(`price_${BITCOIN_CMC_ID}_busy`);
    throw error;
  }
}

async function getBitcoinPriceRedis(force: boolean = false) {
  if (!force && await redisHandler.get(`price_${BITCOIN_CMC_ID}`)) {
    const cachedData = await redisHandler.get(`price_${BITCOIN_CMC_ID}`);
    return cachedData;
  }
  
  const data = await getBitcoinPrice();
  return data;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const force = searchParams.get('force') === 'true';
  
  try {
    const data = await getBitcoinPriceRedis(force);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return NextResponse.json({ message: 'Error fetching Bitcoin price' }, { status: 500 });
  }
} 