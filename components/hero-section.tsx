"use client"

import { useEffect, useState } from "react"
import { Shimmer } from "@/components/ui/shimmer"
import { Pie } from "react-chartjs-2"
import { useTheme } from "next-themes"
import { registerChartComponents, pieChartComponents } from "@/lib/chart-config"
import { formatCurrency, formatNumber, formatNumberWithDecimals, formatNumberWithSuffix, getApiUrl } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bitcoin, Building2, DollarSign, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Mail, Send } from "lucide-react"


ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

registerChartComponents(pieChartComponents)

interface HoldingsData {
  publicCompanies: number
  privateCompanies: number
  governments: number
  defi: number
  exchange: number
  etf: number
}

interface EntitiesData {
  publicCompanies: number
  privateCompanies: number
  governments: number
  defi: number
  exchange: number
  etf: number
}

interface HoldingsPercentages {
  publicCompanies: number
  privateCompanies: number
  governments: number
  defi: number
  exchange: number
  etf: number
}

interface EntitiesPercentages {
  publicCompanies: number
  privateCompanies: number
  governments: number
  defi: number
  exchange: number
  etf: number
}

interface SummaryData {
  totalEntities: number
  totalBitcoin: number
  holdingsData: HoldingsData
  entitiesData: EntitiesData
  holdingsPercentages: HoldingsPercentages
  entitiesPercentages: EntitiesPercentages
  totalValueUSD: number
  lastUpdated: string
  source: string
  bitcoinMarketCap: number
  bitcoinPrice: number
  topCountriesByEntityCount: any[];
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
  iconColor = "text-orange-600 dark:text-orange-400",
  iconBgColor = "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30",
  iconHoverBgColor = "group-hover:from-orange-100 group-hover:to-orange-200/50 dark:group-hover:from-orange-900/70 dark:group-hover:to-orange-800/40",
  hoverTextColor = "",
}: {
  icon: any
  label: string
  value: string
  description?: string
  iconColor?: string
  iconBgColor?: string
  iconHoverBgColor?: string
  hoverTextColor?: string
}) => (
  <Card className={cn(
    "group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10",
    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-500/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
    "touch-none sm:touch-auto min-h-[48px] sm:min-h-[56px]"
  )}>
    <div className="absolute top-0 right-0 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-4 translate-x-4 sm:-translate-y-12 sm:translate-x-12 transition-transform duration-700 group-hover:scale-150" />
    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-0.5 sm:pb-1 p-1 sm:p-2">
      <div className="space-y-1 flex-1 min-w-0">
        <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300 truncate">
          {label}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground/70 leading-relaxed hidden sm:block">{description}</p>
        )}
      </div>
      <div className={cn(
        "relative p-1.5 sm:p-2 rounded-lg transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ml-2",
        iconBgColor,
        iconHoverBgColor,
        "shadow-lg group-hover:shadow-xl min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
      )}>
        <Icon className={cn("h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-300", iconColor)} />
      </div>
    </CardHeader>
    <CardContent className="relative p-1 sm:p-2 pt-0">
      <div className="space-y-0.5">
        <div className={cn(
          "text-xs sm:text-lg md:text-xl font-bold transition-all duration-300 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
          hoverTextColor || "group-hover:from-orange-600 group-hover:to-orange-500 dark:group-hover:from-orange-400 dark:group-hover:to-orange-300"
        )}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground/70 leading-relaxed hidden sm:block">{description}</p>
        )}
      </div>
    </CardContent>
  </Card>
)

interface HeroSectionProps {
  onPieChartFilter?: (category: string) => void;
  initialSummaryData?: any;
}

export default function HeroSection({ onPieChartFilter, initialSummaryData }: HeroSectionProps = {}) {

  const [summary, setSummary] = useState<SummaryData | null>(initialSummaryData || null)
  const [summaryLoading, setSummaryLoading] = useState(!initialSummaryData)

  const { theme } = useTheme()
  const getThemeColors = () => {
    const isDarkMode = theme === 'dark';

    if (typeof window === 'undefined') return {
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'],
      textColor: isDarkMode ? '#ffffff' : '#000000',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      cardBackground: isDarkMode ? '#1f2937' : '#ffffff'
    };

    const textColor = isDarkMode ? '#ffffff' : '#000000';
    const borderColor = isDarkMode ? '#374151' : '#e5e7eb';
    const cardBackground = isDarkMode ? '#1f2937' : '#ffffff';
    const backgroundColor = [
      '#f59e0b',  // Public - Orange/Yellow
      '#3b82f6',  // Private - Blue
      '#10b981',  // Government - Green
      '#8b5cf6',  // DeFi - Purple
      '#ef4444',  // Exchange - Red
      '#06b6d4',  // ETF - Cyan
    ];

    return { backgroundColor, textColor, borderColor, cardBackground };
  };

  const fetchSummaryData = async () => {
    try {
      setSummaryLoading(true)
      const apiUrl = getApiUrl(`/summary`);
      console.log('Fetching summary from:', apiUrl);
      const response = await fetch(apiUrl);
      const data = await response.json()

      if (data.success) {
        const summaryData = data.data.summary;
        setSummary(summaryData);
        console.log('Summary data loaded:', summaryData);
      } else {
        console.error('API returned error:', data);
      }
    } catch (error) {
      console.error('Error fetching Bitcoin treasuries data:', error)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch data if no initial data was provided
    if (!initialSummaryData) {
      fetchSummaryData()
    }
  }, [initialSummaryData])

  const holdingsChartData = {
    labels: [
      'Public',
      'Private',
      'Government',
      'DeFi',
      'Exchange',
      'ETF',
    ],
    datasets: [
      {
        data: summary ? [
          summary.holdingsData.publicCompanies || 0,
          summary.holdingsData.privateCompanies || 0,
          summary.holdingsData.governments || 0,
          summary.holdingsData.defi || 0,
          summary.holdingsData.exchange || 0,
          summary.holdingsData.etf || 0,
        ] : [0, 0, 0, 0, 0, 0],
        backgroundColor: getThemeColors().backgroundColor,
        borderWidth: 3,
        borderColor: getThemeColors().borderColor,
        hoverOffset: 15,
        hoverBorderWidth: 4,
        spacing: 2,
      },
    ],
  }

  const entitiesChartData = {
    labels: [
      'Public',
      'Private',
      'Government',
      'DeFi',
      'Exchange',
      'ETF',
    ],
    datasets: [
      {
        data: summary ? [
          summary.entitiesData.publicCompanies || 0,
          summary.entitiesData.privateCompanies || 0,
          summary.entitiesData.governments || 0,
          summary.entitiesData.defi || 0,
          summary.entitiesData.exchange || 0,
          summary.entitiesData.etf || 0,
        ] : [0, 0, 0, 0, 0, 0],
        backgroundColor: getThemeColors().backgroundColor,
        borderWidth: 3,
        borderColor: getThemeColors().borderColor,
        hoverOffset: 15,
        hoverBorderWidth: 4,
        spacing: 2,
      },
    ],
  }

  const getChartOptions = () => {
    const colors = getThemeColors();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    return {
      onClick: (event: any, elements: any, chart: any) => {
        if (elements.length > 0 && onPieChartFilter) {
          const elementIndex = elements[0].index;
          const label = chart.data.labels[elementIndex];
          onPieChartFilter(label);
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            boxWidth: isMobile ? 8 : 12,
            boxHeight: isMobile ? 8 : 12,
            padding: isMobile ? 8 : 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: isMobile ? 10 : 13,
              weight: 600,
              family: 'Inter, sans-serif'
            },
            color: colors.textColor,
            generateLabels: function (chart: any) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label: string, i: number) => {
                  const dataset = data.datasets[0];
                  const value = dataset.data[i];
                  const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);

                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor,
                    lineWidth: dataset.borderWidth,
                    pointStyle: 'circle',
                    hidden: isNaN(dataset.data[i]) || dataset.data[i] === 0,
                    index: i,
                    fontColor: colors.textColor
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          enabled: true,
          external: undefined,
          mode: 'nearest' as const,
          intersect: false,
          position: 'average' as const,
          backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: theme === 'dark' ? '#ffffff' : '#000000',
          bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          borderWidth: 1,
          padding: isMobile ? 10 : 16,
          cornerRadius: isMobile ? 8 : 12,
          titleFont: {
            size: isMobile ? 12 : 15,
            weight: 600,
            family: 'Inter, sans-serif'
          },
          bodyFont: {
            size: isMobile ? 11 : 14,
            family: 'Inter, sans-serif'
          },
          displayColors: true,
          boxWidth: isMobile ? 8 : 12,
          boxHeight: isMobile ? 8 : 12,
          usePointStyle: true,
          xAlign: 'center' as const,
          yAlign: 'center' as const,
          callbacks: {
            label: function (context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);

              const isBTCChart = context.chart.canvas.parentElement?.parentElement?.querySelector('h3')?.textContent?.includes('BTC Holdings');
              const formattedValue = isBTCChart ?
                `${formatNumberWithSuffix(value)} BTC` :
                `${value} entities`;

              if (isMobile) {
                return [
                  `${label}`,
                  `${formattedValue}`,
                  `${percentage}%`
                ];
              }

              return `${label}: ${formattedValue} (${percentage}%)`;
            },
            title: function (context: any) {
              if (isMobile) {
                return '';
              }
              return context[0]?.chart?.canvas?.parentElement?.parentElement?.querySelector('h3')?.textContent?.replace(' Distribution', '') || '';
            }
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true,
      cutout: '55%',
      radius: '95%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
        easing: 'easeOutQuart' as const
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      onHover: (event: any, elements: any, chart: any) => {
        if (onPieChartFilter) {
          chart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
      }
    }
  }

  const topCountries = summary?.topCountriesByEntityCount || [];
  const countryLabels = topCountries.map((c: any) => c.countryName);
  const getTypeData = (type: string) => topCountries.map((c: any) => c[type] || 0);
  const typeColors = getThemeColors().backgroundColor;
  const barChartData = {
    labels: countryLabels,
    datasets: [
      {
        label: 'Public',
        data: getTypeData('public'),
        backgroundColor: typeColors[0],
        stack: 'Stack 0',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        label: 'Private',
        data: getTypeData('private'),
        backgroundColor: typeColors[1],
        stack: 'Stack 0',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        label: 'Government',
        data: getTypeData('government'),
        backgroundColor: typeColors[2],
        stack: 'Stack 0',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        label: 'DeFi',
        data: getTypeData('defi'),
        backgroundColor: typeColors[3],
        stack: 'Stack 0',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        label: 'Exchange',
        data: getTypeData('exchange'),
        backgroundColor: typeColors[4],
        stack: 'Stack 0',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        label: 'ETF',
        data: getTypeData('etf'),
        backgroundColor: typeColors[5],
        stack: 'Stack 0',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const colors = getThemeColors();
  const barChartOptions = {
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: isMobile ? 10 : 13,
            weight: 600,
            family: 'Inter, sans-serif'
          },
          color: colors.textColor,
          boxWidth: isMobile ? 8 : 12,
          boxHeight: isMobile ? 8 : 12,
          padding: isMobile ? 8 : 20,
        }
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true,
        stacked: true,
        ticks: { color: colors.textColor, font: { weight: 'bold' as const } },
        grid: { color: theme === 'dark' ? '#1f2937' : '#f3f4f6' },
      },
      y: {
        stacked: true,
        ticks: { color: colors.textColor, font: { weight: 'bold' as const } },
        grid: { color: theme === 'dark' ? '#1f2937' : '#f3f4f6' },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart: any) => {
      if (!chart.getDatasetMeta(0).data.length) return;
      const { ctx, chartArea: { width, height } } = chart;
      ctx.save();
      const value = chart.options.plugins.centerText?.value || '';
      const label = chart.options.plugins.centerText?.label || '';
      const themeColors = getThemeColors();
      const valueFontSize = width < 400 ? 'bold 1rem Inter, sans-serif' : 'bold 2rem Inter, sans-serif';
      const labelFontSize = width < 400 ? 'normal 0.7rem Inter, sans-serif' : 'normal 0.9rem Inter, sans-serif';
      ctx.font = valueFontSize;
      ctx.fillStyle = themeColors.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, width / 2, height / 2 - (width < 400 ? 4 : 8));
      ctx.font = labelFontSize;
      ctx.fillStyle = theme === 'dark' ? '#aaa' : '#555';
      ctx.fillText(label, width / 2, height / 2 + (width < 400 ? 10 : 16));
      ctx.restore();
    }
  };

  ChartJS.register(centerTextPlugin);

  const barEndTotalPlugin = {
    id: 'barEndTotal',
    afterDatasetsDraw: (chart: any) => {
      const { ctx, data } = chart;
      const metaSets = chart.getSortedVisibleDatasetMetas();
      if (!metaSets.length) return;
      if (chart.options.indexAxis !== 'y') return;
      const themeColors = getThemeColors();
      const textColor = themeColors.textColor;
      data.labels.forEach((label: string, idx: number) => {
        let total = 0;
        let x = 0;
        let y = 0;
        metaSets.forEach((meta: any) => {
          const bar = meta.data[idx];
          if (bar) {
            total += meta._dataset.data[idx] || 0;
            x = bar.x;
            y = bar.y;
          }
        });
        ctx.save();
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(total, x + 8, y);
        ctx.restore();
      });
    }
  };

  ChartJS.register(barEndTotalPlugin);

  return (
    <div className="bg-gradient-to-br from-orange-50 via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fed7aa_1px,transparent_1px),linear-gradient(to_bottom,#fed7aa_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#431407_1px,transparent_1px),linear-gradient(to_bottom,#431407_1px,transparent_1px)]" />
      </div>

      <div className="container mx-auto py-6 px-2 sm:px-6 lg:px-8">
        <div className="space-y-6">

          {/* Hero Section */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-300/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

            {/* Contact Info - Top Right */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex gap-2">
              <a
                href="mailto:bitcoin@droomdroom.com"
                className="p-1 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center group/contact"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400 group-hover/contact:scale-110 transition-transform duration-200" />
                <span className="text-xs sm:text-sm text-white/90 group-hover/contact:text-white transition-colors hidden sm:inline ml-1">
                  bitcoin@droomdroom.com
                </span>
              </a>

              <a
                href="https://t.me/ronakdroom"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center group/contact"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400 group-hover/contact:scale-110 transition-transform duration-200" />
                <span className="text-xs sm:text-sm text-white/90 group-hover/contact:text-white transition-colors hidden sm:inline ml-1">
                  @ronakdroom
                </span>
              </a>



            </div>

            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-24 translate-x-24 sm:-translate-y-48 sm:translate-x-48 transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full translate-y-16 -translate-x-16 sm:translate-y-32 sm:-translate-x-32 transition-transform duration-1000 group-hover:scale-110" />

            <CardContent className="relative p-3 sm:p-8 md:px-12 md:py-4">
              <div className="text-center space-y-3 sm:space-y-8">
                <div className="space-y-2">
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent leading-tight">
                    Bitcoin Holdings by Entity
                  </h1>
                  <p className="text-xs sm:text-lg max-w-4xl mx-auto text-muted-foreground/90 leading-relaxed px-2 sm:px-4">
                    Comprehensive data and insights on the Bitcoin holdings of public and private companies, funds, and government entities worldwide.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Metrics Grid */}
          {summaryLoading ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Building2}
                label="Total Entities"
                value={summary?.totalEntities?.toString() || "0"}
                description="Public, Private & Government"
                iconColor="text-orange-600 dark:text-orange-400"
                iconBgColor="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30"
                iconHoverBgColor="group-hover:from-orange-100 group-hover:to-orange-200/50 dark:group-hover:from-orange-900/70 dark:group-hover:to-orange-800/40"
                hoverTextColor="group-hover:from-orange-600 group-hover:to-orange-500 dark:group-hover:from-orange-400 dark:group-hover:to-orange-300"
              />

              <MetricCard
                icon={Bitcoin}
                label="Total Bitcoin Held"
                value={`${formatNumberWithSuffix(summary?.totalBitcoin || 0)} BTC`}
                description={`${((summary?.holdingsPercentages?.publicCompanies || 0) + (summary?.holdingsPercentages?.privateCompanies || 0) + (summary?.holdingsPercentages?.governments || 0)).toFixed(2)}% of total supply`}
                iconColor="text-orange-600 dark:text-orange-400"
                iconBgColor="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30"
                iconHoverBgColor="group-hover:from-orange-100 group-hover:to-orange-200/50 dark:group-hover:from-orange-900/70 dark:group-hover:to-orange-800/40"
                hoverTextColor="group-hover:from-orange-600 group-hover:to-orange-500 dark:group-hover:from-orange-400 dark:group-hover:to-orange-300"
              />

              <MetricCard
                icon={DollarSign}
                label="Total Value (USD)"
                value={`${formatNumberWithSuffix(summary?.totalValueUSD || 0)} USD`}
                description={`Based on BTC price: ${formatCurrency(summary?.bitcoinPrice || 0)}`}
                iconColor="text-orange-600 dark:text-orange-400"
                iconBgColor="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30"
                iconHoverBgColor="group-hover:from-orange-100 group-hover:to-orange-200/50 dark:group-hover:from-orange-900/70 dark:group-hover:to-orange-800/40"
                hoverTextColor="group-hover:from-orange-600 group-hover:to-orange-500 dark:group-hover:from-orange-400 dark:group-hover:to-orange-300"
              />

              <MetricCard
                icon={Percent}
                label="Bitcoin Market Cap"
                value={`${formatNumberWithSuffix(summary?.bitcoinMarketCap || 0)} USD`}
                description={`Last updated: ${new Date(summary?.lastUpdated || new Date()).toLocaleDateString()}`}
                iconColor="text-orange-600 dark:text-orange-400"
                iconBgColor="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30"
                iconHoverBgColor="group-hover:from-orange-100 group-hover:to-orange-200/50 dark:group-hover:from-orange-900/70 dark:group-hover:to-orange-800/40"
                hoverTextColor="group-hover:from-orange-600 group-hover:to-orange-500 dark:group-hover:from-orange-400 dark:group-hover:to-orange-300"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
            {/* Holdings Chart */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16 transition-transform duration-700 group-hover:scale-150" />
              <CardContent className="relative p-3 sm:p-8">
                <div className="text-center mb-3 sm:mb-6">
                  <h3 className="text-xs sm:text-2xl font-bold mb-1 sm:mb-3 bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent leading-tight">
                    Entities Holdings Distribution
                  </h3>

                  {onPieChartFilter && (
                    <p className="text-xs text-muted-foreground/60 mt-1 hidden sm:block">
                      Click on chart slices to filter tables below
                    </p>
                  )}
                </div>
                <div className="w-full h-48 sm:h-80 mx-auto relative overflow-visible">
                  {summaryLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shimmer className="w-32 h-32 sm:w-64 sm:h-64 rounded-full" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {/* @ts-ignore */}
                      <Pie
                        key={theme}
                        data={holdingsChartData}
                        options={{
                          ...getChartOptions(),
                          plugins: {
                            ...getChartOptions().plugins,
                            // @ts-ignore
                            centerText: {
                              value: formatNumberWithSuffix(summary?.totalBitcoin || 0),
                              label: 'BTC',
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Entities Chart */}
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16 transition-transform duration-700 group-hover:scale-150" />
              <CardContent className="relative p-3 sm:p-8">
                <div className="text-center mb-3 sm:mb-6">
                  <h3 className="text-xs sm:text-2xl font-bold mb-1 sm:mb-3 bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent leading-tight">
                    Entities Distribution
                  </h3>
                  {/* Remove the value and label here */}
                  {onPieChartFilter && (
                    <p className="text-xs text-muted-foreground/60 mt-1 hidden sm:block">
                      Click on chart slices to filter tables below
                    </p>
                  )}
                </div>
                <div className="w-full h-48 sm:h-80 mx-auto relative overflow-visible">
                  {summaryLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shimmer className="w-32 h-32 sm:w-64 sm:h-64 rounded-full" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {/* @ts-ignore */}
                      <Pie
                        key={theme}
                        data={entitiesChartData}
                        options={{
                          ...getChartOptions(),
                          plugins: {
                            ...getChartOptions().plugins,
                            // @ts-ignore
                            centerText: {
                              value: formatNumberWithSuffix(summary?.totalEntities || 0),
                              label: 'Entities',
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16 transition-transform duration-700 group-hover:scale-150" />

              <CardContent className="relative p-3 sm:p-8">
                <div className="text-center mb-3 sm:mb-6">
                  <h3 className="text-xs sm:text-2xl font-bold mb-1 sm:mb-3 bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent leading-tight">
                    Top Countries by Number of Entities
                  </h3>
                </div>
                <div className="w-full h-48 sm:h-80 mx-auto relative overflow-visible">
                  {summaryLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shimmer className="w-32 h-32 sm:w-64 sm:h-64 rounded-full" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Bar data={barChartData} options={barChartOptions} key={theme} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCardShimmer = () => (
  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-sm min-h-[90px] sm:min-h-[100px]">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-3 p-2 sm:p-4">
      <Shimmer className="h-3 sm:h-4 w-20 sm:w-24 rounded" />
      <div className="p-2 sm:p-3 rounded-full bg-muted/20 min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center">
        <Shimmer className="h-4 w-4 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="relative p-2 sm:p-4 pt-0">
      <Shimmer className="h-4 sm:h-8 w-16 sm:w-24 mb-1 sm:mb-2 rounded" />
      <Shimmer className="h-2 sm:h-3 w-20 sm:w-36 rounded sm:hidden" />
    </CardContent>
  </Card>
)