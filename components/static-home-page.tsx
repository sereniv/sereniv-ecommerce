"use client"

import { useEffect, useState } from "react"
import HeroSection from "@/components/hero-section"
import EntitiesCompaniesTable from "@/components/entities-companies-table"
import EntitiesCustodiansTable from "@/components/entities-custodians-table"
import BitcoinHoldingsChart from "@/components/bitcoin-holdings-chart"
import ColumnTreemapChart from "@/components/column-treemap-chart"
import RowTreemapChart from "@/components/row-treemap-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver"
import { Entity } from "@/lib/types/entity"
import { getApiUrl } from "@/lib/utils"
import EntitiesTable from "./entities-table"
import { cn } from "@/lib/utils"
import { BarChart3, DollarSign, Bitcoin, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy } from "lucide-react"
import { useTheme } from "next-themes"
import EmbedModal from "./embed-modal";


interface HoldingsDataPoint {
  timestamp: number;
  privateCompanies: number;
  publicCompanies: number;
  governments: number;
  defi: number;
  exchange: number;
  etf: number;
  total: number;
}

interface StaticHomePageProps {
  initialData: {
    companiesData: Entity[]
    custodiansData: Entity[]
    summaryData: any
    bitcoinHoldingsData: HoldingsDataPoint[]
  }
}

export default function StaticHomePage({ initialData }: StaticHomePageProps) {

  const [companiesActiveTab, setCompaniesActiveTab] = useState<string>('all')
  const [custodiansActiveTab, setCustodiansActiveTab] = useState<string>('all')
  const [entityCompaniesTableData, setEntityCompaniesTableData] = useState<Entity[]>(initialData.companiesData)
  const [treemapData, setTreemapData] = useState<Entity[]>([])
  const [entityCompaniesTableLoading, setEntityCompaniesTableLoading] = useState(false)
  const [treemapLoading, setTreemapLoading] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [entityCustodiansTableData, setEntityCustodiansTableData] = useState<Entity[]>(initialData.custodiansData)
  const [entityCustodiansTableLoading, setEntityCustodiansTableLoading] = useState(false)
  const [allCompaniesData, setAllCompaniesData] = useState<Entity[]>(initialData.companiesData)
  const [allCustodiansData, setAllCustodiansData] = useState<Entity[]>(initialData.custodiansData)
  const [filterNotification, setFilterNotification] = useState<string | null>(null)
  const [embedOpen, setEmbedOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/bitcoin-treasury-tracker/embed/bitcoin-holdings-chart" width="100%" height="500" frameborder="0" style="border:0;" allowfullscreen></iframe>`


  const handlePieChartFilter = (category: string) => {
    const categoryMapping = {
      'Public': 'public',
      'Private': 'private',
      'Government': 'government',
      'DeFi': 'defi',
      'Exchange': 'exchange',
      'ETF': 'etf'
    }

    const mappedCategory = categoryMapping[category as keyof typeof categoryMapping]

    if (mappedCategory) {
      setFilterNotification(`Filtering by ${category} entities`)
      setTimeout(() => setFilterNotification(null), 3000)

      if (['public', 'private', 'government'].includes(mappedCategory)) {
        setCompaniesActiveTab(mappedCategory)
        setTimeout(() => {
          const companiesTable = document.querySelector('[data-table="companies"]')
          if (companiesTable) {
            companiesTable.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else if (['defi', 'exchange', 'etf'].includes(mappedCategory)) {
        setCustodiansActiveTab(mappedCategory)
        setTimeout(() => {
          const custodiansTable = document.querySelector('[data-table="custodians"]')
          if (custodiansTable) {
            custodiansTable.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768

  useEffect(() => {
    const fetchEntitiesCompanies = async () => {
      try {
        setEntityCompaniesTableLoading(true)
        const response = await fetch(getApiUrl(`/entities/companies?type=${companiesActiveTab}`))

        const data = await response.json()
        if (data.success) {
          setEntityCompaniesTableData(data.data)
          setEntityCompaniesTableLoading(false)
        }
      } catch (error) {
        console.error('Error fetching entities:', error)
        setEntityCompaniesTableData([])
      } finally {
        setEntityCompaniesTableLoading(false)
      }
    }

    fetchEntitiesCompanies()
  }, [companiesActiveTab])

  useEffect(() => {
    const fetchEntitiesCustodians = async () => {
      try {
        setEntityCustodiansTableLoading(true)
        const response = await fetch(getApiUrl(`/entities/custodians?type=${custodiansActiveTab}`))

        const data = await response.json()
        if (data.success) {
          setEntityCustodiansTableData(data.data)
          setEntityCustodiansTableLoading(false)
        }
      } catch (error) {
        console.error('Error fetching entities:', error)
        setEntityCustodiansTableData([])
      } finally {
        setEntityCustodiansTableLoading(false)
      }
    }

    fetchEntitiesCustodians()
  }, [custodiansActiveTab])

  useEffect(() => {
    const fetchAllEntityTypes = async () => {
      try {
        const companyTypes = ['all', 'public', 'private', 'government']
        const custodianTypes = ['all', 'defi', 'exchange', 'etf']

        const companyPromises = companyTypes.map(type =>
          fetch(getApiUrl(`/entities/companies?type=${type}`)).then(res => res.json())
        )

        const custodianPromises = custodianTypes.map(type =>
          fetch(getApiUrl(`/entities/custodians?type=${type}`)).then(res => res.json())
        )

        const companyResults = await Promise.all(companyPromises)
        const custodianResults = await Promise.all(custodianPromises)

        const allCompanies = companyResults[0].success && companyResults[0].data.length > 0
          ? companyResults[0].data
          : companyResults.slice(1).flatMap(result => result.success ? result.data : [])

        const allCustodians = custodianResults[0].success && custodianResults[0].data.length > 0
          ? custodianResults[0].data
          : custodianResults.slice(1).flatMap(result => result.success ? result.data : [])

        setAllCompaniesData(allCompanies)
        setAllCustodiansData(allCustodians)

      } catch (error) {
        console.error('Error fetching all entity data:', error)
        setAllCompaniesData([])
        setAllCustodiansData([])
      }
    }

    fetchAllEntityTypes()
  }, [])

  useEffect(() => {
    setTreemapLoading(true)

    const combinedData = [...allCompaniesData, ...allCustodiansData]
    setTreemapData(combinedData)

    setTreemapLoading(false)
  }, [allCompaniesData, allCustodiansData])

  const { theme } = useTheme()

  return (
    <main className="min-h-screen  bg-gradient-to-br from-orange-50 via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50">
      {filterNotification && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 ease-out animate-in slide-in-from-right">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{filterNotification}</span>
          </div>
        </div>
      )}

      <HeroSection onPieChartFilter={handlePieChartFilter} initialSummaryData={initialData.summaryData} />

      <div className="container mx-auto px-2  lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12">
        <EntitiesTable
          companies={entityCompaniesTableData}
          custodians={entityCustodiansTableData}
        />


        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

          <CardHeader className="relative pb-3 sm:pb-4 md:pb-6 p-3 sm:p-4 md:p-6">
            <CardTitle className={cn(
              "flex items-center gap-2 sm:gap-4",
              isMobile ? "text-base flex-col text-center md:text-lg" : "text-xl sm:text-2xl"
            )}>
              <div className="p-1 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <BarChart3 className={cn("text-orange-600 dark:text-orange-400", isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-7 sm:w-7")} />
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 dark:from-orange-400 dark:via-orange-300 dark:to-orange-400 bg-clip-text text-transparent">
                  Distribution of Bitcoin Over Time
                </span>
                <span className={cn(
                  "text-muted-foreground font-normal",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  This chart shows the distribution of Bitcoin over time for all tracked entity groups.
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
          <CardContent className="relative p-3 sm:p-4 md:p-6">
            <div className="w-full h-[400px] sm:h-[500px]">
              <BitcoinHoldingsChart data={initialData.bitcoinHoldingsData} />
            </div>
          </CardContent>
        </Card>

        <div>
          {isMobile ? (
            <RowTreemapChart
              treemapData={treemapData}
              treemapLoading={treemapLoading}
              setTreemapData={setTreemapData}
              loading={treemapLoading}
              forceHoldingsOnly={false}
            />
          ) : (
            <ColumnTreemapChart
              treemapData={treemapData}
              treemapLoading={treemapLoading}
              setTreemapData={setTreemapData}
              loading={treemapLoading}
              forceHoldingsOnly={false}
            />
          )}
        </div>
      </div>
    </main>
  )
}