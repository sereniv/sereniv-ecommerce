"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js"
import { Chart } from "react-chartjs-2"
import { useTheme } from "next-themes"
import { Shimmer } from "@/components/ui/shimmer"
import TimelineSlider from "./timeline-slider"
import { getApiUrl } from "@/lib/utils"
import { TrendingUp } from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface HoldingsDataPoint {
  timestamp: number
  privateCompanies: number
  publicCompanies: number
  governments: number
  defi: number
  exchange: number
  etf: number
  total: number
}

type BitcoinHoldingsChartProps = {
  data?: HoldingsDataPoint[];
};

type ApiDataItem = [string, [number, number][]];

export default function BitcoinHoldingsChart({ data }: BitcoinHoldingsChartProps) {
  // Only use the data prop, do not fetch
  const [holdingsData, setHoldingsData] = useState<HoldingsDataPoint[]>([])
  const [allData, setAllData] = useState<HoldingsDataPoint[]>([])
  const [dateRange, setDateRange] = useState<[number, number]>([0, 0])
  const { theme } = useTheme()

  useEffect(() => {
    if (data && data.length > 0) {
      setAllData(data)
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      const minDate = Math.max(data[0].timestamp, oneYearAgo);
      const maxDate = data[data.length - 1].timestamp;
      setDateRange([minDate, maxDate])
      const filteredData = data.filter(item =>
        item.timestamp >= minDate && item.timestamp <= maxDate
      );
      setHoldingsData(filteredData)
    } else {
      setAllData([])
      setHoldingsData([])
    }
  }, [data])

  const filterDataByRange = useCallback((startDate: number, endDate: number) => {
    const filteredData = allData.filter(item =>
      item.timestamp >= startDate && item.timestamp <= endDate
    );
    setHoldingsData(filteredData)
  }, [allData])

  const handleSliderChange = useCallback((newRange: [number, number]) => {
    setDateRange(newRange)
    filterDataByRange(newRange[0], newRange[1])
  }, [filterDataByRange])

  const isDarkMode = theme === 'dark'

  const colors = {
    privateColor: isDarkMode ? 'rgba(96, 165, 250, 0.8)' : 'rgba(59, 130, 246, 0.8)',
    privateBorder: isDarkMode ? '#60a5fa' : '#3b82f6',
    publicColor: isDarkMode ? 'rgba(251, 191, 36, 0.8)' : 'rgba(245, 158, 11, 0.8)',
    publicBorder: isDarkMode ? '#fbbf24' : '#f59e0b',
    governmentColor: isDarkMode ? 'rgba(52, 211, 153, 0.9)' : 'rgba(16, 185, 129, 0.9)',
    governmentBorder: isDarkMode ? '#34d399' : '#10b981',
    defiColor: isDarkMode ? 'rgba(139, 92, 246, 0.8)' : 'rgba(124, 58, 237, 0.8)',
    defiBorder: isDarkMode ? '#8b5cf6' : '#7c3aed',
    exchangeColor: isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.8)',
    exchangeBorder: isDarkMode ? '#ef4444' : '#dc2626',
    etfColor: isDarkMode ? 'rgba(6, 182, 212, 0.8)' : 'rgba(8, 145, 178, 0.8)',
    etfBorder: isDarkMode ? '#06b6d4' : '#0891b2',

    gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    textColor: isDarkMode ? '#e2e8f0' : '#475569',
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: '2-digit',
      month: 'short'
    })
  }

  const formatYAxisLabel = (value: number): string => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else {
      return value.toString();
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const chartData = {
    labels: holdingsData.map(item => formatDate(item.timestamp)),
    datasets: [
      {
        label: 'ETF',
        data: holdingsData.map(item => item.etf),
        backgroundColor: colors.etfColor,
        borderColor: colors.etfBorder,
        fill: 'stack',
        pointRadius: 0,
        pointHoverRadius: isMobile ? 5 : 7,
        tension: 0.4,
        borderWidth: 2.5,
        hoverBorderWidth: 3
      },
      {
        label: 'Exchange',
        data: holdingsData.map(item => item.exchange),
        backgroundColor: colors.exchangeColor,
        borderColor: colors.exchangeBorder,
        fill: 'stack',
        pointRadius: 0,
        pointHoverRadius: isMobile ? 5 : 7,
        tension: 0.4,
        borderWidth: 2.5,
        hoverBorderWidth: 3
      },
      {
        label: 'DeFi',
        data: holdingsData.map(item => item.defi),
        backgroundColor: colors.defiColor,
        borderColor: colors.defiBorder,
        fill: 'stack',
        pointRadius: 0,
        pointHoverRadius: isMobile ? 5 : 7,
        tension: 0.4,
        borderWidth: 2.5,
        hoverBorderWidth: 3
      },
      {
        label: 'Government',
        data: holdingsData.map(item => item.governments),
        backgroundColor: colors.governmentColor,
        borderColor: colors.governmentBorder,
        fill: 'stack',
        pointRadius: 0,
        pointHoverRadius: isMobile ? 5 : 7,
        tension: 0.4,
        borderWidth: 2.5,
        hoverBorderWidth: 3
      },
      {
        label: 'Public',
        data: holdingsData.map(item => item.publicCompanies),
        backgroundColor: colors.publicColor,
        borderColor: colors.publicBorder,
        fill: 'stack',
        pointRadius: 0,
        pointHoverRadius: isMobile ? 5 : 7,
        tension: 0.4,
        borderWidth: 2.5,
        hoverBorderWidth: 3
      },
      {
        label: 'Private',
        data: holdingsData.map(item => item.privateCompanies),
        backgroundColor: colors.privateColor,
        borderColor: colors.privateBorder,
        fill: 'stack',
        pointRadius: 0,
        pointHoverRadius: isMobile ? 5 : 7,
        tension: 0.4,
        borderWidth: 2.5,
        hoverBorderWidth: 3
      }
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
    },
    layout: {
      padding: {
        top: isMobile ? 10 : 20,
        right: isMobile ? 10 : 20,
        bottom: isMobile ? 10 : 20,
        left: isMobile ? 10 : 20
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textColor,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : 10,
          font: {
            size: isMobile ? 10 : 12,
            weight: 500,
          },
          padding: isMobile ? 8 : 12,
        },
      },
      y: {
        stacked: true,
        grid: {
          color: colors.gridColor,
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textColor,
          callback: (value: any) => `${formatYAxisLabel(value)}`,
          font: {
            size: isMobile ? 10 : 12,
            weight: 500,
          },
          padding: isMobile ? 8 : 12,
        },
        position: 'right' as const,
        beginAtZero: true,
      },
    },
    plugins: {
      filler: {
        propagate: true
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          pointStyle: 'rect',
          padding: isMobile ? 16 : 24,
          font: {
            size: isMobile ? 11 : 13,
            weight: 600,
          },
          boxWidth: 15,
          boxHeight: 10,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        titleColor: isDarkMode ? '#f1f5f9' : '#0f172a',
        bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
        borderWidth: 2,
        padding: isMobile ? 8 : 12,
        cornerRadius: 12,
        titleFont: {
          size: isMobile ? 11 : 13,
          weight: 700,
        },
        bodyFont: {
          size: isMobile ? 10 : 12,
          weight: 600,
        },
        displayColors: true,
        usePointStyle: true,
        pointStyle: 'rect',
        callbacks: {
          title: function (context: any) {
            return `BTC Holdings - ${context[0].label}`;
          },
          label: function (context: any) {
            const percentage = ((context.parsed.y / context.chart.data.datasets.reduce((acc: number, dataset: any, index: number) => {
              return acc + (context.chart.getDatasetMeta(index).data[context.dataIndex] ? dataset.data[context.dataIndex] : 0);
            }, 0)) * 100).toFixed(1);
            return `${context.dataset.label}: ${formatYAxisLabel(context.parsed.y)} (${percentage}%)`;
          },
          footer: function (tooltipItems: any) {
            let sum = 0;
            tooltipItems.forEach(function (tooltipItem: any) {
              sum += tooltipItem.parsed.y;
            });
            return `Total: ${formatYAxisLabel(sum)} BTC`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        capBezierPoints: false,
      },
      point: {
        radius: 0,
        hoverRadius: isMobile ? 6 : 8,
        hoverBorderWidth: 3,
        borderWidth: 2,
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    hover: {
      mode: 'nearest' as const,
      intersect: false,
      animationDuration: 200,
    }
  }


  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        {data && data.length > 0 ? (
          <Chart type='line' data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mx-auto" />
                <TrendingUp className="absolute inset-0 m-auto h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">No data available for this chart.</p>
            </div>
          </div>
        )}
      </div>

      {!data && <TimelineSlider allData={allData} dateRange={dateRange} handleSliderChange={handleSliderChange} />}
    </div>
  )
}
