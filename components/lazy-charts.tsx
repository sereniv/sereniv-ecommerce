"use client"

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { Shimmer } from './ui/shimmer'
import { TrendingUp } from 'lucide-react'

const ChartLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mx-auto" />
        <TrendingUp className="absolute inset-0 m-auto h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground">Loading chart...</p>
    </div>
  </div>
)

export const LazyBitcoinPriceChart = dynamic(
  () => import('./bitcoin-price-chart'),
  {
    loading: ChartLoader,
    ssr: false
  }
)

export const LazyBitcoinHoldingsChart = dynamic(
  () => import('./bitcoin-holdings-chart'),
  {
    loading: ChartLoader,
    ssr: false
  }
)

export const LazyColumnTreemapChart = dynamic(
  () => import('./column-treemap-chart'),
  {
    loading: ChartLoader,
    ssr: false
  }
)

export const LazyRowTreemapChart = dynamic(
  () => import('./row-treemap-chart'),
  {
    loading: ChartLoader,
    ssr: false
  }
)

export const LazyHoldingsChart = dynamic(
  () => import('./holdings-chart'),
  {
    loading: ChartLoader,
    ssr: false
  }
)

export const LazyStockChart = dynamic(
  () => import('./stock-chart'),
  {
    loading: ChartLoader,
    ssr: false
  }
) 