"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { SortField, Entity } from "@/lib/types/entity"
import {
    ChevronUp,
    ChevronDown,
    Search,
    Star,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Shimmer } from "@/components/ui/shimmer"
import { getApiUrl, formatCurrency, formatNumber, formatNumberWithSuffix } from "@/lib/utils"
import Link from "next/link"
import { CustomLink } from "@/components/custom-link"
import { useBitcoin } from "@/lib/hooks/useBitcoin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SortDirection = 'asc' | 'desc';

export default function EntitiesCustodiansTable({ activeTab, setActiveTab, loading, entityTableData, setEntityTableData, entityTableLoading, isMobile }: { activeTab: string, setActiveTab: (tab: string) => void, loading: boolean, entityTableData: any[], setEntityTableData: (data: any[]) => void, entityTableLoading: boolean, isMobile: boolean }) {

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("all");
    const [sortField, setSortField] = useState<SortField>('bitcoinHoldings');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const { data: bitcoinData, loading: bitcoinLoading, error: bitcoinError, refetch: refetchBitcoin } = useBitcoin()

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getUniqueCountries = () => {
        if (!entityTableData || entityTableData.length === 0) return [];
        
        const countries = entityTableData
            .map(entity => ({
                name: entity.countryName,
                flag: entity.countryFlag
            }))
            .filter(country => country.name && country.name.trim() !== '')
            .reduce((unique, country) => {
                if (!unique.find(c => c.name === country.name)) {
                    unique.push(country);
                }
                return unique;
            }, [] as { name: string; flag: string }[])
            .sort((a, b) => a.name.localeCompare(b.name));

        return countries;
    };

    const sortedEntities = entityTableData.length > 0 ? [...entityTableData]
        .filter(entity =>
            entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entity?.ticker?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(entity => 
            selectedCountry === 'all' || entity?.countryName === selectedCountry
        )
        .sort((a, b) => {
            if (sortField === 'name') {
                return sortDirection === 'asc'
                    ? (a?.name?.localeCompare(b?.name || '') || 0)
                    : (b?.name?.localeCompare(a?.name || '') || 0);
            }
            const aValue = a[sortField as keyof Entity] || 0;
            const bValue = b[sortField as keyof Entity] || 0;

            return sortDirection === 'asc'
                ? (aValue as number) - (bValue as number)
                : (bValue as number) - (aValue as number);
        }) : [];

    const prioritizeMatador = (entities: Entity[]) => {
        if (entities.length === 0) return [];

        const sortedList = [...entities];

        const matadorIndex = sortedList.findIndex(entity =>
                    entity.slug === "matador-technologies-inc"
        );

        if (matadorIndex !== -1) {
            const matador = sortedList.splice(matadorIndex, 1)[0];
            sortedList.unshift(matador);
        }

        return sortedList;
    };

    const finalSortedEntities = prioritizeMatador(sortedEntities);

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return null;
        }
        return sortDirection === 'asc'
            ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-orange-600 dark:text-orange-400" />
            : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-orange-600 dark:text-orange-400" />;
    };

    const renderSortableHeader = (field: SortField, label: string, tooltip?: string) => (
        <div className={`flex justify-start items-center cursor-pointer group transition-colors hover:text-orange-600 dark:hover:text-orange-400`} onClick={() => handleSort(field)}>
            <span className="font-medium">{label}</span>
            {getSortIcon(field)}
            {tooltip && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipContent className="border border-border rounded-md shadow-md p-2">
                            <p className="w-60 text-sm">{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );

    const getEntityTypeBg = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'defi':
                return 'from-emerald-100/20 to-transparent dark:from-emerald-900/20'
            case 'exchange':
                return 'from-orange-100/20 to-transparent dark:from-orange-900/20'
            case 'etf':
                return 'from-blue-100/20 to-transparent dark:from-blue-900/20'
            default:
                return 'from-orange-100/20 to-transparent dark:from-orange-900/20'
        }
    }

    return (
        <Card data-table="custodians" className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-24 translate-x-24 sm:-translate-y-48 sm:translate-x-48 transition-transform duration-1000 group-hover:scale-110" />

            <CardHeader className="relative pb-4 sm:pb-6 py-4 px-2 sm:p-6">
                <CardTitle className="text-lg sm:text-3xl flex flex-row items-center gap-2 sm:gap-4">
                    <div className="p-1 sm:p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center">
                        <Search className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent text-left">
                        Top Bitcoin Treasury Custodians
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="relative space-y-4 sm:space-y-6 px-2 sm:px-6">
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="w-full overflow-x-auto">
                        <div className="inline-flex h-9 sm:h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm p-1 sm:p-1.5 min-w-full sm:min-w-0 border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'defi', label: 'DeFi' },
                                { id: 'exchange', label: 'Exchange' },
                                { id: 'etf', label: 'ETF' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    className={cn(
                                        "rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 whitespace-nowrap flex-1 sm:flex-none sm:min-w-[44px] min-h-[28px] sm:min-h-[36px] touch-manipulation",
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
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="relative flex-1 max-w-full sm:max-w-[200px]">
                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                <SelectTrigger className="h-10 sm:h-12 rounded-xl border-orange-200 dark:border-orange-800 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm shadow-lg focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300">
                                    <SelectValue placeholder="Filter by country" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    <SelectItem value="all">All Countries</SelectItem>
                                    {getUniqueCountries().map((country) => (
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

                        <div className="relative flex-1 max-w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or country..."
                                className="pl-10 h-10 sm:h-12 rounded-xl border-orange-200 dark:border-orange-800 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm shadow-lg focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300 touch-manipulation"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                        <span>Showing {loading ? "Loading..." : finalSortedEntities.length} entities{selectedCountry !== 'all' && ` in ${selectedCountry}`}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-medium">
                        <span className="text-muted-foreground">
                            BTC Price: <span className="text-orange-600 dark:text-orange-400 font-semibold">{loading ? "Loading..." : formatCurrency(bitcoinData?.price || 0)}</span>
                        </span>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl">
                    <div className="overflow-auto">
                        {isMobile ? (
                            <MobileEntitiesTable
                                renderSortableHeader={renderSortableHeader}
                                loading={loading}
                                entityTableData={entityTableData}
                                finalSortedEntities={finalSortedEntities}
                                getEntityTypeBg={getEntityTypeBg}
                                formatNumberWithSuffix={formatNumberWithSuffix}
                            />
                        ) : (
                            <DesktopEntitiesTable
                                renderSortableHeader={renderSortableHeader}
                                loading={loading}
                                entityTableData={entityTableData}
                                finalSortedEntities={finalSortedEntities}
                                getEntityTypeBg={getEntityTypeBg}
                                formatNumberWithSuffix={formatNumberWithSuffix}
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const MobileEntitiesTable = ({
    renderSortableHeader,
    loading,
    entityTableData,
    finalSortedEntities,
    getEntityTypeBg,
    formatNumberWithSuffix
}: {
    renderSortableHeader: (field: SortField, label: string, tooltip?: string) => React.ReactNode;
    loading: boolean;
    entityTableData: Entity[];
    finalSortedEntities: Entity[];
    getEntityTypeBg: (type: string) => string;
    formatNumberWithSuffix: (number: number) => string;
}) => {
    const MobileTableRowShimmer = () => (
        <TableRow className="border-b border-border/50">
            <TableCell className="py-1 px-1 w-[8%]">
                <Shimmer className="h-3 w-6" />
            </TableCell>
            <TableCell className="py-1 px-1 w-[8%]">
                <Shimmer className="h-3 w-6" />
            </TableCell>
            <TableCell className="py-1 px-1 w-[20%]">
                <Shimmer className="h-3 w-16" />
            </TableCell>
            <TableCell className="py-1 px-1 text-right w-[14%]">
                <Shimmer className="h-3 w-10 ml-auto" />
            </TableCell>
            <TableCell className="py-1 px-1 text-right w-[16%]">
                <Shimmer className="h-3 w-12 ml-auto" />
            </TableCell>
            <TableCell className="py-1 px-1 text-right w-[16%]">
                <Shimmer className="h-3 w-10 ml-auto" />
            </TableCell>
            <TableCell className="py-1 px-1 text-right w-[18%]">
                <Shimmer className="h-3 w-8 ml-auto" />
            </TableCell>
        </TableRow>
    );

    return (
        <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90 font-mono tracking-tight text-xs">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="py-1 px-1 w-[8%] sticky left-0 bg-gradient-to-r from-orange-50/95 to-orange-100/75 dark:from-orange-950/95 font-mono tracking-tight text-[9px]">
                        {renderSortableHeader('rank', '#', 'Entity ranking')}
                    </TableHead>
                    <TableHead className="py-1 px-1 font-medium text-[10px] w-[8%] font-mono tracking-tight text-[9px]">
                        
                    </TableHead>
                    <TableHead className="py-1 px-1 font-medium text-[10px] w-[20%] font-mono tracking-tight text-[9px]">
                        {renderSortableHeader('name', 'Name', 'Company or entity name')}
                    </TableHead>
                    <TableHead className="py-1 px-1 font-medium text-[10px] text-left w-[16%] font-mono tracking-tight text-[9px]">
                        {renderSortableHeader('bitcoinHoldings', 'Bitcoin', 'Total Bitcoin holdings')}
                    </TableHead>
                    <TableHead className="py-1 px-1 font-medium text-[10px] text-left w-[16%] font-mono tracking-tight text-[9px]">
                        {renderSortableHeader('usdValue', 'USD Value', 'Current value of Bitcoin holdings')}
                    </TableHead>
                    <TableHead className="py-1 px-1 font-medium text-[10px] text-left w-[12%] font-mono tracking-tight text-[9px]">
                        {renderSortableHeader('marketCap', 'M.Cap', 'Total market capitalization')}
                    </TableHead>
                    <TableHead className="py-1 px-1 font-medium text-[10px] text-left w-[12%] font-mono tracking-tight text-[9px]">
                        {renderSortableHeader('supplyPercentage', '/21M', 'Percentage of total Bitcoin supply (21M)')}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30">
                {loading ? (
                    Array(30).fill(0).map((_, index) => (
                        <MobileTableRowShimmer key={index} />
                    ))
                ) : entityTableData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-16">
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
                    finalSortedEntities.map((entity: Entity, index: number) => (
                        <TableRow
                            key={entity.id}
                            className={cn(
                                "group/row cursor-pointer transition-all duration-300 border-b border-border/30 touch-manipulation",
                                `hover:bg-gradient-to-r hover:${getEntityTypeBg(entity.type || "")}`,
                                entity.slug === "matador-technologies-inc" ? "bg-gradient-to-r from-orange-100/20 to-transparent dark:from-orange-900/20 border-orange-300/30 dark:border-orange-700/30" : ""
                            )}
                        >
                            <TableCell className="py-1 px-1 w-[8%] border-r border-border/20 font-mono tracking-tight text-[9px]">
                                <span className="text-[9px] text-foreground font-mono tracking-tight">
                                    {index + 1}
                                </span>
                            </TableCell>
                            <TableCell className="py-1 px-1 w-[8%] border-r border-border/20 font-mono tracking-tight text-[9px]">
                                <span className="text-[9px]">{entity.countryFlag || '🏳️'}</span>
                            </TableCell>
                            <TableCell className="py-1 px-1 w-[20%] border-r border-border/20 overflow-hidden font-mono tracking-tight text-xs">
                                <CustomLink href={`/${entity.slug}`} className="group/link flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300">
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                        <div className="text-[9px] text-foreground group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors truncate">
                                            <span className="truncate">
                                                {entity.name && entity.name.length > 12 ? entity.name.substring(0, 12) + "..." : entity.name}
                                            </span>
                                        </div>
                                    </div>
                                </CustomLink>
                            </TableCell>

                            <TableCell className="py-1 px-1 text-left w-[16%] font-mono tracking-tight text-xs">
                                <div className="flex items-center justify-start gap-0.5">
                                    <span className="text-orange-600 dark:text-orange-400  text-[9px] font-mono">₿</span>
                                    <span className="text-[9px] text-foreground font-mono tracking-tight">
                                        {entity.bitcoinHoldings ? Math.round(Number(entity.bitcoinHoldings)).toString() : '—'}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="py-1 px-1 text-left w-[16%] font-mono tracking-tight text-xs">
                                <span className="text-[9px] text-foreground font-mono tracking-tight">
                                    {entity.usdValue ? `$${Math.round(Number(entity.usdValue) / 1000000).toLocaleString()}M` : '—'}
                                </span>
                            </TableCell>

                            <TableCell className="py-1 px-1 text-left w-[12%] font-mono tracking-tight text-xs">
                                {entity.marketCap ? (
                                    <span className="text-[9px] text-foreground font-mono tracking-tight">${Math.round(Number(entity.marketCap) / 1000000).toLocaleString()}M</span>
                                ) : (
                                    <span className="text-muted-foreground text-[9px] font-mono tracking-tight">—</span>
                                )}
                            </TableCell>

                            <TableCell className="py-1 px-1 text-left w-[12%] font-mono tracking-tight text-[9px]">
                                <span className="text-[9px] text-foreground font-mono tracking-tight">
                                    {entity.supplyPercentage ? entity.supplyPercentage.toFixed(3) : '0.000'}%
                                </span>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};

const DesktopEntitiesTable = ({
    renderSortableHeader,
    loading,
    entityTableData,
    finalSortedEntities,
    getEntityTypeBg,
    formatNumberWithSuffix
}: {
    renderSortableHeader: (field: SortField, label: string, tooltip?: string) => React.ReactNode;
    loading: boolean;
    entityTableData: Entity[];
    finalSortedEntities: Entity[];
    getEntityTypeBg: (type: string) => string;
    formatNumberWithSuffix: (number: number) => string;
}) => {
    const DesktopTableRowShimmer = () => (
        <TableRow className="border-b border-border/50">
            <TableCell className="py-3 px-2 w-[6%]">
                <Shimmer className="h-4 w-8" />
            </TableCell>
            <TableCell className="py-3 px-2 w-[6%]">
                <Shimmer className="h-4 w-8" />
            </TableCell>
            <TableCell className="py-3 px-2 w-[20%]">
                <Shimmer className="h-4 w-20" />
            </TableCell>
            <TableCell className="py-3 px-2 text-right w-[7%]">
                <Shimmer className="h-4 w-12 ml-auto" />
            </TableCell>
            <TableCell className="py-3 px-2 text-right w-[8%]">
                <Shimmer className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell className="py-3 px-2 text-right w-[8%]">
                <Shimmer className="h-4 w-14 ml-auto" />
            </TableCell>
            <TableCell className="py-3 px-2 text-right w-[8%]">
                <Shimmer className="h-4 w-10 ml-auto" />
            </TableCell>
        </TableRow>
    );

    return (
        <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="py-3 px-2 font-medium text-sm w-[6%] sticky left-0 bg-gradient-to-r from-orange-50/95 to-orange-100/75 dark:from-orange-950/95 font-mono tracking-tight text-xs">
                        {renderSortableHeader('rank', '#', 'Entity ranking')}
                    </TableHead>
                    <TableHead className="py-3 px-2 font-medium text-sm w-[6%] font-mono tracking-tight text-xs">
                        Flag
                    </TableHead>
                    <TableHead className="py-3 px-2 font-medium text-sm w-[20%] font-mono tracking-tight text-xs">
                        {renderSortableHeader('name', 'Name', 'Company or entity name')}
                    </TableHead>
                    <TableHead className="py-3 px-2 font-medium text-sm text-right w-[7%] font-mono tracking-tight text-xs">
                        {renderSortableHeader('bitcoinHoldings', 'Bitcoin', 'Total Bitcoin holdings')}
                    </TableHead>
                    <TableHead className="py-3 px-2 font-medium text-sm text-right w-[8%] font-mono tracking-tight text-xs">
                        {renderSortableHeader('usdValue', 'USD Value', 'Current value of Bitcoin holdings')}
                    </TableHead>
                    <TableHead className="py-3 px-2 font-medium text-sm text-right w-[8%] font-mono tracking-tight text-xs">
                        {renderSortableHeader('marketCap', 'Market Cap', 'Total market capitalization')}
                    </TableHead>
                    <TableHead className="py-3 px-2 font-medium text-sm text-right w-[8%] font-mono tracking-tight text-xs">
                        {renderSortableHeader('supplyPercentage', '/21M', 'Percentage of total Bitcoin supply (21M)')}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30">
                {loading ? (
                    Array(30).fill(0).map((_, index) => (
                        <DesktopTableRowShimmer key={index} />
                    ))
                ) : entityTableData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-16">
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
                    finalSortedEntities.map((entity: Entity, index: number) => (
                        <TableRow
                            key={entity.id}
                            className={cn(
                                "group/row cursor-pointer transition-all duration-300 border-b border-border/30 touch-manipulation",
                                `hover:bg-gradient-to-r hover:${getEntityTypeBg(entity.type || "")}`,
                                entity.slug === "matador-technologies-inc" ? "bg-gradient-to-r from-orange-100/20 to-transparent dark:from-orange-900/20 border-orange-300/30 dark:border-orange-700/30" : ""
                            )}
                        >
                            <TableCell className="py-3 px-2 w-[6%] border-r border-border/20 font-mono tracking-tight text-xs">
                                <span className="text-sm text-foreground font-mono tracking-tight text-xs">
                                    { index + 1}
                                </span>
                            </TableCell>
                            <TableCell className="py-3 px-2 w-[6%] border-r border-border/20 font-mono tracking-tight text-xs">
                                <span className="text-lg">{entity.countryFlag || '🏳️'}</span>
                            </TableCell>
                            <TableCell className="py-3 px-2 w-[20%] border-r border-border/20 overflow-hidden font-mono tracking-tight text-xs">
                                <CustomLink href={`/${entity.slug}`} className="group/link flex items-center hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300">
                                    {entity.slug === "matador-technologies-inc" && (
                                        <Star className="text-orange-500 dark:text-orange-400 h-3 w-3 flex-shrink-0 mr-0.5" fill="currentColor" />
                                    )}
                                    <div className="font-mono tracking-tight text-xs min-w-0 flex-1 overflow-hidden">
                                        <div className="text-sm text-foreground font-mono tracking-tight group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors truncate">
                                            <span className="max-w-[200px] truncate font-mono tracking-tight text-xs">{entity.name && entity.name}</span>{entity.type === "ETF" && <span className="border bg-orange-50/90  dark:bg-orange-950/90 text-xs font-medium px-1 py-0.5 rounded-md ml-1">{entity.ticker}</span>}
                                        </div>
                                    </div>
                                </CustomLink>
                            </TableCell>

                            <TableCell className="py-3 px-2 text-right w-[7%] font-mono tracking-tight text-xs">
                                <div className="flex items-center justify-start gap-0.5">
                                    <span className="text-orange-600 dark:text-orange-400  text-xs font-mono">₿</span>
                                    <span className="text-sm text-foreground px-2 font-mono tracking-tight text-xs">
                                        {entity.bitcoinHoldings ? Math.round(Number(entity.bitcoinHoldings)).toString() : '—'}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="py-3 px-2 text-left w-[8%] font-mono tracking-tight text-xs">
                                <span className="text-sm text-foreground px-2 font-mono tracking-tight text-xs">
                                    {entity.usdValue ? `$${Math.round(Number(entity.usdValue) / 1000000).toLocaleString()}M` : '—'}
                                </span>
                            </TableCell>

                            <TableCell className="py-3 px-2 text-left w-[8%] font-mono tracking-tight text-xs">
                                {entity.marketCap ? (
                                    <span className="text-sm text-foreground px-2 font-mono tracking-tight text-xs">${Math.round(Number(entity.marketCap) / 1000000).toLocaleString()}M</span>
                                ) : (
                                    <span className="text-muted-foreground text-xs font-mono tracking-tight">—</span>
                                )}
                            </TableCell>

                            <TableCell className="py-3 px-2 text-left w-[8%] font-mono tracking-tight text-xs">
                                <span className="text-sm text-foreground px-2 font-mono tracking-tight text-xs">
                                    {entity.supplyPercentage ? entity.supplyPercentage.toFixed(3) : '0.000'}%
                                </span>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};