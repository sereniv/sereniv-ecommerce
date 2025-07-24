"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  LineController,
  BarElement,
  BarController,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from "chart.js"
import { Chart } from "react-chartjs-2"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"
import { Shimmer } from "@/components/ui/shimmer"
import { Entity, EntityTimeSeries } from "@/lib/types/entity"
import { TimeSeriesType } from "@prisma/client"
import { formatNumberWithSuffix } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { TrendingUp, Activity, Calendar, BarChart3, LineChart, TrendingDown } from "lucide-react"
import TimelineSlider from "./timeline-slider"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface StockDataPoint {
  timestamp: number
  stockPrice: number
  btcPrice: number
  navMultiplier: number
  privateCompanies: number
  publicCompanies: number
  governments: number
  total: number
}

export default function EntityStockChart({
  entity,
  stockChartSince,
  setStockChartSince
}: {
  entity: Entity;
  stockChartSince: string | null;
  setStockChartSince: (dateString: string | null) => void;
}) {

  const [stockData, setStockData] = useState<StockDataPoint[]>([])
  const [allStockData, setAllStockData] = useState<StockDataPoint[]>([])
  const [loading, setLoading] = useState(true)
    const [selectedRange, setSelectedRange] = useState<string>(stockChartSince ? 'all' : '1y')
  const [dateRange, setDateRange] = useState<[number, number]>([0, 0])
  const [sliderDateRange, setSliderDateRange] = useState<[number, number]>([0, 0])
  const [isUsingSlider, setIsUsingSlider] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [chartKey, setChartKey] = useState(0)
  const { theme } = useTheme()

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 640
      const newIsTablet = width >= 640 && width < 1024
      
      if (newIsMobile !== isMobile || newIsTablet !== isTablet) {
        setIsMobile(newIsMobile)
        setIsTablet(newIsTablet)
        setChartKey(prev => prev + 1)
      }
    }

    checkScreenSize()

    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [isMobile, isTablet])

  const filterDataByRange = useCallback((startDate: number, endDate: number) => {
    const filteredData = allStockData.filter(item =>
      item.timestamp >= startDate && item.timestamp <= endDate
    );
    setStockData(filteredData)
  }, [allStockData])

  const handleSliderChange = useCallback((newRange: [number, number]) => {    
    const isValidRange = newRange[0] !== newRange[1] && newRange[0] < newRange[1];
    if (!isValidRange) return;

    setIsUsingSlider(true)
    setSelectedRange('custom')
    setSliderDateRange(newRange)

    const filteredData = allStockData.filter(item =>
      item.timestamp >= newRange[0] && item.timestamp <= newRange[1]
    );
    setStockData(filteredData)
    
    setChartKey(prev => prev + 1)
    
  }, [allStockData])

  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true)
  
        const processedDataMap = new Map<number, Partial<StockDataPoint>>()
        
      
        
        if (!entity.entityTimeSeries || entity.entityTimeSeries.length === 0) {
          setAllStockData([]);
          setStockData([]);
          setDateRange([0, 0]);
          setSliderDateRange([0, 0]);
          setLoading(false);
          return;
        }
        
        entity.entityTimeSeries?.forEach((item: EntityTimeSeries) => {
          
          let timestamp: number;
          const rawTimestamp = item.timestamp.toString();
          
          const parsedTimestamp = parseInt(rawTimestamp, 10);
          
          if (rawTimestamp.length <= 10) {
            timestamp = parsedTimestamp * 1000; 
          } else {
            timestamp = parsedTimestamp; 
          }
          
          
          if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
            console.warn('StockChart: Invalid timestamp:', rawTimestamp, 'for entity:', entity.id);
            return;
          }
          
          if (!processedDataMap.has(timestamp)) {
            processedDataMap.set(timestamp, { timestamp })
          }
          const point = processedDataMap.get(timestamp)!

          switch (item.type) {
            case TimeSeriesType.STOCK_PRICE:
              point.stockPrice = item.value
              break
            case TimeSeriesType.BTC_PRICE:
              point.btcPrice = item.value
              break
            case TimeSeriesType.NAV_MULTIPLIER:
              point.navMultiplier = item.value
              break
          }
        })

        const chartFormattedData: StockDataPoint[] = Array.from(processedDataMap.values())
          .filter((p): p is StockDataPoint => p.timestamp !== undefined)
          .sort((a, b) => a.timestamp - b.timestamp)
          .reduce((acc: StockDataPoint[], current) => {
            const prev = acc[acc.length - 1];
            return [
              ...acc,
              {
                timestamp: current.timestamp,
                stockPrice: current.stockPrice ?? prev?.stockPrice ?? 0,
                btcPrice: current.btcPrice ?? prev?.btcPrice ?? 0,
                navMultiplier: current.navMultiplier ?? prev?.navMultiplier ?? 0,
                privateCompanies: 0,
                publicCompanies: 0,
                governments: 0,
                total: current.stockPrice ?? prev?.stockPrice ?? 0
              }
            ];
          }, []);
        
        setAllStockData(chartFormattedData)

        
        if (chartFormattedData.length > 0) {
          const dataMinDate = chartFormattedData[0].timestamp;
          const dataMaxDate = chartFormattedData[chartFormattedData.length - 1].timestamp;
          



          if (dataMinDate && dataMaxDate && dataMinDate < dataMaxDate) {
            if (!isUsingSlider) {
              const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
              const minDate = Math.max(dataMinDate, oneYearAgo);
              const maxDate = dataMaxDate;
              setDateRange([minDate, maxDate]);
            }
            
            if (sliderDateRange[0] === 0 && sliderDateRange[1] === 0) {
              setSliderDateRange([dataMinDate, dataMaxDate]);
            }
          }
        } else {
          setDateRange([0, 0]);
          setSliderDateRange([0, 0]);
        }

      } catch (error) {
        console.error("Error fetching or processing entity stock data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (entity && entity.id) {
      processData()
    } else {
      setLoading(false)
      setAllStockData([])
      setStockData([])
      console.warn("Entity ID is not available, cannot fetch stock data.")
    }
  }, [entity, stockChartSince])

  useEffect(() => {
    if (isUsingSlider || selectedRange === 'custom') {
      console.log('Button filtering blocked - slider active:', { isUsingSlider, selectedRange });
      return;
    }
    if (allStockData.length === 0) return;

    console.log('Running button filtering for:', selectedRange);

    const now = new Date();
    let startTime = 0;

    switch (selectedRange) {
      case '1m':
        startTime = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
        break;
      case '3m':
        startTime = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
        break;
      case '6m':
        startTime = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();
        break;
      case 'ytd':
        startTime = new Date(now.getFullYear(), 0, 1).getTime();
        break;
      case '1y':
        startTime = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
        break;
      case 'all':
      default:
        startTime = 0;
        break;
    }

    const filteredData = allStockData.filter(item => item.timestamp >= startTime);
    setStockData(filteredData);

    if (filteredData.length > 0) {
      const minTime = Math.max(startTime, filteredData[0].timestamp);
      const maxTime = filteredData[filteredData.length - 1].timestamp;
      setDateRange([minTime, maxTime]);
    }

  }, [allStockData, selectedRange, isUsingSlider, sliderDateRange]);

  useEffect(() => {
    if (!setStockChartSince) return;

    if (stockData && stockData.length > 0) {
      const startDate = new Date(stockData[0].timestamp);
      const formattedStartDate = startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      setStockChartSince(formattedStartDate);
    } else {
      setStockChartSince(selectedRange);
    }
  }, [stockData, selectedRange, setStockChartSince]);

  const isDarkMode = theme === 'dark'
  
  const colors = {
    stockColor: isDarkMode ? '#fb923c' : '#ea580c',
    btcColor: isDarkMode ? '#fbbf24' : '#f59e0b',
    navColor: isDarkMode ? '#34d399' : '#10b981', 
    gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    textColor: isDarkMode ? '#e2e8f0' : '#475569',
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: isMobile ? '2-digit' : 'numeric', 
      month: 'short'
    })
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
        hitRadius: 10,
      },
      line: {
        borderWidth: isMobile ? 2 : 3,
        tension: 0.4,
      }
    },
    scales: {
      x: {
        display: true,
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
          maxTicksLimit: isMobile ? 3 : 6,
          font: {
            size: isMobile ? 10 : 12,
            weight: 500,
          },
          padding: 8,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: false,
        title: {
          display: !isMobile,
          text: 'Stock Price',
          color: colors.stockColor,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: colors.textColor,
          font: {
            size: isMobile ? 10 : 11,
            weight: 500,
          },
          maxTicksLimit: isMobile ? 4 : 6,
          callback: function(value: string | number) {
            return formatNumberWithSuffix(typeof value === 'number' ? value : parseFloat(value));
          }
        },
        grid: {
          color: colors.gridColor,
          lineWidth: 1,
        },
        min: undefined, 
        max: undefined, 
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: isMobile ? 12 : 16,
          font: {
            size: isMobile ? 11 : 12,
            weight: 500,
          },
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#f1f5f9' : '#0f172a',
        bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 12,
          weight: 600,
        },
        bodyFont: {
          size: 11,
          weight: 500,
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatNumberWithSuffix(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
  }

  const chartData = {
    labels: stockData.map(item => formatDate(item.timestamp)),
    datasets: [
      {
        type: 'line' as const,
        label: 'Stock Price',
        yAxisID: 'y',
        data: stockData.map(item => item.stockPrice),
        backgroundColor: 'transparent',
        borderColor: colors.stockColor,
        borderWidth: isMobile ? 2 : 3,
        pointRadius: 0,
        tension: 0.4,
        pointHoverRadius: isMobile ? 4 : 6,
        pointHoverBackgroundColor: colors.stockColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
      {
        type: 'line' as const,
        label: 'BTC Price',
        yAxisID: 'y1',
        data: stockData.map(item => item.btcPrice),
        backgroundColor: 'transparent',
        borderColor: colors.btcColor,
        borderWidth: isMobile ? 2 : 3,
        pointRadius: 0,
        tension: 0.4,
        pointHoverRadius: isMobile ? 4 : 6,
        pointHoverBackgroundColor: colors.btcColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
      {
        type: 'line' as const,
        label: 'NAV Multiplier',
        yAxisID: 'y3',
        data: stockData.map(item => item.navMultiplier),
        backgroundColor: 'transparent',
        borderColor: colors.navColor,
        borderWidth: isMobile ? 2 : 3,
        pointRadius: 0,
        tension: 0.4,
        pointHoverRadius: isMobile ? 4 : 6,
        pointHoverBackgroundColor: colors.navColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      }
    ],
  }

  // Add additional y-axes for multi-line chart
  const fullChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: !isMobile,
          text: 'BTC Price',
          color: colors.btcColor,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            size: isMobile ? 9 : 10,
            weight: 500,
          },
          maxTicksLimit: isMobile ? 3 : 4,
          callback: function(value: string | number) {
            return formatNumberWithSuffix(typeof value === 'number' ? value : parseFloat(value));
          }
        },
        min: undefined,
        max: undefined,
      },
      y3: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: !isMobile,
          text: 'NAV Multiplier',
          color: colors.navColor,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            size: isMobile ? 9 : 10,
            weight: 500,
          },
          maxTicksLimit: isMobile ? 3 : 4,
          callback: function(value: string | number) {
            return formatNumberWithSuffix(typeof value === 'number' ? value : parseFloat(value));
          }
        },
        min: undefined,
        max: undefined,
      },
    }
  }

  const timeRanges = [
    { label: '1M', value: '1m', icon: Calendar },
    { label: '3M', value: '3m', icon: Calendar },
    { label: '6M', value: '6m', icon: TrendingUp },
    { label: 'YTD', value: 'ytd', icon: BarChart3 },
    { label: '1Y', value: '1y', icon: LineChart },
    { label: 'All', value: 'all', icon: Activity },
  ];

  return (
    <div className="w-full h-full flex flex-col"> 
      <div className="flex flex-nowrap justify-center sm:justify-end gap-1 sm:gap-1.5 mb-3 sm:mb-4 p-1.5 sm:p-2 bg-gradient-to-r from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm rounded-lg sm:rounded-xl border border-orange-200/50 dark:border-orange-800/50 shadow-lg overflow-x-auto">
        {timeRanges.map((range) => {
          const Icon = range.icon;
          const isSelected = selectedRange === range.value;
          return (
            <button
              key={range.value}
              onClick={() => {
                if (range.value === 'custom') { 
                  setSelectedRange('custom');
                } else {
                  setIsUsingSlider(false);
                  setSelectedRange(range.value);
                  if(setStockChartSince) setStockChartSince(range.value);
                  setChartKey(prev => prev + 1);
                }
              }}
              className={cn(
                "group relative px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-md sm:rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-400/50 touch-manipulation",
                "flex items-center gap-1 sm:gap-1.5 min-w-[45px] sm:min-w-[60px] justify-center whitespace-nowrap",
                isSelected
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400 text-white shadow-lg shadow-orange-500/25 dark:shadow-orange-400/25 scale-105"
                  : "bg-gradient-to-r from-background/60 to-background/40 text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-orange-400/5 hover:shadow-md border border-border/30 hover:border-orange-500/30 dark:hover:border-orange-400/30"
              )}
            >
              <Icon className={cn(
                "h-3 w-3 transition-all duration-300",
                isSelected ? "text-white" : "text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400"
              )} />
              <span className="font-bold tracking-wide">{range.label}</span>
              {isSelected && (
                <div className="absolute inset-0 rounded-md sm:rounded-lg bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Enhanced Chart Container */}
      <div className={cn(
        "w-full flex-grow relative",
        isMobile ? "min-h-[400px]" : "min-h-[400px]"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex-1">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-orange-200/50 dark:border-orange-800/50 shadow-xl">
                <div className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin" />
                      <TrendingDown className="absolute inset-0 m-auto h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Shimmer className="h-4 sm:h-5 w-28 sm:w-36 mx-auto rounded-full" />
                    <Shimmer className="h-3 w-20 sm:w-24 mx-auto rounded-full" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Loading stock data...
                  </div>
                </div>
              </div>
            ) : stockData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-orange-200/50 dark:border-orange-800/50 shadow-xl">
                <div className="text-center space-y-3 p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/50 dark:to-orange-900/30 flex items-center justify-center">
                    <LineChart className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">No Data Available</h3>
                    <p className="text-xs text-muted-foreground">
                      Stock data is not available for the selected time period.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-orange-200/30 dark:border-orange-800/30 shadow-inner">
                <div className="w-full h-full">
                  <Chart type="line" data={chartData} options={fullChartOptions} />
                </div>
              </div>
            )}
          </div>

          {!loading && allStockData.length > 0 && <TimelineSlider allData={allStockData} dateRange={isUsingSlider ? sliderDateRange : dateRange} handleSliderChange={handleSliderChange} />}
        </div>
      </div>
    </div>
  )
}
