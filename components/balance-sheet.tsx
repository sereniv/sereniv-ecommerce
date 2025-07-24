"use client"

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Shimmer } from "@/components/ui/shimmer"
import { Calendar, TrendingUp, TrendingDown, Database, ArrowUp, ArrowDown, Briefcase } from "lucide-react"
import { BalanceSheetRow } from "@/lib/types/entity"
import { formatDate } from "@/lib/utils"
import { formatNumberWithSuffix, formatNumberWithSmartDecimals, formatCostBasis } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function BalanceSheet({ loading, data }: { loading: boolean, data: BalanceSheetRow[] }) {
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-xl p-6 sm:p-8">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500/20 dark:border-orange-400/20 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin" />
                <Briefcase className="absolute inset-0 m-auto h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Shimmer className="h-5 sm:h-6 w-36 sm:w-48 mx-auto rounded-full" />
              <Shimmer className="h-3 sm:h-4 w-24 sm:w-32 mx-auto rounded-full" />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">
              Loading balance sheet data...
            </div>
          </div>
        </div>
      ) : data.length === 0 && !loading ? (
        <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-xl">
          <div className="space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/50 dark:to-orange-900/30 flex items-center justify-center">
              <Database className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Data Available</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                No balance sheet data available for this entity.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500/30 dark:scrollbar-thumb-orange-400/30 scrollbar-track-transparent hover:scrollbar-thumb-orange-500/50 dark:hover:scrollbar-thumb-orange-400/50">
            {isMobile ? (
              <MobileBalanceSheet data={data} />
            ) : (
              <DesktopBalanceSheet data={data} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const MobileBalanceSheet = ({ data }: { data: BalanceSheetRow[] }) => {
  return (
    <Table className="w-full table-fixed">
      <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90 font-mono tracking-tight text-xs">
        <TableRow className="hover:bg-transparent">
          <TableHead className="py-1 px-1 font-semibold text-[10px] w-[25%] sticky left-0 bg-gradient-to-r from-orange-50/95 to-orange-100/75 dark:from-orange-950/95 font-mono tracking-tight text-xs">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              <span>Date</span>
            </div>
          </TableHead>
          <TableHead className="py-1 px-1 font-semibold text-[10px] text-center w-[25%] font-mono tracking-tight text-xs">
            <span>BTC Balance</span>
          </TableHead>
          <TableHead className="py-1 px-1 font-semibold text-[10px] text-center w-[20%] font-mono tracking-tight text-xs">
            <span>Change</span>
          </TableHead>
          <TableHead className="py-1 px-1 font-semibold text-[10px] text-center w-[30%] font-mono tracking-tight text-xs">
            <span>Cost Basis</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/30">
        {data.map((entry, index) => {
          const changeValue = index < data.length - 1 ? entry.btcBalance - data[index + 1].btcBalance : entry.change;
          return (
            <TableRow
              key={index}
              className="group/row cursor-pointer transition-all duration-300 border-b border-border/30 touch-manipulation hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-orange-100/20 dark:hover:from-orange-950/30 dark:hover:to-orange-900/20"
            >
              <TableCell className="py-3 px-2 w-[25%] border-r border-border/20 font-mono tracking-tight text-xs">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-foreground font-mono tracking-tight">
                    {formatDate(entry.date)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-2 text-center w-[25%] font-mono tracking-tight text-xs">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-orange-600 dark:text-orange-400  text-xs font-mono">₿</span>
                  <span className="text-xs text-foreground font-mono tracking-tight">
                    {entry.btcBalance > 0 ? formatNumberWithSmartDecimals(entry.btcBalance) : '—'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-2 text-center w-[20%] font-mono tracking-tight text-xs">
                <div className="flex justify-center">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono tracking-tight transition-all duration-300",
                    changeValue > 0
                      ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                  )}>
                    {changeValue > 0 ? (
                      <ArrowUp className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowDown className="h-2.5 w-2.5" />
                    )}
                    <span>{formatNumberWithSmartDecimals(changeValue)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-2 text-center w-[30%] font-mono tracking-tight text-xs">
                <span className="text-xs text-foreground font-mono tracking-tight">
                  {entry.costBasis > 0 ? formatCostBasis(entry.costBasis) : '—'}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const DesktopBalanceSheet = ({ data }: { data: BalanceSheetRow[] }) => {
  return (
    <Table className="w-full min-w-[800px]">
      <TableHeader className="sticky top-0 z-10">
        <TableRow className="hover:bg-transparent bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90 font-mono tracking-tight text-xs">
          <TableHead className="py-3 px-2 font-semibold text-[10px] sticky left-0 bg-gradient-to-r from-orange-50/95 to-orange-100/75 dark:from-orange-950/95 font-mono tracking-tight text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              <span>Date</span>
            </div>
          </TableHead>
          <TableHead className="py-3 px-2 font-semibold text-[10px] font-mono tracking-tight text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              <span>BTC Balance</span>
            </div>
          </TableHead>
          <TableHead className="py-3 px-2 font-semibold text-[10px] font-mono tracking-tight text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Change (BTC)</span>
            </div>
          </TableHead>
          <TableHead className="py-3 px-2 font-semibold text-[10px] font-mono tracking-tight text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              <span>Cost Basis</span>
            </div>
          </TableHead>
          <TableHead className="py-3 px-2 font-semibold text-[10px] font-mono tracking-tight text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              <span>Market Price</span>
            </div>
          </TableHead>
          <TableHead className="py-3 px-2 font-semibold text-[10px] font-mono tracking-tight text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Stock Price</span>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/30">
        {data.map((entry, index) => {
          const changeValue = index < data.length - 1 ? entry.btcBalance - data[index + 1].btcBalance : entry.change;
          return (
            <TableRow
              key={index}
              className="group/row cursor-pointer transition-all duration-300 border-b border-border/30 touch-manipulation hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-orange-100/20 dark:hover:from-orange-950/30 dark:hover:to-orange-900/20"
            >
              <TableCell className="py-3 px-2 w-[20%] border-r border-border/20 font-mono tracking-tight text-xs">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-600 dark:bg-orange-400 group-hover:scale-150 transition-transform duration-300" />
                  <span className="text-xs text-foreground font-mono tracking-tight">
                    {formatDate(entry.date)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-2 font-mono tracking-tight text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-orange-600 dark:text-orange-400  text-xs font-mono">₿</span>
                  <span className="text-xs text-foreground font-mono tracking-tight">
                    {entry.btcBalance > 0 ? formatNumberWithSmartDecimals(entry.btcBalance) : '—'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-2 font-mono tracking-tight text-xs">
                <div className={cn(
                  "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-mono tracking-tight transition-all duration-300",
                  changeValue > 0
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 dark:text-emerald-400"
                    : "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-700 dark:text-rose-400"
                )}>
                  {changeValue > 0 ? (
                    <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : (
                    <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  )}
                  <span>{formatNumberWithSmartDecimals(changeValue)}</span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-2 font-mono tracking-tight text-xs">
                <span className="text-xs text-foreground font-mono tracking-tight">
                  {entry.costBasis > 0 ? formatCostBasis(entry.costBasis) : '—'}
                </span>
              </TableCell>
              <TableCell className="py-3 px-2 font-mono tracking-tight text-xs">
                <span className="text-xs text-foreground font-mono tracking-tight">
                  {entry.marketPrice > 0 ? `$${formatNumberWithSmartDecimals(entry.marketPrice)}` : '—'}
                </span>
              </TableCell>
              <TableCell className="py-3 px-2 font-mono tracking-tight text-xs">
                <span className="text-xs text-foreground font-mono tracking-tight">
                  {entry.stockPrice > 0 ? `$${formatNumberWithSmartDecimals(entry.stockPrice)}` : '—'}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
