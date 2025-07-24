"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Shimmer } from "@/components/ui/shimmer"
import {
  ArrowUp,
  ArrowDown,
  Globe,
  Info,
  Calendar,
  TrendingUp,
  Briefcase,
  DollarSign,
  ExternalLink,
  Building2,
  Landmark,
  Users,
  Bitcoin,
  Star,
  ChevronDown,
  Shield,
  FileText,
  Check,
} from "lucide-react"
import EntityHoldingsChart from "@/components/holdings-chart"
import EntityStockChart from "@/components/stock-chart"
import BalanceSheet from "@/components/balance-sheet"
import { faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getApiUrl, formatNumberWithSuffix, formatNumberWithSmartDecimals, formatNumberInMillions } from "@/lib/utils"
import type { Entity } from "@/lib/types/entity"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Copy } from "lucide-react"
import EmbedModal from "./embed-modal";

interface StaticEntityPageProps {
  entity: any
  similarEntities: any[]
}

const formatHoldingDuration = (holdingSinceDate: string | null): string => {
  if (!holdingSinceDate) return ''

  try {
    const date = new Date(holdingSinceDate)
    date.setDate(date.getDate())
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error processing holding date:', error)
    return holdingSinceDate || ''
  }
}

function sanitizeHtml(html: string) {
  // First, let's extract and preserve anchor tags before processing
  const anchorTags: string[] = [];
  const anchorPlaceholders: string[] = [];
  
  // Find all anchor tags and replace them with placeholders
  let processedHtml = html.replace(/<a[^>]*>.*?<\/a>/gi, (match) => {
    const placeholder = `__ANCHOR_${anchorTags.length}__`;
    anchorTags.push(match);
    anchorPlaceholders.push(placeholder);
    return placeholder;
  });
  
  // List of allowed HTML tags that we want to preserve (excluding 'a' since we handle it separately)
  const allowedTags = [
    'b', 'strong',           // Bold
    'i', 'em',              // Italic
    'u',                    // Underline
    'ul', 'ol', 'li',       // Lists
    'br',                   // Line breaks
    'p',                    // Paragraphs
    'span'                  // Spans (for styling)
  ];
  
  // Remove all HTML tags except the allowed ones
  // This will remove all the complex styling but preserve basic formatting
  let sanitized = processedHtml.replace(/<[^>]*>/g, (tag) => {
    const tagName = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase();
    if (tagName && allowedTags.includes(tagName)) {
      // For allowed tags, keep only the tag name without attributes (except for basic ones)
      if (tagName === 'br') return '<br>';
      if (tag.startsWith('</')) return `</${tagName}>`;
      return `<${tagName}>`;
    }
    return ''; // Remove disallowed tags
  });
  
  // Clean up excessive whitespace and HTML entities
  sanitized = sanitized.replace(/&nbsp;/g, ' ');
  sanitized = sanitized.replace(/\s+/g, ' ');
  sanitized = sanitized.trim();
  
  // Restore anchor tags
  anchorPlaceholders.forEach((placeholder, index) => {
    sanitized = sanitized.replace(placeholder, anchorTags[index]);
  });
  
  return sanitized;
}

export default function StaticEntityPage({ entity: initialEntity, similarEntities: initialSimilarEntities }: StaticEntityPageProps) {
  const [entity, setEntity] = useState<Entity | null>(initialEntity)
  const [timeSeries, setTimeSeries] = useState<any[]>(initialEntity?.entityTimeSeries || [])
  const [balanceSheet, setBalanceSheet] = useState<any[]>(initialEntity?.balanceSheet || [])
  const [loading, setLoading] = useState(false)
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(false)
  const [balanceSheetLoading, setBalanceSheetLoading] = useState(false)
  const [holdingSince, setHoldingSince] = useState<string | null>(initialEntity?.holdingSince || "1y")
  const [stockChartSince, setStockChartSince] = useState<string | null>(initialEntity?.holdingSince || "1y")
  const [similarEntities, setSimilarEntities] = useState<any[]>(initialSimilarEntities)
  const [similarLoading, setSimilarLoading] = useState(false)
  const [embedOpen, setEmbedOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()


  const getEntityIcon = (type: string) => {
    switch (type) {
      case "PUBLIC":
        return Building2
      case "PRIVATE":
        return Users
      case "GOVERNMENT":
        return Landmark
      default:
        return Building2
    }
  }

  // Mobile-first responsive utility
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    trend,
    trendValue,
    className = "",
    iconColor = "text-orange-600 dark:text-orange-400",
    iconBgColor = "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30",
    iconHoverBgColor = "group-hover:from-orange-100 group-hover:to-orange-200/50 dark:group-hover:from-orange-900/70 dark:group-hover:to-orange-800/40",
    hoverTextColor = "group-hover:from-orange-600 group-hover:to-orange-500 dark:group-hover:from-orange-400 dark:group-hover:to-orange-300",
    description,
  }: {
    icon: any
    label: string
    value: string
    trend?: "up" | "down"
    trendValue?: string
    className?: string
    iconColor?: string
    iconBgColor?: string
    iconHoverBgColor?: string
    hoverTextColor?: string
    description?: string
  }) => (
    <Card className={cn(
      "group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-500/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
      "touch-none sm:touch-auto min-h-[70px] sm:min-h-[80px]",
      className
    )}>
      <div className="absolute top-0 right-0 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-4 translate-x-4 sm:-translate-y-12 sm:translate-x-12 transition-transform duration-700 group-hover:scale-150" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-1.5 sm:p-3">
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
      <CardContent className="relative p-1.5 sm:p-3 pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className={cn(
              "text-xs sm:text-xs md:text-sm font-bold transition-all duration-300 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text truncate",
              hoverTextColor
            )}>
              {value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed sm:hidden">{description}</p>
            )}
          </div>
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md group-hover:shadow-lg transform group-hover:scale-105 ml-2",
                trend === "up"
                  ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 border border-emerald-500/30 dark:text-emerald-400"
                  : "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-700 border border-rose-500/30 dark:text-rose-400",
              )}
            >
              {trend === "up" ? <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span className="truncate">{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const balanceSheetData = useMemo(() => {
    const dateMap = new Map()
    return balanceSheet?.filter(entry => {
      if (!dateMap.has(entry.date)) {
        dateMap.set(entry.date, true)
        return true
      }
      return false
    })
  }, [balanceSheet])

  const currentBtcHoldings = useMemo(() => {
    if (!balanceSheetData || balanceSheetData.length === 0) return entity?.bitcoinHoldings || 0

    const mostRecentEntry = [...balanceSheetData]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return mostRecentEntry?.btcBalance || entity?.bitcoinHoldings || 0
  }, [balanceSheetData, entity?.bitcoinHoldings])

  const recentDevelopments = useMemo(() => {
    if (!balanceSheetData || balanceSheetData.length === 0) return []

    const sortedData = [...balanceSheetData]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return sortedData.map((entry, index) => {
      const date = new Date(entry.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })

      const fullDataIndex = balanceSheetData.findIndex(item => item.date === entry.date)
      const calculatedChange = fullDataIndex < balanceSheetData.length - 1 ? entry.btcBalance - balanceSheetData[fullDataIndex + 1].btcBalance : entry.change
      const changeType = calculatedChange > 0 ? 'increased' : calculatedChange < 0 ? 'decreased' : 'maintained'
      const changeText = calculatedChange !== 0 ? `${changeType} by ${Math.abs(calculatedChange).toFixed(2)} BTC` : 'maintained position'

      let development = `${date}: Bitcoin holdings ${changeText} to ${entry.btcBalance} BTC`

      // Add cost basis information if it exists and is greater than 0
      if (entry.costBasis && entry.costBasis > 0) {
        const avgCostPerBTC = entry.costBasis / entry.btcBalance
        development += ` with cost basis of $${formatNumberWithSuffix(entry.costBasis)}`
      }

      if (entry.marketPrice && entry.marketPrice > 0) {
        development += ` (BTC @ $${formatNumberWithSuffix(entry.marketPrice)})`
      }

      if (entry.stockPrice && entry.stockPrice > 0 && entity?.type === 'PUBLIC') {
        development += `, stock price $${entry.stockPrice.toFixed(2)}`
      }

      return development
    })
  }, [balanceSheetData, entity?.type])

  const SimilarEntityCard = ({ ent }: { ent: any }) => (
    <Link href={`/${ent.slug}`}>
      <Card className={cn(
        "group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-500/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "touch-none sm:touch-auto min-h-[100px] cursor-pointer"
      )}>
        <div className="absolute top-0 right-0 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-4 translate-x-4 sm:-translate-y-12 sm:translate-x-12 transition-transform duration-700 group-hover:scale-150" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-1.5 sm:p-3">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300 truncate flex items-center gap-2">
              <span className="text-base">{ent.countryFlag}</span>
              <span className="truncate">{ent.name}</span>
              {ent.ticker && ent.ticker !== 'N/A' && (
                <Badge className="ml-auto text-[10px] sm:text-xs bg-orange-100 dark:bg-orange-900/40 border border-orange-200/40 dark:border-orange-800/40 text-orange-700 dark:text-orange-300">
                  {ent.ticker}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative p-1.5 sm:p-3 pt-0">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm sm:text-base font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 bg-clip-text text-transparent group-hover:from-orange-500 group-hover:to-orange-600 dark:group-hover:from-orange-300 dark:group-hover:to-orange-400 transition-all duration-300">
                {ent.bitcoinHoldings ? ent.bitcoinHoldings.toLocaleString() : 'N/A'} BTC
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fed7aa_1px,transparent_1px),linear-gradient(to_bottom,#fed7aa_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#431407_1px,transparent_1px),linear-gradient(to_bottom,#431407_1px,transparent_1px)]" />
      </div>

      <div className="container mx-auto py-4 sm:py-6 md:py-8 lg:py-12 px-2 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-10 lg:space-y-12">
          {/* Hero Section */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-300/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 md:-translate-y-32 md:translate-x-32 transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full translate-y-12 -translate-x-12 sm:translate-y-16 sm:-translate-x-16 md:translate-y-24 md:-translate-x-24 transition-transform duration-1000 group-hover:scale-110" />

            <CardContent className="relative px-2 py-3 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6 lg:gap-8">
                <div className="space-y-2 sm:space-y-6 flex-1">
                  <div className="space-y-2 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-3 mb-2 sm:mb-4">
                      {(() => {
                        const EntityIcon = getEntityIcon(entity?.type || "")
                        return (
                          <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                            <EntityIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                          </div>
                        )
                      })()}
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 bg-clip-text text-transparent leading-tight break-words">
                          {entity?.name}
                        </h1>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                      {entity?.countryFlag && (
                        <Badge
                          variant="secondary"
                          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200/50 dark:border-orange-800/50 shadow-sm hover:shadow-md transition-all duration-300 touch-manipulation"
                        >
                          <span className="text-xs sm:text-sm mr-1 sm:mr-1.5">{entity?.countryFlag}</span>
                          <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                            {entity?.countryName}
                          </span>
                        </Badge>
                      )}
                      {entity?.ticker && entity?.ticker !== 'N/A' && (
                        <Badge
                          variant="secondary"
                          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-100/50 to-orange-200/30 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-300/50 dark:border-orange-700/50 text-orange-700 dark:text-orange-300 shadow-sm hover:shadow-md transition-all duration-300 touch-manipulation"
                        >
                          {entity?.ticker}
                        </Badge>
                      )}
                      {entity?.holdingSince && <Badge
                        variant="secondary"
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-green-100/50 to-emerald-100/30 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-300/50 dark:border-green-700/50 shadow-sm hover:shadow-md transition-all duration-300 touch-manipulation"
                      >
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-300">
                          Holding bitcoin since {formatHoldingDuration(entity?.holdingSince)}
                        </span>
                      </Badge>}

                      {entity?.entityLinks && entity.entityLinks.length > 0 && (() => {
                        const officialLinks = entity.entityLinks.filter((link: any) => link.type === "OFFICIAL")
                        const unofficialLinks = entity.entityLinks.filter((link: any) => link.type === "UNOFFICIAL" || link.type === null)

                        return (
                          <>
                            {officialLinks.map((link: any, index: number) => (
                              <a
                                key={`official-${link.text || index}`}
                                href={link.url}
                                target="_blank"
                                className="group/link inline-flex items-center bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold touch-manipulation"
                                rel="noopener noreferrer"
                                aria-label={`Visit ${link.text} for ${entity?.name} (opens in new tab)`}
                              >
                                {link.url.toLowerCase().includes("x.com") || link.url.toLowerCase().includes("twitter.com") ? (
                                   <FontAwesomeIcon
                                   icon={faXTwitter}
                                   className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 transition-transform duration-300 group-hover/link:scale-110 text-blue-600 dark:text-blue-400"
                                 />
                                ) : (
                                  <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 transition-transform duration-300 group-hover/link:scale-110 text-blue-600 dark:text-blue-400" />
                                )}
                                {link.url.toLowerCase().includes("x.com") || link.url.toLowerCase().includes("twitter.com") ? (
                                  <span className="text-blue-700 dark:text-blue-300 truncate">
                                    @{(() => {
                                      const url = new URL(link.url)
                                      const pathname = url.pathname.split('/')
                                      return pathname.filter((segment: string) => segment.length > 0)[0] || link.text
                                    })()}
                                  </span>
                                ) : (
                                  <span className="text-blue-700 dark:text-blue-300 truncate">{link.text}</span>
                                )}
                              </a>
                            ))}

                            {/* Unofficial Links - Grouped in dropdown */}
                            {unofficialLinks.length > 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="group/link inline-flex items-center bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold touch-manipulation"
                                    aria-label={`View ${unofficialLinks.length} additional social links for ${entity?.name}`}
                                  >
                                    <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 transition-transform duration-300 group-hover/link:scale-110 text-blue-600 dark:text-blue-400" />
                                    <span className="text-blue-700 dark:text-blue-300 truncate">
                                      Relevant Links ({unofficialLinks.length})
                                    </span>
                                    <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1 sm:ml-1.5 transition-transform duration-300 group-hover/link:rotate-180 text-blue-600 dark:text-blue-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="w-56 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border border-orange-200/50 dark:border-orange-800/50 shadow-xl"
                                >
                                  <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground">
                                    Additional Resources
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-orange-200/50 dark:bg-orange-800/50" />
                                  {unofficialLinks.map((link: any, index: number) => (
                                    <DropdownMenuItem key={`unofficial-${link.text || index}`} asChild>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-orange-50/50 dark:hover:bg-orange-950/30 transition-colors duration-200 cursor-pointer"
                                        aria-label={`Visit ${link.text} for ${entity?.name} (opens in new tab)`}
                                      >
                                        {link.url.toLowerCase().includes("x.com") || link.url.toLowerCase().includes("twitter.com") ? (
                                          <>
                                            <FontAwesomeIcon
                                              icon={faXTwitter}
                                              className="h-3 w-3 text-muted-foreground"
                                            />
                                            <span className="truncate">
                                              @{(() => {
                                                // Extract username from Twitter/X URL
                                                const url = new URL(link.url)
                                                const pathname = url.pathname.split('/')
                                                // Return the first non-empty path segment
                                                return pathname.filter((segment: string) => segment.length > 0)[0] || link.text
                                              })()}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <Globe className="h-3 w-3 text-muted-foreground" />
                                            <span className="truncate">{link.text}</span>
                                          </>
                                        )}
                                        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground/50" />
                                      </a>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Enhanced Holdings Display */}
                <div className="relative lg:min-w-[180px] xl:min-w-[200px] w-full lg:w-auto">
                  <div className="absolute inset-0 rounded-md sm:rounded-2xl bg-gradient-to-br from-orange-500/15 to-orange-300/15 blur-sm transform scale-100" />
                  <div className="relative p-2 sm:p-6 rounded-md sm:rounded-2xl border border-orange-200/30 dark:border-orange-800/30 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm shadow-md hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10 transition-all duration-500">
                    <div className="flex flex-row items-center justify-between sm:flex-col sm:text-center sm:space-y-4">
                      <div className="flex items-center gap-1.5 sm:justify-center sm:gap-2.5">
                        <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30">
                          <Bitcoin className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-xs sm:text-base font-bold text-muted-foreground uppercase tracking-tight sm:tracking-wider">
                          BTC Holdings
                        </p>
                      </div>

                      <div className="flex flex-row items-center gap-2 sm:flex-col sm:text-center">
                        <p className="text-sm sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 bg-clip-text text-transparent leading-tight">
                          {currentBtcHoldings ? (() => {
                            const value = currentBtcHoldings;
                            const isWholeNumber = Number.isInteger(value);
                            return isWholeNumber
                              ? `${value}`
                              : `${(Number(value.toFixed(4)))}`;
                          })() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
            {entity?.profitLossPercentage && <MetricCard
              icon={!entity?.profitLossPercentage || entity.profitLossPercentage >= 0 ? ArrowUp : ArrowDown}
              label="Total P&L"
              value={entity?.profitLossPercentage ? `${entity.profitLossPercentage >= 0 ? '+' : ''}${formatNumberWithSmartDecimals(entity?.profitLossPercentage)}%` : "N/A"}
              trend={!entity?.profitLossPercentage || entity.profitLossPercentage >= 0 ? "up" : "down"}
              description="Total profit/loss on Bitcoin holdings"
              iconColor={!entity?.profitLossPercentage || entity.profitLossPercentage >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}
              iconBgColor={!entity?.profitLossPercentage || entity.profitLossPercentage >= 0 ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30" : "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/50 dark:to-rose-900/30"}
              iconHoverBgColor={!entity?.profitLossPercentage || entity.profitLossPercentage >= 0 ? "group-hover:from-emerald-100 group-hover:to-emerald-200/50 dark:group-hover:from-emerald-900/70 dark:group-hover:to-emerald-800/40" : "group-hover:from-rose-100 group-hover:to-rose-200/50 dark:group-hover:from-rose-900/70 dark:group-hover:to-rose-800/40"}
              hoverTextColor={!entity?.profitLossPercentage || entity.profitLossPercentage >= 0 ? "group-hover:from-emerald-600 group-hover:to-emerald-500 dark:group-hover:from-emerald-400 dark:group-hover:to-emerald-300" : "group-hover:from-rose-600 group-hover:to-rose-500 dark:group-hover:from-rose-400 dark:group-hover:to-rose-300"}
            />}

            {entity?.avgCostPerBTC && <MetricCard
              icon={DollarSign}
              label="Average Cost per BTC"
              value={entity?.avgCostPerBTC ? `$${formatNumberWithSmartDecimals(entity?.avgCostPerBTC)}` : "N/A"}
              description="Average price paid for each Bitcoin"
            />}

            {entity?.sharePrice && <MetricCard
              icon={TrendingUp}
              label="Share Price"
              value={entity?.sharePrice ? `$${formatNumberWithSmartDecimals(entity?.sharePrice)}` : "N/A"}
              description="Current trading price per share"
              iconColor="text-blue-600 dark:text-blue-400"
              iconBgColor="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30"
              iconHoverBgColor="group-hover:from-blue-100 group-hover:to-blue-200/50 dark:group-hover:from-blue-900/70 dark:group-hover:to-blue-800/40"
              hoverTextColor="group-hover:from-blue-600 group-hover:to-blue-500 dark:group-hover:from-blue-400 dark:group-hover:to-blue-300"
            />}

            {entity?.marketCap && <MetricCard
              icon={Briefcase}
              label="Market Cap"
              value={entity?.marketCap ? `$${formatNumberInMillions(entity?.marketCap)}` : "N/A"}
              description="Total market capitalization"
              iconColor="text-purple-600 dark:text-purple-400"
              iconBgColor="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30"
              iconHoverBgColor="group-hover:from-purple-100 group-hover:to-purple-200/50 dark:group-hover:from-purple-900/70 dark:group-hover:to-purple-800/40"
              hoverTextColor="group-hover:from-purple-600 group-hover:to-purple-500 dark:group-hover:from-purple-400 dark:group-hover:to-purple-300"
            />}

            {entity?.enterpriseValue && <MetricCard
              icon={Info}
              label="Enterprise Value"
              value={entity?.enterpriseValue ? `$${formatNumberInMillions(entity?.enterpriseValue)}` : "N/A"}
              description="Market cap plus debt minus cash"
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBgColor="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30"
              iconHoverBgColor="group-hover:from-indigo-100 group-hover:to-indigo-200/50 dark:group-hover:from-indigo-900/70 dark:group-hover:to-indigo-800/40"
              hoverTextColor="group-hover:from-indigo-600 group-hover:to-indigo-500 dark:group-hover:from-indigo-400 dark:group-hover:to-indigo-300"
            />}

            {entity?.mNav && <MetricCard
              icon={TrendingUp}
              label="NAV Multiple"
              value={entity?.mNav ? formatNumberWithSmartDecimals(entity?.mNav) : "N/A"}
              description="Net Asset Value multiplier"
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBgColor="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30"
              iconHoverBgColor="group-hover:from-emerald-100 group-hover:to-emerald-200/50 dark:group-hover:from-emerald-900/70 dark:group-hover:to-emerald-800/40"
              hoverTextColor="group-hover:from-emerald-600 group-hover:to-emerald-500 dark:group-hover:from-emerald-400 dark:group-hover:to-emerald-300"
            />}

            {entity?.marketCapPercentage && <MetricCard
              icon={DollarSign}
              label="BTC / Market Cap"
              value={
                entity?.marketCapPercentage ? `${formatNumberWithSmartDecimals(entity?.marketCapPercentage)}%` : "N/A"
              }
              description="Bitcoin holdings as % of market cap"
              iconColor="text-teal-600 dark:text-teal-400"
              iconBgColor="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/50 dark:to-teal-900/30"
              iconHoverBgColor="group-hover:from-teal-100 group-hover:to-teal-200/50 dark:group-hover:from-teal-900/70 dark:group-hover:to-teal-800/40"
              hoverTextColor="group-hover:from-teal-600 group-hover:to-teal-500 dark:group-hover:from-teal-400 dark:group-hover:to-teal-300"
            />}
          </div>

          {/* Enhanced About Section */}
          {entity && (
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 transition-transform duration-700 group-hover:scale-150" />
              <CardHeader className="relative px-2 py-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-3 sm:gap-4">
                  <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  <span className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    {(entity && entity.entityAbout && entity.entityAbout.length > 0 && entity.entityAbout[0].title) ||
                      `About ${entity?.name}`}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6 sm:space-y-8 px-2 sm:p-6">
                <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                  {entity &&
                    entity.entityAbout &&
                    entity.entityAbout.length > 0 &&
                    entity?.entityAbout?.[0]?.content?.split(/\n|<br>/).map((paragraph, index) => (
                      <div 
                        key={index} 
                        className="text-sm sm:text-lg leading-relaxed text-muted-foreground mb-6"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(paragraph.trim()) }}
                      />
                    ))}
                </div>

                {(recentDevelopments.length > 0 ||
                  (entity?.entityAbout && entity.entityAbout.length > 0 && entity.entityAbout[0].keyPoints && entity.entityAbout[0].keyPoints.length > 0)) && (
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl">
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16" />
                      <div className="relative">
                        <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                          <span className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                            Recent Developments
                          </span>
                        </h3>
                        <ul className="space-y-3 sm:space-y-4">
                          {recentDevelopments.length > 0 ?
                            recentDevelopments.map((development, index) => (
                              <li key={index} className="flex items-start gap-3 sm:gap-4 text-sm sm:text-base leading-relaxed group/item">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 mt-2.5 sm:mt-3 flex-shrink-0 shadow-lg transition-transform duration-300 group-hover/item:scale-150" />
                                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">{development}</span>
                              </li>
                            )) :
                            entity?.entityAbout?.[0]?.keyPoints?.map((point: string, index: number) => (
                              <li key={index} className="flex items-start gap-3 sm:gap-4 text-sm sm:text-base leading-relaxed group/item">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 mt-2.5 sm:mt-3 flex-shrink-0 shadow-lg transition-transform duration-300 group-hover/item:scale-150" />
                                <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">{point}</span>
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Charts and Data Sections */}
          {entity && (
            <div className="space-y-4 sm:space-y-10 lg:space-y-12">
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 transition-transform duration-700 group-hover:scale-150" />
                <CardHeader className="relative px-2 py-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                      {entity?.name} — Bitcoin Holdings Over Time
                    </CardTitle>
                    <Badge variant="outline" className="w-fit  sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold border-orange-300/50 dark:border-orange-700/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-orange-900/30 dark:to-orange-800/20 shadow-lg hover:shadow-xl transition-all duration-300 text-orange-700 dark:text-orange-300">
                      {holdingSince || "Aug 2020"} - Present
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative px-2 sm:p-6">
                  <div className="h-[500px] rounded-xl sm:rounded-2xl overflow-hidden border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl">
                    {timeSeriesLoading ? (
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
                      <EntityHoldingsChart
                        entity={{ ...entity, entityTimeSeries: timeSeries }}
                        holdingChartSince={holdingSince}
                        setHoldingChartSince={setHoldingSince}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {entity && entity.type === "PUBLIC" && (
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 transition-transform duration-700 group-hover:scale-150" />
                  <CardHeader className="relative px-2 py-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                        {entity?.name} — Stock vs BTC Dynamics
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="w-fit px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold border-orange-300/50 dark:border-orange-700/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-orange-900/30 dark:to-orange-800/20 shadow-lg hover:shadow-xl transition-all duration-300 text-orange-700 dark:text-orange-300"
                      >
                        {stockChartSince || "Aug 2020"} - Present
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative px-2 sm:p-6">
                    <div className="h-[500px] rounded-xl sm:rounded-2xl overflow-hidden border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl">
                      {timeSeriesLoading ? (
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
                        <EntityStockChart
                          entity={{ ...entity, entityTimeSeries: timeSeries }}
                          stockChartSince={stockChartSince}
                          setStockChartSince={setStockChartSince}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(balanceSheetLoading || (balanceSheetData && balanceSheetData.length > 0)) && (
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 transition-transform duration-700 group-hover:scale-150" />
                  <CardHeader className="relative px-2 py-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-3 sm:gap-4">
                        <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                          <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                        </div>
                        <span className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                          Balance Sheet History
                        </span>
                      </CardTitle>
                      <EmbedModal
                        open={embedOpen}
                        onOpenChange={setEmbedOpen}
                        embedCode={typeof window !== 'undefined' && entity?.slug ? `<iframe src=\"${window.location.origin}/bitcoin-treasury-tracker/embed/balance-sheet-table/${entity.slug}\" width=\"100%\" height=\"500\" frameborder=\"0\" style=\"border:0;\" allowfullscreen></iframe>` : ''}
                        copied={copied}
                        setCopied={setCopied}
                      >
                        <Button
                          variant="outline"
                          className="w-fit px-3 py-1.5 text-xs sm:text-sm font-semibold border-orange-300/50 dark:border-orange-700/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-orange-900/30 dark:to-orange-800/20 shadow-lg duration-300 text-orange-700 dark:text-orange-300 hover:none"
                          onClick={() => setCopied(false)}
                        >
                          Embed
                        </Button>
                      </EmbedModal>
                    </div>
                  </CardHeader>
                  <CardContent className="relative px-2 sm:p-6">
                    <div
                      className={cn(
                        "rounded-xl sm:rounded-2xl overflow-hidden border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl  overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/30 dark:scrollbar-thumb-orange-400/30 scrollbar-track-transparent hover:scrollbar-thumb-orange-500/50 dark:hover:scrollbar-thumb-orange-400/50",
                      )}
                    >
                      {balanceSheetLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center space-y-4">
                            <div className="relative">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mx-auto" />
                              <Briefcase className="absolute inset-0 m-auto h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 animate-pulse" />
                            </div>
                            <p className="text-sm text-muted-foreground">Loading balance sheet...</p>
                          </div>
                        </div>
                      ) : (
                        <BalanceSheet loading={balanceSheetLoading} data={balanceSheetData || []} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="mt-10">
            <CardHeader className="relative px-2 py-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-3 sm:gap-4">
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">Similar Entities</span>
              </CardTitle>
            </CardHeader>
            {similarLoading ? (
              <div className="flex justify-center items-center py-8">
                <Shimmer className="w-32 h-8" />
              </div>
            ) : similarEntities.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2 sm:p-6">
                {similarEntities.map((ent: any) => (
                  <SimilarEntityCard key={ent.slug} ent={ent} />
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">No similar entities found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}