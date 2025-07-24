import { EntityHistorical, TimeSeriesType } from "@prisma/client";

export enum LinkType {
  OFFICIAL = "OFFICIAL",
  UNOFFICIAL = "UNOFFICIAL",
}

export type SortField = 
  | 'rank'
  | 'type'
  | 'name'
  | 'ticker'
  | 'marketCap'
  | 'enterpriseValue'
  | 'bitcoinHoldings'
  | 'btcPerShare'
  | 'costBasis'
  | 'usdValue'  
  | 'ngu'
  | 'mNav'
  | 'marketCapPercentage'
  | 'supplyPercentage'
  | 'createdAt';

export interface BalanceSheetRow {
  date: string; 
  btcBalance: number;
  change: number;
  costBasis: number;
  marketPrice: number;
  stockPrice: number;
}



export interface EntityLink {
  text: string;
  url: string;
  type: LinkType;
}

export interface BitcoinHoldings {
  holdingSince: string;
  btcBalance: number;
  usdValue: number;
  avgCostPerBTC: number;
  profitLossPercent: number;
}

export interface StockFinancials {
  ticker: string;
  sharePrice: number;
  marketCap: number;
  enterpriseValue: number;
  navMultiple: number;
  btcToMarketCap: number;
}

export interface EntityAbout {
  title: string;
  content: string;
  headings: string[];
  keyPoints: string[];
}

export interface Entity {
  id: string;
  entityId: string | null;
  slug: string | null;
  name: string | null;
  ticker: string | null;
  countryName: string | null;
  countryFlag: string | null;
  type: string | null;
  marketCap: number | null;
  enterpriseValue: number | null;
  bitcoinHoldings: number | null;
  btcPerShare: number | null;
  costBasis: number | null;
  usdValue: number | null;
  ngu: number | null;
  mNav: number | null;
  sharePrice: number | null;
  marketCapPercentage: number | null;
  supplyPercentage: number | null;
  profitLossPercentage: number | null;
  holdingSince: string | null;
  externalWebsiteSlug: string | null;
  avgCostPerBTC: number | null;  
  lastUpdated: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  bitcoinValueInUSD: number | null;
  rank: string | null;
  entityAbout: EntityAbout[] | null;
  entityLinks: EntityLink[] | null;
  balanceSheet: BalanceSheetRow[] | null;
  entityTimeSeries: EntityTimeSeries[] | null;
  entityHistorical: EntityHistorical | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[] | null;
  seoImage: string | null;
}


  export interface EntityTimeSeries {
    id: string;
    entityId: string;
    timestamp: string;
    type: TimeSeriesType;
    value: number;
  }


