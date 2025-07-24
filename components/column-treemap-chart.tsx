"use client"

import type React from "react"
import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shimmer } from "@/components/ui/shimmer"
import { useTheme } from "next-themes"
import type { Entity } from "@/lib/types/entity"
import { EntityType } from "@prisma/client"
import { BarChart3, DollarSign, Bitcoin, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EmbedModal from "./embed-modal";

interface TreemapChartProps {
  treemapData: Entity[]
  treemapLoading: boolean
  loading?: boolean
  setTreemapData?: (data: Entity[]) => void
  forceHoldingsOnly?: boolean
}

interface TreemapDataPoint {
  name: string
  size: number
  value: number
  displayValue: string
  type: EntityType
  symbol: string
  bitcoinHoldings: number
  usdValue: number
  supplyPercentage: number
  slug?: string
  countryFlag?: string | null
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface TreemapSection {
  title: string
  type: EntityType
  items: TreemapDataPoint[]
  x: number
  y: number
  width: number
  height: number
  color: string
  headerHeight: number
}

export default function ColumnTreemapChart({ treemapData, treemapLoading, loading, setTreemapData, forceHoldingsOnly }: TreemapChartProps) {
  const [activeTab, setActiveTab] = useState<"holdings" | "percentage" | "value">("holdings")
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 })
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const router = useRouter()
  const [embedOpen, setEmbedOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/bitcoin-treasury-tracker/embed/bitcoin-holdings-treemap" width="100%" height="100%" frameborder="0" style="border:0;" allowfullscreen></iframe>`

  const handleCellClick = (slug: string) => {
    if (slug) {
      router.push(`/${slug}`)
    }
  }

  console.log(treemapData)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const containerWidth = rect.width || 800
        const width = Math.max(containerWidth, 320)
        
        const isMobile = width < 640
        const isTablet = width >= 640 && width < 1024
        const isDesktop = width >= 1024 && width < 1440
        const isUltraWide = width >= 1440
        
        let height
        if (isMobile) {
          height = Math.max(width * 2.2, 800)
        } else if (isTablet) {
          height = Math.max(width * 1.0, 700)
        } else if (isDesktop) {
          height = Math.max(width * 0.8, 800)
        } else {
          height = Math.max(width * 0.7, 900)
        }
        
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (forceHoldingsOnly) setActiveTab("holdings")
  }, [forceHoldingsOnly])

  const getSectionColors = () => {
    const isDarkMode = theme === 'dark'
    return {
      [EntityType.PUBLIC]: {
        base: isDarkMode ? "#f59e0b" : "#f59e0b", 
        boxColor: isDarkMode ? "#f59e0b" : "#f59e0b",
        header: isDarkMode ? "#d97706" : "#d97706",
        headerText: isDarkMode ? "#F8FAFC" : "#0F172A",
        borderColor: isDarkMode ? "#fbbf24" : "#d97706",
        lightBg: isDarkMode ? "#451a03" : "#fef3c7",
      },
      [EntityType.PRIVATE]: {
        base: isDarkMode ? "#3b82f6" : "#3b82f6", 
        boxColor: isDarkMode ? "#3b82f6" : "#3b82f6",
        header: isDarkMode ? "#2563eb" : "#2563eb",
        headerText: isDarkMode ? "#F8FAFC" : "#0F172A",
        borderColor: isDarkMode ? "#60a5fa" : "#2563eb",
        lightBg: isDarkMode ? "#1e3a8a" : "#dbeafe",
      },
      [EntityType.GOVERNMENT]: {
        base: isDarkMode ? "#10b981" : "#10b981", 
        boxColor: isDarkMode ? "#10b981" : "#10b981",
        header: isDarkMode ? "#059669" : "#059669",
        headerText: isDarkMode ? "#F8FAFC" : "#0F172A",
        borderColor: isDarkMode ? "#34d399" : "#059669",
        lightBg: isDarkMode ? "#064e3b" : "#d1fae5",
      },
      [EntityType.DEFI]: {
        base: isDarkMode ? "#8b5cf6" : "#8b5cf6", 
        boxColor: isDarkMode ? "#8b5cf6" : "#8b5cf6",
        header: isDarkMode ? "#7c3aed" : "#7c3aed",
        headerText: isDarkMode ? "#F8FAFC" : "#0F172A",
        borderColor: isDarkMode ? "#a78bfa" : "#7c3aed",
        lightBg: isDarkMode ? "#3c1d5b" : "#ede9fe",
      },
      [EntityType.EXCHANGE]: {
        base: isDarkMode ? "#ef4444" : "#ef4444", 
        boxColor: isDarkMode ? "#ef4444" : "#ef4444",
        header: isDarkMode ? "#dc2626" : "#dc2626",
        headerText: isDarkMode ? "#F8FAFC" : "#0F172A",
        borderColor: isDarkMode ? "#f87171" : "#dc2626",
        lightBg: isDarkMode ? "#7f1d1d" : "#fee2e2",
      },
      [EntityType.ETF]: {
        base: isDarkMode ? "#06b6d4" : "#06b6d4", 
        boxColor: isDarkMode ? "#06b6d4" : "#06b6d4",
        header: isDarkMode ? "#0891b2" : "#0891b2",
        headerText: isDarkMode ? "#F8FAFC" : "#0F172A",
        borderColor: isDarkMode ? "#22d3ee" : "#0891b2",
        lightBg: isDarkMode ? "#164e63" : "#cffafe",
      },
    }
  }

  const getTextColors = () => {
    if (theme === "dark") {
      return {
        primary: "#F8FAFC", 
        secondary: "#CBD5E1", 
        muted: "#64748B", 
        sectionHeader: "#FFFFFF",
      }
    }
    return {
      primary: "#0F172A", 
      secondary: "#374151", 
      muted: "#6B7280", 
      sectionHeader: "#FFFFFF",
    }
  }

  const typeLabels: Record<EntityType, string> = {
    [EntityType.PUBLIC]: "Public",
    [EntityType.PRIVATE]: "Private",
    [EntityType.GOVERNMENT]: "Government",
    [EntityType.DEFI]: "DeFi",
    [EntityType.EXCHANGE]: "Exchange",
    [EntityType.ETF]: "ETF",
  }

  const processedData = useMemo(() => {
    if (!treemapData || treemapData.length === 0) {
      return []
    }

    const sectionColors = getSectionColors()

    const flatData = treemapData
      .map((entity, index) => {
        const type = (entity.type as EntityType) || EntityType.PUBLIC
        let value: number

        if (activeTab === "holdings") {
          value = entity.bitcoinHoldings || 0
        } else if (activeTab === "percentage") {
          value = entity.supplyPercentage || 0
        } else {
          value = entity.usdValue || 0
        }

        let displayValue: string
        if (activeTab === "holdings") {
          displayValue = `${Math.round(value).toLocaleString()} BTC`
        } else if (activeTab === "percentage") {
          displayValue = `${value.toFixed(4)}%`
        } else {
          if (value >= 1e9) {
            displayValue = `$${(value / 1e9).toFixed(2)}B`
          } else if (value >= 1e6) {
            displayValue = `$${(value / 1e6).toFixed(2)}M`
          } else if (value >= 1e3) {
            displayValue = `$${(value / 1e3).toFixed(2)}K`
          } else {
            displayValue = `$${value.toFixed(2)}`
          }
        }

        return {
          name: entity.countryFlag ? `${entity.countryFlag} ${entity.name}` : entity.name || `Entity ${index}`,
          size: Math.max(value, 1),
          value,
          displayValue,
          type,
          symbol: entity.ticker || "",
          bitcoinHoldings: entity.bitcoinHoldings || 0,
          usdValue: entity.usdValue || 0,
          supplyPercentage: entity.supplyPercentage || 0,
          slug: entity.slug || `entity-${index}`,
          countryFlag: entity.countryFlag,
          color: sectionColors[type].boxColor,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        }
      })
      .filter((item) => item.size > 0)
      .sort((a, b) => b.size - a.size)

    return flatData
  }, [treemapData, activeTab])

  const layoutSections = (data: TreemapDataPoint[], width: number, height: number): TreemapSection[] => {
    if (data.length === 0) return []

    const layoutSectionColors = getSectionColors()
    const layoutIsMobile = width < 640
    const layoutIsTablet = width >= 640 && width < 1024
    const layoutIsDesktop = width >= 1024 && width < 1440
    const headerHeight = layoutIsMobile ? 30 : layoutIsTablet ? 36 : 40
    const sectionPadding = layoutIsMobile ? 3 : layoutIsTablet ? 5 : 7
    const sectionGap = layoutIsMobile ? 6 : layoutIsTablet ? 10 : 14

    const groupedData: Record<EntityType, TreemapDataPoint[]> = {
      [EntityType.PUBLIC]: [],
      [EntityType.PRIVATE]: [],
      [EntityType.GOVERNMENT]: [],
      [EntityType.DEFI]: [],
      [EntityType.EXCHANGE]: [],
      [EntityType.ETF]: [],
        }

    data.forEach((item) => {
      groupedData[item.type].push(item)
    })

    const sectionTotals = Object.entries(groupedData)
      .map(([type, items]) => ({
        type: type as EntityType,
        items: items.sort((a, b) => b.size - a.size),
        total: items.reduce((sum, item) => sum + item.size, 0),
      }))
      .filter((section) => section.items.length > 0)
      .sort((a, b) => b.total - a.total)

    const sections: TreemapSection[] = []

    if (sectionTotals.length === 0) return sections

    const availableWidth = width - sectionGap * 2
    const availableHeight = height - sectionGap * 2

    if (sectionTotals.length === 1) {
      const section = sectionTotals[0]
      sections.push({
        title: typeLabels[section.type],
        type: section.type,
        items: section.items,
        x: sectionGap,
        y: sectionGap,
        width: availableWidth,
        height: availableHeight,
        color: layoutSectionColors[section.type].base,
        headerHeight,
      })
    } else if (sectionTotals.length === 2) {
      const [section1, section2] = sectionTotals
      const ratio = section1.total / (section1.total + section2.total)

      if (layoutIsMobile) {
        const height1 = availableHeight * Math.max(ratio, 0.45)
        sections.push({
          title: typeLabels[section1.type],
          type: section1.type,
          items: section1.items,
          x: sectionGap,
          y: sectionGap,
          width: availableWidth,
          height: height1,
          color: layoutSectionColors[section1.type].base,
          headerHeight,
        })
        sections.push({
          title: typeLabels[section2.type],
          type: section2.type,
          items: section2.items,
          x: sectionGap,
          y: sectionGap + height1 + sectionGap,
          width: availableWidth,
          height: availableHeight - height1 - sectionGap,
          color: layoutSectionColors[section2.type].base,
          headerHeight,
        })
      } else {
        const width1 = availableWidth * Math.max(ratio, 0.4)
        sections.push({
          title: typeLabels[section1.type],
          type: section1.type,
          items: section1.items,
          x: sectionGap,
          y: sectionGap,
          width: width1,
          height: availableHeight,
          color: layoutSectionColors[section1.type].base,
          headerHeight,
        })
        sections.push({ 
          title: typeLabels[section2.type],
          type: section2.type,
          items: section2.items,
          x: sectionGap + width1 + sectionGap,
          y: sectionGap,
          width: availableWidth - width1 - sectionGap,
          height: availableHeight,
          color: layoutSectionColors[section2.type].base,
          headerHeight,
        })
      }
        } else {
      // Handle all available sections dynamically
      const totalValue = sectionTotals.reduce((sum, section) => sum + section.total, 0)
      const minHeight = layoutIsMobile ? 120 : 100
      const minWidth = layoutIsTablet ? 200 : 150

      if (layoutIsMobile) {
        // Mobile: Stack all sections vertically
        const usableHeight = availableHeight - sectionGap * (sectionTotals.length - 1)
        let currentY = sectionGap
        
        sectionTotals.forEach((section, index) => {
          const ratio = section.total / totalValue
          const isLastSection = index === sectionTotals.length - 1
          
          let sectionHeight
          if (isLastSection) {
            // Last section gets remaining height
            sectionHeight = availableHeight + sectionGap - currentY
          } else {
            sectionHeight = Math.max(usableHeight * Math.max(ratio, 0.1), minHeight)
          }
          
          sections.push({
            title: typeLabels[section.type],
            type: section.type,
            items: section.items,
            x: sectionGap,
            y: currentY,
            width: availableWidth,
            height: sectionHeight,
            color: layoutSectionColors[section.type].base,
            headerHeight,
          })
          
          currentY += sectionHeight + sectionGap
        })
      } else {
        // Desktop: Create a flexible grid layout
        const numSections = sectionTotals.length
        
        if (numSections <= 3) {
          // For 3 or fewer sections, use the original layout approach
          let currentX = sectionGap
          sectionTotals.forEach((section, index) => {
            const ratio = section.total / totalValue
            const isLastSection = index === sectionTotals.length - 1
            
            let sectionWidth
            if (isLastSection) {
              sectionWidth = availableWidth + sectionGap - currentX
            } else {
              sectionWidth = Math.max(availableWidth * Math.max(ratio, 0.2), minWidth)
            }
            
            sections.push({
              title: typeLabels[section.type],
              type: section.type,
              items: section.items,
              x: currentX,
              y: sectionGap,
              width: sectionWidth,
              height: availableHeight,
              color: layoutSectionColors[section.type].base,
              headerHeight,
            })
            
            currentX += sectionWidth + sectionGap
          })
        } else {
          // Custom layout with proportional sizing based on Bitcoin holdings
          // Find sections by type
          const publicSection = sectionTotals.find(s => s.type === EntityType.PUBLIC)
          const etfSection = sectionTotals.find(s => s.type === EntityType.ETF)
          const governmentSection = sectionTotals.find(s => s.type === EntityType.GOVERNMENT)
          const privateSection = sectionTotals.find(s => s.type === EntityType.PRIVATE)
          const defiSection = sectionTotals.find(s => s.type === EntityType.DEFI)
          const exchangeSection = sectionTotals.find(s => s.type === EntityType.EXCHANGE)
          
          // Calculate proportions based on actual Bitcoin holdings
          const totalAllHoldings = sectionTotals.reduce((sum, section) => sum + section.total, 0)
          
          // Calculate proportions for main sections
          const publicRatio = publicSection ? publicSection.total / totalAllHoldings : 0
          const etfRatio = etfSection ? etfSection.total / totalAllHoldings : 0
          
          // Bottom sections (Government, Private, DeFi, Exchange)
          const bottomSections = [governmentSection, privateSection, defiSection, exchangeSection].filter(Boolean)
          const bottomTotalHoldings = bottomSections.reduce((sum, section) => sum + (section?.total || 0), 0)
          const bottomRatio = bottomTotalHoldings / totalAllHoldings
          
          // Layout calculation: Public takes left side, ETF and bottom sections share right side
          const leftWidth = Math.max(availableWidth * publicRatio, availableWidth * 0.25) // Min 25% for visibility
          const rightWidth = availableWidth - leftWidth - sectionGap
          
          // Split right side between ETF (top) and bottom grid based on their holdings
          const rightTotalHoldings = etfRatio + bottomRatio
          const etfHeightRatio = rightTotalHoldings > 0 ? etfRatio / rightTotalHoldings : 0.5
          const topRightHeight = Math.max(availableHeight * etfHeightRatio, availableHeight * 0.3) // Min 30% for visibility
          const bottomRightHeight = availableHeight - topRightHeight - sectionGap
          
          // Left side: Public Companies (proportional to holdings)
          if (publicSection) {
            sections.push({
              title: typeLabels[publicSection.type],
              type: publicSection.type,
              items: publicSection.items,
              x: sectionGap,
              y: sectionGap,
              width: leftWidth,
              height: availableHeight,
              color: layoutSectionColors[publicSection.type].base,
              headerHeight,
            })
          }
          
          // Top right: ETFs & Funds (proportional to holdings)
          if (etfSection) {
            sections.push({
              title: typeLabels[etfSection.type],
              type: etfSection.type,
              items: etfSection.items,
              x: sectionGap + leftWidth + sectionGap,
              y: sectionGap,
              width: rightWidth,
              height: topRightHeight,
              color: layoutSectionColors[etfSection.type].base,
              headerHeight,
            })
          }
          
          // Bottom right: Grid for remaining sections (proportional to their holdings)
          if (bottomSections.length > 0) {
            const bottomRightX = sectionGap + leftWidth + sectionGap
            const bottomRightY = sectionGap + topRightHeight + sectionGap
            
                         // Simple 2x2 layout with proportional sizing
             if (bottomSections.length <= 4) {
               const gridGap = sectionGap / 2
               
               // Calculate sizes based on holdings
               let currentY = bottomRightY
               let remainingHeight = bottomRightHeight
               
               for (let row = 0; row < 2 && row * 2 < bottomSections.length; row++) {
                 const rowSections = bottomSections.slice(row * 2, (row + 1) * 2).filter((section): section is NonNullable<typeof section> => section !== undefined)
                 const rowTotal = rowSections.reduce((sum, section) => sum + section.total, 0)
                 const rowHeight = row === 1 ? remainingHeight : (bottomRightHeight * (rowTotal / bottomTotalHoldings))
                 
                 let currentX = bottomRightX
                 let remainingWidth = rightWidth
                 
                 rowSections.forEach((section, colIndex) => {
                   if (section) {
                     const sectionWidth = colIndex === rowSections.length - 1 ? remainingWidth : (rightWidth * (section.total / rowTotal))
                     
                     sections.push({
                       title: typeLabels[section.type],
                       type: section.type,
                       items: section.items,
                       x: currentX,
                       y: currentY,
                       width: sectionWidth - (colIndex < rowSections.length - 1 ? gridGap : 0),
                       height: rowHeight - (row === 0 ? gridGap : 0),
                       color: layoutSectionColors[section.type].base,
                       headerHeight,
                     })
                     
                     currentX += sectionWidth
                     remainingWidth -= sectionWidth
                   }
                 })
                 
                 currentY += rowHeight
                 remainingHeight -= rowHeight
               }
             }
          }
        }
      }
    }

    sections.forEach((section) => {
      layoutItemsInSection(
        section.items,
        section.x,
        section.y + section.headerHeight,
        section.width,
        section.height - section.headerHeight,
        layoutIsMobile,
      )
    })

    return sections
  }

  const layoutItemsInSection = (items: TreemapDataPoint[], x: number, y: number, width: number, height: number, isMobile = false) => {
    if (items.length === 0) return

    const padding = isMobile ? 3 : width < 1024 ? 4 : 6 
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2
    const startX = x + padding
    const startY = y + padding

    if (items.length === 1) {
      const item = items[0]
      item.x = startX
      item.y = startY
      item.width = availableWidth
      item.height = availableHeight
      return
    }

    squarify(items, startX, startY, availableWidth, availableHeight)
  }

  const squarify = (items: TreemapDataPoint[], x: number, y: number, width: number, height: number) => {
    if (items.length === 0) return

    if (items.length === 1) {
      const item = items[0]
      item.x = x
      item.y = y
      item.width = width
      item.height = height
      return
    }

    const totalValue = items.reduce((sum, item) => sum + item.size, 0)
    const isHorizontal = width > height

    if (items.length === 2) {
      const [item1, item2] = items
      const ratio = item1.size / totalValue

      if (isHorizontal) {
        const width1 = width * ratio
        item1.x = x
        item1.y = y
        item1.width = width1
        item1.height = height

        item2.x = x + width1
        item2.y = y
        item2.width = width - width1
        item2.height = height
      } else {
        const height1 = height * ratio
        item1.x = x
        item1.y = y
        item1.width = width
        item1.height = height1

        item2.x = x
        item2.y = y + height1
        item2.width = width
        item2.height = height - height1
      }
      return
    }

    const mid = Math.floor(items.length / 2)
    const firstHalf = items.slice(0, mid)
    const secondHalf = items.slice(mid)

    const firstHalfValue = firstHalf.reduce((sum, item) => sum + item.size, 0)
    const ratio = firstHalfValue / totalValue

    if (isHorizontal) {
      const width1 = width * ratio
      squarify(firstHalf, x, y, width1, height)
      squarify(secondHalf, x + width1, y, width - width1, height)
    } else {
      const height1 = height * ratio
      squarify(firstHalf, x, y, width, height1)
      squarify(secondHalf, x, y + height1, width, height - height1)
    }
  }

  const treemapSections = useMemo(() => {
    if (processedData.length === 0) return []
    return layoutSections(processedData, dimensions.width, dimensions.height)
  }, [processedData, dimensions])



  const tabConfig = [
    {
      id: "holdings",
      label: "Bitcoin Holdings",
      icon: Bitcoin,
      gradient: "from-orange-600 to-orange-500",
    },
    {
      id: "percentage",
      label: "% of Supply",
      icon: TrendingUp,
      gradient: "from-orange-600 to-orange-500",
    },
    {
      id: "value",
      label: "USD Value",
      icon: DollarSign,
      gradient: "from-orange-600 to-orange-500",
    },
  ]

  const textColors = getTextColors()
  const sectionColors = getSectionColors()
  const isMobile = dimensions.width < 640
  const isTablet = dimensions.width >= 640 && dimensions.width < 1024
  const isDesktop = dimensions.width >= 1024 && dimensions.width < 1440
  const isUltraWide = dimensions.width >= 1440

  if ((treemapLoading || loading) && forceHoldingsOnly) {
    return (
      <div className="flex items-center justify-center h-[700px] w-full">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mx-auto" />
            <TrendingUp className="absolute inset-0 m-auto h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }
  if (forceHoldingsOnly) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm shadow-2xl">
        <div className="w-full relative" style={{ height: dimensions.height, minHeight: isMobile ? '800px' : '700px' }} ref={containerRef}>
          {treemapSections.length > 0 ? (
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
              className="w-full h-full block"
              preserveAspectRatio="none"
              style={{ display: 'block' }}
            >
              {treemapSections.map((section, sectionIndex) => (
                <g key={section.type}>
                  <rect
                    x={section.x}
                    y={section.y}
                    width={section.width}
                    height={section.height}
                    fill={sectionColors[section.type].lightBg}
                    stroke={sectionColors[section.type].borderColor}
                    strokeWidth={theme === "dark" ? 1.5 : 1}
                    rx={isMobile ? 4 : 8}
                    ry={isMobile ? 4 : 8}
                  />

                  <rect
                    x={section.x}
                    y={section.y}
                    width={section.width} 
                    height={section.headerHeight}
                    fill={sectionColors[section.type].header}
                    rx={isMobile ? 4 : 8}
                    ry={isMobile ? 4 : 8}
                  />
                  <rect
                    x={section.x}
                    y={section.y + section.headerHeight - (isMobile ? 4 : 8)}
                    width={section.width}
                    height={isMobile ? 4 : 8}
                    fill={sectionColors[section.type].header}
                  />

                  <text
                    x={section.x + section.width / 2}
                    y={section.y + section.headerHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isMobile ? "12" : isTablet ? "14" : isDesktop ? "16" : "18"}
                    fontWeight="700"
                    fill={sectionColors[section.type].headerText}
                    className="select-none"
                  >
                    {section.title}
                  </text>

                  {section.items.map((item, itemIndex) => {
                    const isHovered = hoveredEntity === item.slug
                    const minFontSize = isMobile ? 9 : isTablet ? 10 : 11
                    const maxFontSize = isMobile ? 13 : isTablet ? 15 : isDesktop ? 17 : 19
                    const fontSize = Math.min(Math.max(item.width / (isMobile ? 8 : 10), item.height / (isMobile ? 5 : 6), minFontSize), maxFontSize)
                    
                    const showFullText = item.width > (isMobile ? 30 : isTablet ? 35 : 40) && item.height > (isMobile ? 25 : isTablet ? 28 : 32)
                    const showAnyText = item.width > (isMobile ? 15 : isTablet ? 18 : 20) && item.height > (isMobile ? 15 : isTablet ? 18 : 20)
                    const showValue = item.width > (isMobile ? 60 : isTablet ? 70 : 80) && item.height > (isMobile ? 35 : isTablet ? 40 : 45)
                    
                    let displayText = ""
                    if (showFullText) {
                      displayText = item.name.length > item.width / (isMobile ? 8 : isTablet ? 9 : 10)
                        ? item.name.substring(0, Math.max(Math.floor(item.width / (isMobile ? 10 : isTablet ? 11 : 12)), 1)) + "..."
                        : item.name
                    } else if (showAnyText) {
                        const nameWithoutFlag = item.countryFlag 
                          ? item.name.replace(item.countryFlag, '').trim()
                          : item.name
                        displayText = nameWithoutFlag.charAt(0).toUpperCase() + "..."
                    }

                    return (
                      <g key={item.slug || itemIndex}>
                        <rect
                          x={item.x}
                          y={item.y}
                          width={item.width}
                          height={item.height}
                          fill={item.color}
                          stroke={theme === "dark" ? sectionColors[item.type].borderColor : sectionColors[item.type].borderColor}
                          strokeWidth={isHovered ? (isMobile ? 2 : 3) : (isMobile ? 0.5 : 1)}
                          rx={isMobile ? 2 : 4}
                          ry={isMobile ? 2 : 4}
                          className="transition-all duration-300 cursor-pointer"
                          style={{
                            filter: isHovered
                              ? `brightness(1.15) drop-shadow(0 ${isMobile ? '2px 6px' : '4px 12px'} rgba(234,88,12,0.4))`
                              : "brightness(1)",
                          }}
                          onMouseEnter={(e) => setHoveredEntity(item.slug || "")}
                          onMouseLeave={() => setHoveredEntity(null)}
                          onTouchStart={(e) => setHoveredEntity(item.slug || "")}
                          onTouchEnd={() => setHoveredEntity(null)}
                          onClick={() => handleCellClick(item.slug || "")}
                        />

                        {showAnyText && displayText && (
                          <text
                            x={item.x + item.width / 2}
                            y={item.y + item.height / 2 - (showValue ? fontSize / 2 : 0)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={fontSize}
                            fontWeight="400"
                            fill={theme === "dark" ? "#ffffff" : "#000000"}
                            className="pointer-events-none select-none"
                          >
                            {displayText}
                          </text>
                        )}

                        {showValue && (
                          <text
                            x={item.x + item.width / 2}
                            y={item.y + item.height / 2 + fontSize * 0.8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={Math.max(fontSize - 1, minFontSize)}
                            fontWeight="400"
                            fill={theme === "dark" ? "#ffffff" : "#000000"}
                            className="pointer-events-none select-none"
                          >
                            {item.displayValue}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>
              ))}
            </svg>
          ) : (
            <Shimmer className="w-full h-full rounded-3xl" />
          )}
        </div>
      </div>
    )
  }

  if (treemapLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[700px] w-full">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mx-auto" />
            <TrendingUp className="absolute inset-0 m-auto h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  let header = null;
  let embedModal = null;
  if (!forceHoldingsOnly) {
    header = (
      <CardHeader className="relative pb-3 sm:pb-4 md:pb-6 p-3 sm:p-4 md:p-6">
        <CardTitle className={cn(
          "flex items-center gap-2 sm:gap-4",
          isMobile ? "text-base flex-col text-center" : isTablet ? "text-lg" : "text-xl sm:text-2xl"
        )}>
          <div className="p-1 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <BarChart3 className={cn("text-orange-600 dark:text-orange-400", isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-7 sm:w-7")} />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 bg-clip-text text-transparent">
              Bitcoin Holdings Treemap
            </span>
            <span className={cn(
              "text-muted-foreground font-normal",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Visual representation of the Bitcoin supply, showing the distribution among all tracked entities.
            </span>
          </div>
          <EmbedModal
            open={embedOpen}
            onOpenChange={setEmbedOpen}
            embedCode={embedCode}
            copied={copied}
            setCopied={setCopied}
          >
            <Button
              variant="outline"
              size="sm"
              className="ml-auto w-fit px-3 py-1.5 text-xs sm:text-sm font-semibold border-orange-300/50 dark:border-orange-700/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-orange-900/30 dark:to-orange-800/20 shadow-lg duration-300 text-orange-700 dark:text-orange-300 hover:none"
              onClick={() => setEmbedOpen(true)}
              type="button"
            >
              Embed
            </Button>
          </EmbedModal>
        </CardTitle>
      </CardHeader>
    );
  }

  if (forceHoldingsOnly) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm shadow-2xl">
        <div className="w-full relative" style={{ height: dimensions.height, minHeight: isMobile ? '800px' : '700px' }} ref={containerRef}>
          {treemapSections.length > 0 ? (
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
              className="w-full h-full block"
              preserveAspectRatio="none"
              style={{ display: 'block' }}
            >
              {treemapSections.map((section, sectionIndex) => (
                <g key={section.type}>
                  <rect
                    x={section.x}
                    y={section.y}
                    width={section.width}
                    height={section.height}
                    fill={sectionColors[section.type].lightBg}
                    stroke={sectionColors[section.type].borderColor}
                    strokeWidth={theme === "dark" ? 1.5 : 1}
                    rx={isMobile ? 4 : 8}
                    ry={isMobile ? 4 : 8}
                  />

                  <rect
                    x={section.x}
                    y={section.y}
                    width={section.width} 
                    height={section.headerHeight}
                    fill={sectionColors[section.type].header}
                    rx={isMobile ? 4 : 8}
                    ry={isMobile ? 4 : 8}
                  />
                  <rect
                    x={section.x}
                    y={section.y + section.headerHeight - (isMobile ? 4 : 8)}
                    width={section.width}
                    height={isMobile ? 4 : 8}
                    fill={sectionColors[section.type].header}
                  />

                  <text
                    x={section.x + section.width / 2}
                    y={section.y + section.headerHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isMobile ? "12" : isTablet ? "14" : isDesktop ? "16" : "18"}
                    fontWeight="700"
                    fill={sectionColors[section.type].headerText}
                    className="select-none"
                  >
                    {section.title}
                  </text>

                  {section.items.map((item, itemIndex) => {
                    const isHovered = hoveredEntity === item.slug
                    const minFontSize = isMobile ? 9 : isTablet ? 10 : 11
                    const maxFontSize = isMobile ? 13 : isTablet ? 15 : isDesktop ? 17 : 19
                    const fontSize = Math.min(Math.max(item.width / (isMobile ? 8 : 10), item.height / (isMobile ? 5 : 6), minFontSize), maxFontSize)
                    
                    const showFullText = item.width > (isMobile ? 30 : isTablet ? 35 : 40) && item.height > (isMobile ? 25 : isTablet ? 28 : 32)
                    const showAnyText = item.width > (isMobile ? 15 : isTablet ? 18 : 20) && item.height > (isMobile ? 15 : isTablet ? 18 : 20)
                    const showValue = item.width > (isMobile ? 60 : isTablet ? 70 : 80) && item.height > (isMobile ? 35 : isTablet ? 40 : 45)
                    
                    let displayText = ""
                    if (showFullText) {
                      displayText = item.name.length > item.width / (isMobile ? 8 : isTablet ? 9 : 10)
                        ? item.name.substring(0, Math.max(Math.floor(item.width / (isMobile ? 10 : isTablet ? 11 : 12)), 1)) + "..."
                        : item.name
                    } else if (showAnyText) {
                        const nameWithoutFlag = item.countryFlag 
                          ? item.name.replace(item.countryFlag, '').trim()
                          : item.name
                        displayText = nameWithoutFlag.charAt(0).toUpperCase() + "..."
                    }

                    return (
                      <g key={item.slug || itemIndex}>
                        <rect
                          x={item.x}
                          y={item.y}
                          width={item.width}
                          height={item.height}
                          fill={item.color}
                          stroke={theme === "dark" ? sectionColors[item.type].borderColor : sectionColors[item.type].borderColor}
                          strokeWidth={isHovered ? (isMobile ? 2 : 3) : (isMobile ? 0.5 : 1)}
                          rx={isMobile ? 2 : 4}
                          ry={isMobile ? 2 : 4}
                          className="transition-all duration-300 cursor-pointer"
                          style={{
                            filter: isHovered
                              ? `brightness(1.15) drop-shadow(0 ${isMobile ? '2px 6px' : '4px 12px'} rgba(234,88,12,0.4))`
                              : "brightness(1)",
                          }}
                          onMouseEnter={(e) => setHoveredEntity(item.slug || "")}
                          onMouseLeave={() => setHoveredEntity(null)}
                          onTouchStart={(e) => setHoveredEntity(item.slug || "")}
                          onTouchEnd={() => setHoveredEntity(null)}
                          onClick={() => handleCellClick(item.slug || "")}
                        />

                        {showAnyText && displayText && (
                          <text
                            x={item.x + item.width / 2}
                            y={item.y + item.height / 2 - (showValue ? fontSize / 2 : 0)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={fontSize}
                            fontWeight="400"
                            fill={theme === "dark" ? "#ffffff" : "#000000"}
                            className="pointer-events-none select-none"
                          >
                            {displayText}
                          </text>
                        )}

                        {showValue && (
                          <text
                            x={item.x + item.width / 2}
                            y={item.y + item.height / 2 + fontSize * 0.8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={Math.max(fontSize - 1, minFontSize)}
                            fontWeight="400"
                            fill={theme === "dark" ? "#ffffff" : "#000000"}
                            className="pointer-events-none select-none"
                          >
                            {item.displayValue}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>
              ))}
            </svg>
          ) : (
            <Shimmer className="w-full h-full rounded-3xl" />
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-300/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-125" />
      <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-125" />

      {header}
      {embedModal}

      <CardContent className="relative space-y-3 sm:space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
          <div className={cn(
            "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm p-1.5 sm:p-2 border border-orange-200/50 dark:border-orange-800/50 shadow-xl",
            isMobile ? "h-9 w-full" : isTablet ? "h-10" : "h-12"
          )}>
            {tabConfig.map((tab) => (
             <button
             key={tab.id}
             className={cn(
               "rounded-lg px-3 sm:px-4 py-2 font-semibold transition-all duration-300 hover:scale-105 touch-manipulation min-w-[44px] min-h-[36px]",
               isMobile ? "text-xs flex-1" : "text-sm",
               activeTab === tab.id
                 ? "bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400 text-white shadow-lg border border-orange-700 dark:border-orange-600"
                 : "text-orange-700 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-200 hover:bg-orange-100/50 dark:hover:bg-orange-900/30"
             )}
             onClick={() => setActiveTab(tab.id as "holdings" | "percentage" | "value")}
             aria-label={`View ${tab.label} chart`}
           >
             {isMobile ? tab.label.split(' ')[0] : tab.label}
           </button>
            ))}
          </div>
        </div>

        {treemapLoading ? (
          <div className="relative overflow-hidden rounded-3xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm shadow-2xl">
            <div className={cn("w-full p-4 sm:p-8", isMobile ? "min-h-[400px]" : "min-h-[600px] sm:min-h-[800px]")}>
              <div className={cn("gap-4 h-full", isMobile ? "space-y-4" : "grid grid-cols-12")}>
                <div className={cn(isMobile ? "h-32" : "col-span-5 h-full")}>
                  <Shimmer className="h-full w-full rounded-2xl" />
                </div>
                <div className={cn("space-y-4", isMobile ? "h-48" : "col-span-7 h-full")}>
                  <Shimmer className={cn("w-full rounded-2xl", isMobile ? "h-1/2" : "h-2/3")} />
                  <Shimmer className={cn("w-full rounded-2xl", isMobile ? "h-1/2" : "h-1/3")} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm shadow-2xl">
            <div className="">
              <div className="w-full relative" style={{ height: dimensions.height, minHeight: isMobile ? '800px' : '700px' }} ref={containerRef}>
                {treemapSections.length > 0 ? (
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
                    className="w-full h-full block"
                    preserveAspectRatio="none"
                    style={{ display: 'block' }}
                  >
                    {treemapSections.map((section, sectionIndex) => (
                      <g key={section.type}>
                        <rect
                          x={section.x}
                          y={section.y}
                          width={section.width}
                          height={section.height}
                          fill={sectionColors[section.type].lightBg}
                          stroke={sectionColors[section.type].borderColor}
                          strokeWidth={theme === "dark" ? 1.5 : 1}
                          rx={isMobile ? 4 : 8}
                          ry={isMobile ? 4 : 8}
                        />

                        <rect
                          x={section.x}
                          y={section.y}
                          width={section.width} 
                          height={section.headerHeight}
                          fill={sectionColors[section.type].header}
                          rx={isMobile ? 4 : 8}
                          ry={isMobile ? 4 : 8}
                        />
                        <rect
                          x={section.x}
                          y={section.y + section.headerHeight - (isMobile ? 4 : 8)}
                          width={section.width}
                          height={isMobile ? 4 : 8}
                          fill={sectionColors[section.type].header}
                        />

                        <text
                          x={section.x + section.width / 2}
                          y={section.y + section.headerHeight / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={isMobile ? "12" : isTablet ? "14" : isDesktop ? "16" : "18"}
                          fontWeight="700"
                          fill={sectionColors[section.type].headerText}
                          className="select-none"
                        >
                          {section.title}
                        </text>

                        {section.items.map((item, itemIndex) => {
                          const isHovered = hoveredEntity === item.slug
                          const minFontSize = isMobile ? 9 : isTablet ? 10 : 11
                          const maxFontSize = isMobile ? 13 : isTablet ? 15 : isDesktop ? 17 : 19
                          const fontSize = Math.min(Math.max(item.width / (isMobile ? 8 : 10), item.height / (isMobile ? 5 : 6), minFontSize), maxFontSize)
                          
                          const showFullText = item.width > (isMobile ? 30 : isTablet ? 35 : 40) && item.height > (isMobile ? 25 : isTablet ? 28 : 32)
                          const showAnyText = item.width > (isMobile ? 15 : isTablet ? 18 : 20) && item.height > (isMobile ? 15 : isTablet ? 18 : 20)
                          const showValue = item.width > (isMobile ? 60 : isTablet ? 70 : 80) && item.height > (isMobile ? 35 : isTablet ? 40 : 45)
                          
                          let displayText = ""
                          if (showFullText) {
                            displayText = item.name.length > item.width / (isMobile ? 8 : isTablet ? 9 : 10)
                              ? item.name.substring(0, Math.max(Math.floor(item.width / (isMobile ? 10 : isTablet ? 11 : 12)), 1)) + "..."
                              : item.name
                          } else if (showAnyText) {
                              const nameWithoutFlag = item.countryFlag 
                                ? item.name.replace(item.countryFlag, '').trim()
                                : item.name
                              displayText = nameWithoutFlag.charAt(0).toUpperCase() + "..."
                          }

                          return (
                            <g key={item.slug || itemIndex}>
                              <rect
                                x={item.x}
                                y={item.y}
                                width={item.width}
                                height={item.height}
                                fill={item.color}
                                stroke={theme === "dark" ? sectionColors[item.type].borderColor : sectionColors[item.type].borderColor}
                                strokeWidth={isHovered ? (isMobile ? 2 : 3) : (isMobile ? 0.5 : 1)}
                                rx={isMobile ? 2 : 4}
                                ry={isMobile ? 2 : 4}
                                className="transition-all duration-300 cursor-pointer"
                                style={{
                                  filter: isHovered
                                    ? `brightness(1.15) drop-shadow(0 ${isMobile ? '2px 6px' : '4px 12px'} rgba(234,88,12,0.4))`
                                    : "brightness(1)",
                                }}
                                onMouseEnter={(e) => setHoveredEntity(item.slug || "")}
                                onMouseLeave={() => setHoveredEntity(null)}
                                onTouchStart={(e) => setHoveredEntity(item.slug || "")}
                                onTouchEnd={() => setHoveredEntity(null)}
                                onClick={() => handleCellClick(item.slug || "")}
                              />

                              {showAnyText && displayText && (
                                <text
                                  x={item.x + item.width / 2}
                                  y={item.y + item.height / 2 - (showValue ? fontSize / 2 : 0)}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize={fontSize}
                                  fontWeight="400"
                                  fill={theme === "dark" ? "#ffffff" : "#000000"}
                                  className="pointer-events-none select-none"
                                >
                                  {displayText}
                                </text>
                              )}

                              {showValue && (
                                <text
                                  x={item.x + item.width / 2}
                                  y={item.y + item.height / 2 + fontSize * 0.8}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize={Math.max(fontSize - 1, minFontSize)}
                                  fontWeight="400"
                                  fill={theme === "dark" ? "#ffffff" : "#000000"}
                                  className="pointer-events-none select-none"
                                >
                                  {item.displayValue}
                                </text>
                              )}
                            </g>
                          )
                        })}
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">No Data Available</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          No entities found for the selected metric. Try switching to a different view.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      
      </CardContent>
    </Card>
  )
}