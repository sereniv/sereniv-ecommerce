"use client"

import { useEffect, useState, useCallback } from "react"
import { Line } from "react-chartjs-2"
import { useTheme } from "next-themes"
import { Shimmer } from "@/components/ui/shimmer"
import { formatNumberWithSuffix, getApiUrl } from "@/lib/utils"
import { registerChartComponents, lineChartComponents } from "@/lib/chart-config"
import TimelineSlider from "./timeline-slider"
import { TrendingUp } from "lucide-react"

registerChartComponents(lineChartComponents)

interface PriceDataPoint {
  timestamp: number
  price: number
}

export default function BitcoinPriceChart() {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [allData, setAllData] = useState<PriceDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<[number, number]>([0, 0])
  const { theme } = useTheme()

  useEffect(() => {
    const fetchBitcoinPriceData = async () => {
      try {
        setLoading(true)
        const response = await fetch(getApiUrl(`/bitcoin-historical-price`));
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          const formattedData = data.data.map((item: [number, number]) => ({
            timestamp: item[0],
            price: item[1],
            privateCompanies: 0,
            publicCompanies: 0,
            governments: 0,
            total: item[1]
          }))
          
          formattedData.sort((a: PriceDataPoint, b: PriceDataPoint) => a.timestamp - b.timestamp)
          
          setAllData(formattedData)
          
          if (formattedData.length > 0) {
            const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
            const minDate = Math.max(formattedData[0].timestamp, oneYearAgo);
            const maxDate = formattedData[formattedData.length - 1].timestamp;
            setDateRange([minDate, maxDate])

            const filteredData = formattedData.filter((item: PriceDataPoint) =>
              item.timestamp >= minDate && item.timestamp <= maxDate
            );
            setPriceData(filteredData)
          }
        }
      } catch (error) {
        console.error("Error fetching Bitcoin price data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBitcoinPriceData()
  }, [])

  const filterDataByRange = useCallback((startDate: number, endDate: number) => {
    const filteredData = allData.filter(item =>
      item.timestamp >= startDate && item.timestamp <= endDate
    );
    setPriceData(filteredData)
  }, [allData])

  const handleSliderChange = useCallback((newRange: [number, number]) => {
    setDateRange(newRange)
    filterDataByRange(newRange[0], newRange[1])
  }, [filterDataByRange])

  const getThemeColors = () => {
    const isDarkMode = theme === 'dark'
    
    return {
      gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      textColor: isDarkMode ? '#e2e8f0' : '#475569',
      lineColor: isDarkMode ? '#fb923c' : '#ea580c',
      fillColor: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : 'rgba(234, 88, 12, 0.10)',
      pointColor: isDarkMode ? '#fb923c' : '#ea580c',
      pointBorderColor: isDarkMode ? '#ffffff' : '#000000',
    }
  }

  const colors = getThemeColors()


  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const chartData = {
    labels: priceData.map(item => new Date(item.timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    })),
    datasets: [
      {
        label: 'Bitcoin Price (USD)',
        data: priceData.map(item => item.price),
        borderColor: colors.lineColor,
        backgroundColor: colors.fillColor,
        pointBackgroundColor: colors.pointColor,
        pointBorderColor: colors.pointBorderColor,
        pointBorderWidth: 2,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: isMobile ? 6 : 8,
        pointHoverBorderWidth: 3,
      }
    ]
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
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        titleColor: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
        borderColor: theme === 'dark' ? '#475569' : '#cbd5e1',
        borderWidth: 2,
        padding: isMobile ? 14 : 18,
        cornerRadius: 16,
        displayColors: false,
        titleFont: {
          size: isMobile ? 13 : 15,
          weight: 700,
        },
        bodyFont: {
          size: isMobile ? 12 : 14,
          weight: 600,
        },
        callbacks: {
          title: function(context: any) {
            return `Bitcoin Price - ${context[0].label}`;
          },
          label: function(context: any) {
            return `Price: $${context.parsed.y.toLocaleString()}`;
          }
        }
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
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: colors.gridColor,
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            size: isMobile ? 10 : 12,
            weight: 500,
          },
          padding: isMobile ? 8 : 12,
          callback: function(value: any) {
            return `$${formatNumberWithSuffix(value)}`;
          }
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: isMobile ? 6 : 8,
        hoverBorderWidth: 3,
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
        {loading ? (
           <div className="flex items-center justify-center h-full">
           <div className="text-center space-y-4">
             <div className="relative">
               <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mx-auto" />
               <TrendingUp className="absolute inset-0 m-auto h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 animate-pulse" />
             </div>
             <p className="text-sm text-muted-foreground">Loading chart data...</p>
           </div>
         </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {!loading && <TimelineSlider allData={allData} dateRange={dateRange} handleSliderChange={handleSliderChange} />}
    </div>
  )
}
