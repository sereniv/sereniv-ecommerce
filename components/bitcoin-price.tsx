"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, ArrowUp, ArrowDown, RefreshCw } from "lucide-react"
import { formatNumberWithSuffix } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useBitcoin } from "@/lib/hooks/useBitcoin"
import { Button } from "@/components/ui/button"

export default function BitcoinPrice() {
  const { data: bitcoinData, loading, error, refetch } = useBitcoin()

  if (loading || !bitcoinData) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
            Bitcoin Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-muted rounded-md mb-3"></div>
            <div className="h-6 w-24 bg-muted rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
            Bitcoin Price
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch(true)} 
            className="h-8 w-8 rounded-full hover:bg-primary/10"
            title="Refresh Bitcoin price"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold">${formatNumberWithSuffix(bitcoinData.price)}</p>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                bitcoinData.price_change_24h >= 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {bitcoinData.price_change_24h >= 0 ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(bitcoinData.price_change_24h).toFixed(2)}%
            </div>
          </div>
          <p className="text-sm text-muted-foreground">24h Change</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border/50 bg-background/50">
            <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
            <p className="font-medium">${formatNumberWithSuffix(bitcoinData.market_cap)}</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-background/50">
            <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
            <p className="font-medium">${formatNumberWithSuffix(bitcoinData.volume)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="px-2 py-1 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            7d: {bitcoinData.price_change_7d >= 0 ? "+" : ""}
            {bitcoinData.price_change_7d.toFixed(2)}%
          </Badge>
          <Badge variant="outline" className="px-2 py-1 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            30d: {bitcoinData.price_change_30d >= 0 ? "+" : ""}
            {bitcoinData.price_change_30d.toFixed(2)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 