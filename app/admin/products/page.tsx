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
  Pencil,
  Plus,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Shimmer } from "@/components/ui/shimmer"
import { getApiUrl, formatNumberWithSuffix } from "@/lib/utils"
import { CustomLink } from "@/components/custom-link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SortDirection = 'asc' | 'desc';

export default function AdminEntitiesPage() {

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('bitcoinHoldings');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [entityTableData, setEntityTableData] = useState<Entity[]>([]);
  const [entityTableLoading, setEntityTableLoading] = useState(true);


  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setEntityTableLoading(true);
        const response = await fetch(getApiUrl(`/admin/entities?type=${activeTab}`));

        const data = await response.json();
        if (data.success) {
          setEntityTableData(data.data);
          setEntityTableLoading(false);
        }
      } catch (error) {
        console.error('Error fetching entities:', error);
        setEntityTableData([]);
      } finally {
        setEntityTableLoading(false);
      }
    };

    fetchEntities();
  }, [activeTab]);


  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntities = entityTableData.length > 0 ? [...entityTableData]
    .filter(entity =>
      entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity?.ticker?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? (a?.name?.localeCompare(b?.name || '') || 0)
          : (b?.name?.localeCompare(a?.name || '') || 0);
      }
      if (sortField === 'createdAt') {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
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
      entity.name === "Matador Technologies Inc" ||
      entity.id === "matador-technologies"
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
      return (
        <div className="flex flex-col h-4 w-4 ml-1">
          <ChevronUp className="h-2 w-4 text-orange-600 dark:text-orange-400" />
          <ChevronDown className="h-2 w-4 text-orange-600 dark:text-orange-400" />
        </div>
      );
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="h-4 w-4 ml-1 text-orange-600 dark:text-orange-400" />
      : <ChevronDown className="h-4 w-4 ml-1 text-orange-600 dark:text-orange-400" />;
  };

  const renderSortableHeader = (field: SortField, label: string, tooltip?: string) => (
    <div className="flex items-center cursor-pointer group transition-colors hover:text-orange-600 dark:hover:text-orange-400" onClick={() => handleSort(field)}>
      <span className="font-medium">{label}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipContent className="border border-border rounded-md shadow-md p-2">
              <p className="w-60 text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {getSortIcon(field)}
    </div>
  );

  const TableRowShimmer = () => (
    <TableRow className="border-b border-border/50">
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
        <Shimmer className="h-4 sm:h-5 w-32 sm:w-40" />
      </TableCell>
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-right">
        <Shimmer className="h-4 sm:h-5 w-12 sm:w-16 ml-auto" />
      </TableCell>
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-right">
        <Shimmer className="h-4 sm:h-5 w-16 sm:w-20 ml-auto" />
      </TableCell>
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-right">
        <Shimmer className="h-4 sm:h-5 w-10 sm:w-12 ml-auto" />
      </TableCell>
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-right">
        <Shimmer className="h-4 sm:h-5 w-10 sm:w-12 ml-auto" />
      </TableCell>
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-right">
        <Shimmer className="h-4 sm:h-5 w-10 sm:w-12 ml-auto" />
      </TableCell>
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-right">
        <Shimmer className="h-4 sm:h-5 w-10 sm:w-12 ml-auto" />
      </TableCell>
      <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-right">
        <Shimmer className="h-4 sm:h-5 w-10 sm:w-12 ml-auto" />
      </TableCell>
    </TableRow>
  );

  const getEntityTypeBg = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'government':
        return 'from-emerald-100/20 to-transparent dark:from-emerald-900/20'
      case 'public':
        return 'from-orange-100/20 to-transparent dark:from-orange-900/20'
      case 'private':
        return 'from-blue-100/20 to-transparent dark:from-blue-900/20'
      default:
        return 'from-orange-100/20 to-transparent dark:from-orange-900/20'
    }
  }

return (
    <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12">
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-24 translate-x-24 sm:-translate-y-48 sm:translate-x-48 transition-transform duration-1000 group-hover:scale-110" />
        <CardContent className="relative space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="w-full overflow-x-auto flex justify-between items-center">
              <div className="inline-flex h-10 sm:h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-50/80 to-orange-100/60 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm p-1.5 min-w-full sm:min-w-0 border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'public', label: 'Public' },
                  { id: 'private', label: 'Private' },
                  { id: 'government', label: 'Government' },
                  { id: 'defi', label: 'DeFi' },
                  { id: 'exchange', label: 'Exchange' },
                  { id: 'etf', label: 'ETF' },

                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      "rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 whitespace-nowrap min-w-[44px] min-h-[36px] touch-manipulation",
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

              <div>
                <Button variant="outline" size="sm" asChild className="border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-orange-500/50 hover:shadow-md transition-all duration-300 group/button">
                  <CustomLink href="/admin/add-entity" className="flex items-center gap-2">
                    <Plus className="h-3 w-3 group-hover/button:text-orange-600 dark:group-hover/button:text-orange-400 transition-colors duration-300" />
                    <span className="text-base py-2  font-medium group-hover/button:text-orange-600 dark:group-hover/button:text-orange-400 transition-colors duration-300">Add Entity</span>
                  </CustomLink>
                </Button>
              </div>
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">
              {entityTableLoading ? (
                <Shimmer className="h-4 sm:h-5 w-24 sm:w-32" />
              ) : (
                <span>Showing {entityTableData.length} entities</span>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-xl">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500/30 dark:scrollbar-thumb-orange-400/30 scrollbar-track-transparent hover:scrollbar-thumb-orange-500/50 dark:hover:scrollbar-thumb-orange-400/50">
              <Table className="w-full min-w-[1000px]">
                <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90 dark:to-orange-900/70 backdrop-blur-sm border-b border-orange-200/50 dark:border-orange-800/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm  sticky min-w-[50px] max-w-[50px] left-0 bg-gradient-to-r from-orange-50/95 to-orange-100/75 dark:from-orange-950/95 dark:to-orange-900/75 backdrop-blur-sm z-20 border-r border-orange-200/30 dark:border-orange-800/30">
                      {renderSortableHeader('rank', 'Rank', 'Company or entity rank')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm  left-0  min-w-[100px] max-w-[100px] backdrop-blur-sm z-20 border-r border-orange-200/30 dark:border-orange-800/30">
                      {renderSortableHeader('name', 'Name', 'Company or entity name')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-left min-w-[100px]">
                      {renderSortableHeader('marketCap', 'Market Cap', 'Total market capitalization')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-left min-w-[100px] max-w-[100px]">
                      {renderSortableHeader('bitcoinHoldings', 'BTC', 'Total Bitcoin holdings')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-left min-w-[100px]">
                      {renderSortableHeader('btcPerShare', 'BTC/Share', 'Bitcoin per share')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-left min-w-[100px]">
                      {renderSortableHeader('usdValue', 'USD', 'Current value of Bitcoin holdings')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-left min-w-[80px]">
                      {renderSortableHeader('supplyPercentage', '21M', 'Percentage of total Bitcoin supply (21M)')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-left min-w-[100px]">
                      {renderSortableHeader('createdAt', 'Created At', 'Date entity was created')}
                    </TableHead>
                    <TableHead className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-right min-w-[80px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/30">
                  {entityTableLoading || entityTableData.length === 0 ? (
                    Array(20).fill(0).map((_, index) => (
                      <TableRowShimmer key={index} />
                    ))
                  ) : entityTableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-16">
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
                          entity.name === "Matador Technologies Inc" && "bg-gradient-to-r from-orange-100/20 to-transparent dark:from-orange-900/20 border-orange-300/30 dark:border-orange-700/30"
                        )}
                      >
                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          <span className="font-medium text-xs sm:text-sm text-foreground">
                            {entity.rank}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          <CustomLink href={`/admin/edit-entity/${entity.slug}`} className="group/link flex items-center gap-1 sm:gap-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300">
                            <span className="text-sm sm:text-base flex-shrink-0">{entity.countryFlag}</span>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="font-semibold text-xs sm:text-sm text-foreground group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 transition-colors truncate">
                                {entity.name}
                              </div>
                              {entity.ticker && entity.ticker !== 'N/A' && (
                                <div className="text-xs text-muted-foreground font-medium truncate">
                                  {entity.ticker}
                                </div>
                              )}
                            </div>
                          </CustomLink>
                        </TableCell>

                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          {entity.marketCap ? (
                            <span className="font-semibold text-xs sm:text-sm text-foreground font-mono tracking-tight">${formatNumberWithSuffix(entity.marketCap)}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">—</span>
                          )}
                        </TableCell>

                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          <div className="flex items-center justify-start gap-1">
                            <span className="text-orange-600 dark:text-orange-400 font-bold text-xs sm:text-sm">₿</span>
                            <span className="font-semibold text-xs sm:text-sm text-foreground font-mono tracking-tight">
                              {(() => {
                                const value = Number(entity.bitcoinHoldings);
                                const isWholeNumber = Number.isInteger(value);
                                return isWholeNumber ? value.toString() : value.toFixed(2);
                              })()}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          <span className="font-medium text-xs sm:text-sm text-foreground font-mono tracking-tight">
                            {entity.btcPerShare ? (() => {
                              const value = Number(entity.btcPerShare);
                              const isWholeNumber = Number.isInteger(value);
                              return isWholeNumber ? value.toString() : value.toFixed(8).replace(/\.?0+$/, '');
                            })() : '—'}
                          </span>
                        </TableCell>



                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          <span className="font-semibold text-xs sm:text-sm text-foreground font-mono tracking-tight">
                            {entity.usdValue ? `$${formatNumberWithSuffix(entity.usdValue)}` : '—'}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          <span className="font-medium text-xs sm:text-sm text-foreground font-mono tracking-tight">
                            {entity.supplyPercentage ? entity.supplyPercentage.toFixed(2) : '0.00'}%
                          </span>
                        </TableCell>
                        <TableCell className="py-3 sm:py-4 px-2 sm:px-4 text-left">
                          <span className="font-medium text-xs sm:text-sm text-foreground font-mono tracking-tight">
                            {entity.createdAt ? new Date(entity.createdAt).toLocaleDateString() : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-orange-500/50 hover:shadow-md transition-all duration-300 group/button"
                            >
                              <CustomLink href={"/admin/edit-entity/" + entity.slug} className="flex items-center gap-2">
                                <Pencil className="h-3 w-3 group-hover/button:text-orange-600 dark:group-hover/button:text-orange-400 transition-colors duration-300" />
                                <span className="text-xs font-medium group-hover/button:text-orange-600 dark:group-hover/button:text-orange-400 transition-colors duration-300">Edit</span>
                              </CustomLink>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

