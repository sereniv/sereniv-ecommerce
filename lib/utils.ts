import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import getConfig from 'next/config';
let publicRuntimeConfig: any = null
try{
  publicRuntimeConfig = getConfig().publicRuntimeConfig
}catch(error){
  publicRuntimeConfig = {
    basePath: '/bitcoin-treasury-tracker'
  }
  console.error("Error getting config:", error)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getApiUrl(path: string) {
  // Use NEXT_PUBLIC_API_URL if available (for production/external API)
  if (process.env.NEXT_PUBLIC_API_URL) {
    // Remove leading slash from path to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${process.env.NEXT_PUBLIC_API_URL}/api/${cleanPath}`
  }
  
  // Fallback to basePath for local development
  return `${publicRuntimeConfig.basePath}/api${path}`
}

export function getBaseUrl() {
  return `${publicRuntimeConfig.basePath}`
}

export function generateFlag(country_code: string) {
  console.log(`https://flagcdn.com/16x12/${country_code.toLowerCase()}.png`)
  return `https://flagcdn.com/16x12/${country_code.toLowerCase()}.png`
}


export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).replace(/^\w/, (c) => c.toUpperCase());
} 


export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

export function formatNumberWithDecimals(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function formatNumberWithSuffix(num: number | null) {
  if (num === null) return '—';
  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    return num.toString();
  }
};

export function formatNumberWithSmartDecimals(num: number | null, maxDecimals: number = 4): string {
  if (num === null || isNaN(num)) return '—';
  
  const isWholeNumber = Number.isInteger(num);
  if (isWholeNumber) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  const formatted = num.toFixed(maxDecimals);
  const withoutTrailingZeros = formatted.replace(/\.?0+$/, '');
  
  const parts = withoutTrailingZeros.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}

export function formatCostBasis(num: number | null): string {
  if (num === null || isNaN(num)) return '—';
  
  if (Math.abs(num) >= 1_000_000_000_000) {
    const inTrillions = num / 1_000_000_000_000;
    const formatted = inTrillions.toFixed(1).replace(/\.0$/, '');
    const parts = formatted.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart}T`;
  }
  else if (Math.abs(num) >= 1_000_000_000) {
    const inBillions = num / 1_000_000_000;
    const formatted = inBillions.toFixed(1).replace(/\.0$/, '');
    const parts = formatted.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart}B`;
  }

  else if (Math.abs(num) >= 1_000_000) {
    const inMillions = num / 1_000_000;
    const formatted = inMillions.toFixed(1).replace(/\.0$/, '');
    const parts = formatted.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart}M`;
  }

  else if (Math.abs(num) >= 1_000) {
    const inThousands = num / 1_000;
    const formatted = inThousands.toFixed(1).replace(/\.0$/, '');
    const parts = formatted.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart}K`;
  }

  else {
    return `$${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export function formatNumberInMillions(num: number | null): string {
  if (num === null || isNaN(num)) return '—';
  
  const inMillions = num / 1_000_000;
  
  const formatted = inMillions.toFixed(1).replace(/\.0$/, '');
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'M';
}

export function extractNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return NaN;
  
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  if (!value) return NaN;

  let cleaned = value.replace(/[^\d.,\-x%MB]/g, '');

  let multiplier = 1;
  if (cleaned.endsWith('K') || cleaned.endsWith('k')) {  
    multiplier = 1e3;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('M') || cleaned.endsWith('m')) {
      multiplier = 1e6;
      cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('B') || cleaned.endsWith('b')) {
      multiplier = 1e9;
      cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('x') || cleaned.endsWith('X')) {
      multiplier = 1;
      cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('%') || cleaned.endsWith('p')) {
      multiplier = 1;
      cleaned = cleaned.slice(0, -1);
  }

  cleaned = cleaned.replace(/,/g, '');

  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number * multiplier;
}

export function extractCountryAndName(value: string): { flag: string; name: string } {
  const flagRegex = /^[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/;

  const match = value.match(flagRegex);
  if (match) {
      const flag = match[0];
      const name = value.slice(flag.length).trim();
      return { flag, name };
  } else {
      return { flag: '', name: value.trim() };
  }
}


export function cleanSEOIMAGEURL(fullUrl: string) {
  try {
      // Create a URL object from the input string
      const url = new URL(fullUrl);
      // Return the URL without query parameters
      return `${url.origin}${url.pathname}`;
  } catch (error) {
      console.error('Invalid URL provided:', error as Error);
      return null;
  }
}

export function sanitizeHtmlForSEO(html: string | null | undefined): string {
  if (!html) return '';
  
  // Remove HTML tags using regex
  const withoutTags = html.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  const withoutEntities = withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...');
  
  // Clean up extra whitespace and line breaks
  const cleaned = withoutEntities
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limit to reasonable length for SEO (around 160 characters)
  if (cleaned.length > 160) {
    const truncated = cleaned.substring(0, 157);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 120 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }
  
  return cleaned;
}