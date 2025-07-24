import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/utils';
import axios from 'axios';

export interface BitcoinPriceData {
  price: number;
  price_change_1h: number;
  price_change_24h: number;
  price_change_7d: number;
  price_change_30d: number;
  price_change_90d: number;
  volume: number;
  volume_change_24h: number;
  market_cap: number;
  circulating_supply: number;
  max_supply: number;
  total_supply: number;
  fdv: number;
}

interface UseBitcoinReturn {
  data: BitcoinPriceData | null;
  loading: boolean;
  error: Error | null;
  refetch: (force?: boolean) => Promise<void>;
}

export function useBitcoin(refreshInterval = 5 * 60 * 1000): UseBitcoinReturn {
  const [data, setData] = useState<BitcoinPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (force = false) => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/bitcoin-price'));
      if (response.data) {
        setData(response.data as BitcoinPriceData);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch Bitcoin data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const refetch = async (force = false) => {
    await fetchData(force);
  };

  return {
    data,
    loading,
    error,
    refetch
  };
} 