"use client"

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCostBasis } from "@/lib/utils";
import { CustomLink } from "@/components/custom-link";
import { Entity } from "@/lib/types/entity";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Star,
  Globe,
} from "lucide-react"
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shimmer } from "@/components/ui/shimmer";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import EmbedModal from "./embed-modal";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "all", label: "All" },
  { id: "public", label: "Public" },
  { id: "private", label: "Private" },
  { id: "government", label: "Government" },
  { id: "etf", label: "ETF" },
  { id: "exchange-defi", label: "Exchange/Defi" },
];

function getUniqueCountries(entities: Entity[]) {
  if (!entities || entities.length === 0) return [];
  const countries = entities
    .map(entity => ({ name: entity.countryName || "", flag: entity.countryFlag || "" }))
    .filter(country => country.name && country.name.trim() !== "")
    .reduce((unique, country) => {
      if (!unique.find(c => c.name === country.name)) {
        unique.push(country);
      }
      return unique;
    }, [] as { name: string; flag: string }[])
    .sort((a, b) => a.name.localeCompare(b.name));
  return countries;
}

function getEntityTypeBg(type: string) {
  switch (type?.toLowerCase()) {
    case "government":
      return "from-emerald-100/20 to-transparent dark:from-emerald-900/20";
    case "public":
      return "from-orange-100/20 to-transparent dark:from-orange-900/20";
    case "private":
      return "from-blue-100/20 to-transparent dark:from-blue-900/20";
    case "defi":
      return "from-emerald-100/20 to-transparent dark:from-emerald-900/20";
    case "exchange":
      return "from-orange-100/20 to-transparent dark:from-orange-900/20";
    case "etf":
      return "from-blue-100/20 to-transparent dark:from-blue-900/20";
    default:
      return "from-orange-100/20 to-transparent dark:from-orange-900/20";
  }
}

function prioritizeMatador(entities: Entity[]) {
  if (entities.length === 0) return [];
  const sortedList = [...entities];
  const matadorIndex = sortedList.findIndex(entity => entity.slug === "matador-technologies-inc");
  if (matadorIndex !== -1) {
    const matador = sortedList.splice(matadorIndex, 1)[0];
    sortedList.unshift(matador);
  }
  return sortedList;
}

export default function EntitiesTable({ companies, custodians, hideTabsAndTitle = false }: { companies: Entity[]; custodians: Entity[]; hideTabsAndTitle?: boolean }) {

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [sortField, setSortField] = useState<string>("bitcoinHoldings");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");
  const [isMobile, setIsMobile] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/bitcoin-treasury-tracker/embed/entities-table" width="100%" height="600" frameborder="0" style="border:0;" allowfullscreen></iframe>`;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allEntities = useMemo(() => {
    if (activeTab === "all") {
      return [...companies, ...custodians];
    } else if (["public", "private", "government"].includes(activeTab)) {
      return companies.filter(e => e.type && e.type.toLowerCase() === activeTab);
    } else if (activeTab === "etf") {
      return custodians.filter(e => e.type && e.type.toLowerCase() === "etf");
    } else if (activeTab === "exchange-defi") {
      return custodians.filter(e => e.type && ["exchange", "defi"].includes(e.type.toLowerCase()));
    } else {
      return [];
    }
  }, [companies, custodians, activeTab]);

  const filteredEntities = useMemo(() => {
    let filtered = allEntities;
    if (searchTerm) {
      filtered = filtered.filter(entity =>
        entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity?.ticker?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCountry !== "all") {
      filtered = filtered.filter(entity => entity?.countryName === selectedCountry);
    }
    return filtered;
  }, [allEntities, searchTerm, selectedCountry]);

  const sortedEntities = useMemo(() => {
    const arr = [...filteredEntities];
    arr.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? (a?.name?.localeCompare(b?.name || "") || 0)
          : (b?.name?.localeCompare(a?.name || "") || 0);
      }
      const aValue = a[sortField as keyof Entity] || 0;
      const bValue = b[sortField as keyof Entity] || 0;
      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
    return arr;
  }, [filteredEntities, sortField, sortDirection]);



  const finalSortedEntities = prioritizeMatador(sortedEntities);

  const companyColumns = [
    { id: "rank", label: "#", tooltip: "Entity ranking" },
    { id: "name", label: "Name", tooltip: "Company or entity name" },
    { id: "bitcoinHoldings", label: "Bitcoin", tooltip: "Total Bitcoin holdings" },
    { id: "usdValue", label: "USD Value", tooltip: "Current value of Bitcoin holdings" },
    { id: "marketCap", label: "Market Cap", tooltip: "Total market capitalization" },
    { id: "enterpriseValue", label: "Ent. Value", tooltip: "Enterprise value" },
    { id: "btcPerShare", label: "BTC/Share", tooltip: "Bitcoin per share" },
    { id: "costBasis", label: "Cost Basis", tooltip: "Average cost basis per Bitcoin" },
    { id: "ngu", label: "NgU", tooltip: "Number go up" },
    { id: "mNav", label: "mNAV", tooltip: "Modified net asset value (mNAV)" },
    { id: "supplyPercentage", label: "/21M", tooltip: "Percentage of total Bitcoin supply (21M)" },
  ];

  const custodianColumns = [
    { id: "rank", label: "#", tooltip: "Entity ranking" },
    { id: "name", label: "Name", tooltip: "Company or entity name" },
    { id: "bitcoinHoldings", label: "Bitcoin", tooltip: "Total Bitcoin holdings" },
    { id: "usdValue", label: "USD Value", tooltip: "Current value of Bitcoin holdings" },
    { id: "marketCap", label: "Market Cap", tooltip: "Total market capitalization" },
    { id: "supplyPercentage", label: "/21M", tooltip: "Percentage of total Bitcoin supply (21M)" },
  ];
  const columns = ["all", "public", "private", "government"].includes(activeTab) ? companyColumns : custodianColumns;

  const renderTable = () => {
    return (
      <Table className="w-full">
        <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90">
          <TableRow className="hover:bg-transparent">
            {columns.map(col => (
              <TableHead
                key={col.id}
                className={
                  col.id === "rank"
                    ? "py-1.5 sm:py-3 px-1 sm:px-2 font-medium font-mono tracking-tight text-[9px] md:text-[12px] w-[2%]"
                    : col.id === "name"
                      ? "py-1.5 sm:py-3 px-1 sm:px-2 font-medium font-mono tracking-tight text-[9px]  md:text-[12px] w-[28%] md:w-[20%]"
                      : col.id === "supplyPercentage"
                        ? "text-right py-1.5 sm:py-3 px-1 sm:px-2 font-medium font-mono tracking-tight text-[9px] md:text-[12px]"
                        : "py-1.5 sm:py-3 px-1 sm:px-2 font-medium font-mono tracking-tight text-[9px] md:text-[12px]"
                }
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/30">
          {finalSortedEntities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/50 dark:to-orange-900/30">
                    <Search className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">No entities found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            finalSortedEntities.map((entity, index) => (
              <TableRow
                key={entity.id}
                className={cn(
                  "group/row cursor-pointer transition-all duration-300 border-b border-border/30 touch-manipulation",
                  `hover:bg-gradient-to-r hover:${getEntityTypeBg(entity.type || "")}`,
                  entity.slug === "matador-technologies-inc" ? "bg-gradient-to-r from-orange-100/20 to-transparent dark:from-orange-900/20 border-orange-300/30 dark:border-orange-700/30" : ""
                )}
              >
                {columns.map(col => (
                  <TableCell
                    key={col.id}
                    className={
                      col.id === "rank"
                        ? "py-1.5 sm:py-3 px-1 sm:px-2 font-mono tracking-tight text-[9px] md:text-[12px] w-[2%]"
                        : col.id === "name"
                          ? "py-1.5 sm:py-3 px-1 sm:px-2 font-mono tracking-tight text-[9px] md:text-[12px] w-[28%] md:w-[20%]"
                          : col.id === "supplyPercentage"
                            ? "text-right py-1.5 sm:py-3 px-1 sm:px-2 font-mono tracking-tight text-[9px] md:text-[12px]"
                            : "py-1.5 sm:py-3 px-1 sm:px-2 font-mono tracking-tight text-[9px] md:text-[12px]"
                    }
                  >
                    {renderCell(entity, col.id, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  function renderCell(entity: Entity, colId: string, index: number) {
    switch (colId) {
      case "rank":
        return index + 1;
      case "name":
        return (
          <CustomLink href={`/${entity.slug}`} className="group/link flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300">
            {entity.slug === "matador-technologies-inc" && (
              <Star className="text-orange-500 dark:text-orange-400 h-3 w-3 flex-shrink-0 mr-0.5" fill="currentColor" />
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                {/* Flag + Name + Ticker */}
                <span className="flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                  <span className="mr-1">{entity.countryFlag || "🏳️"}</span>
                  <span className=" block truncate max-w-[140px] sm:max-w-none overflow-hidden whitespace-nowrap">{entity.name}</span>
                  {!isMobile && entity.ticker && (
                    <span className="border bg-orange-50/90 dark:bg-orange-950/90 text-[9px] md:text-[12px] px-0.5 sm:px-1 py-0.5 rounded-md ml-1">
                      {entity.ticker}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </CustomLink>
        );
      case "bitcoinHoldings":
        return (
          <div className="flex items-center gap-0.5">
            <span className="text-orange-600 dark:text-orange-400 text-xs font-mono">₿</span>
            <span>{entity.bitcoinHoldings ? Math.round(Number(entity.bitcoinHoldings)).toString() : "—"}</span>
          </div>
        );
      case "usdValue":
        return entity.usdValue ? `$${Math.round(Number(entity.usdValue) / 1000000).toLocaleString()}M` : "—";
      case "marketCap":
        return entity.marketCap ? `$${Math.round(Number(entity.marketCap) / 1000000).toLocaleString()}M` : "—";
      case "enterpriseValue":
        return entity.enterpriseValue ? `$${Math.round(Number(entity.enterpriseValue) / 1000000).toLocaleString()}M` : "—";
      case "btcPerShare":
        return entity.btcPerShare ? (() => {
          const value = Number(entity.btcPerShare);
          const isWholeNumber = Number.isInteger(value);
          return isWholeNumber ? value.toString() : value.toFixed(8).replace(/\.?0+$/, "");
        })() : "—";
      case "costBasis":
        return entity.costBasis ? formatCostBasis(entity.costBasis) : "—";
      case "ngu":
        return entity.ngu ? `${Number(entity.ngu).toFixed(1)}x` : "—";
      case "mNav":
        return entity.mNav ? Number(entity.mNav).toFixed(2) : "—";
      case "supplyPercentage":
        return entity.supplyPercentage ? Number(entity.supplyPercentage).toFixed(3) + "%" : "0.000%";
      default:
        return "";
    }
  }

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-2 sm:px-6 pt-4">
        <div className="relative  flex  justify-between pb-2 sm:pb-2 py-0 px-0 sm:p-0 flex-1 min-w-0">
          <CardTitle className="text-lg sm:text-2xl flex flex-row items-center gap-2 sm:gap-4">
            <div className="p-1 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent text-left">
              {activeTab === "all" ? "All Bitcoin Treasuries" :
                activeTab === "public" ? "Public Companies Bitcoin Treasuries" :
                  activeTab === "private" ? "Private Companies Bitcoin Treasuries" :
                    activeTab === "government" ? "Government Bitcoin Treasuries" :
                      activeTab === "etf" ? "Bitcoin ETF Treasuries" :
                        activeTab === "exchange-defi" ? "Exchange/Defi Bitcoin Treasuries" :
                          "Bitcoin Treasuries"}
            </span>
          </CardTitle>

          {!hideTabsAndTitle && <EmbedModal
            open={embedOpen}
            onOpenChange={setEmbedOpen}
            embedCode={embedCode}
            copied={copied}
            setCopied={setCopied}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-fit px-3 py-1.5 text-xs sm:text-sm font-semibold border-orange-300/50 dark:border-orange-700/50 bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-orange-900/30 dark:to-orange-800/20 shadow-lg duration-300 text-orange-700 dark:text-orange-300 hover:none"
              onClick={() => setEmbedOpen(true)}
              type="button"
            >
              Embed
            </Button>
          </EmbedModal>
          }
        </div>

      </div>
      <CardContent className="relative space-y-4 sm:space-y-6 px-2 sm:px-6 mt-2">
        {!hideTabsAndTitle && <div className="flex justify-between w-full overflow-x-auto">
          <div className="inline-flex h-8 sm:h-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm p-0.5 sm:p-1 min-w-full sm:min-w-0 border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 whitespace-nowrap flex-1 sm:flex-none sm:min-w-[36px] min-h-[24px] sm:min-h-[30px] touch-manipulation",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400 text-white shadow-lg border border-orange-700 dark:border-orange-600"
                    : "text-orange-700 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-200 hover:bg-orange-100/50 dark:hover:bg-orange-900/30"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {!isMobile && (
            <div className="flex gap-3 items-center mt-0">
              <div className="w-28 sm:w-36">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="h-9 sm:h-10 rounded-lg border-orange-200 dark:border-orange-800 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm shadow focus:border-orange-500 dark:focus:border-orange-400 text-sm">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[220px] overflow-y-auto text-sm">
                    <SelectItem value="all">All Countries</SelectItem>
                    {getUniqueCountries(allEntities).map((country) => (
                      <SelectItem key={country.name} value={country.name}>
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40 sm:w-40 lg:w-60">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-7 h-9 sm:h-10 rounded-lg border-orange-200 dark:border-orange-800 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm shadow focus:border-orange-500 dark:focus:border-orange-400 text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>}
        {!hideTabsAndTitle && isMobile && (
          <div className="w-full mb-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full h-8 rounded-lg border-orange-200 dark:border-orange-800 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm shadow focus:border-orange-500 dark:focus:border-orange-400 text-sm">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="max-h-[220px] overflow-y-auto text-sm">
                <SelectItem value="all">All Countries</SelectItem>
                {getUniqueCountries(allEntities).map((country) => (
                  <SelectItem key={country.name} value={country.name}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl">
          {renderTable()}
        </div>
      </CardContent>
    </Card>
  );
}