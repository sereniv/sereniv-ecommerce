"use client";

import Script from "next/script";
import { Entity } from '@/lib/types/entity'


interface WebsiteSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function WebsiteSchema({ title, description, url, imageUrl }: WebsiteSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "description": description,
    "url": url,
    ...(imageUrl && { "image": imageUrl })
  };

  return (
    <Script
      id="website-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function OrganizationSchema({ name, url, logo, description }: OrganizationSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    ...(logo && { "logo": logo }),
    ...(description && { "description": description })
  };

  return (
    <Script
      id="organization-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Script
      id="breadcrumb-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}



export function EntityListSchema({ entities }: { entities: Entity[] }) {
  if (!entities || entities.length === 0) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://droomdroom.com";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": entities.map((entity, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": entity.name,
        "description": entity.entityAbout?.[0]?.content?.split('\n\n')[0] || `${entity.name} ${entity.ticker ? `(${entity.ticker})` : ''} ${entity.type ? `is a ${entity.type.toLowerCase()} bitcoin treasury entity` : ''}`,
        "sku": entity.ticker,
        "category": entity.type,
        "brand": {
          "@type": "Organization",
          "name": entity.name
        },
        "offers": {
          "@type": "Offer",
          "price": entity.usdValue || 0,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `${appUrl}/${entity.externalWebsiteSlug || 'entity'}`
        },
        "image": `${appUrl}/bitcoin-treasury-tracker/assets/og-image-new.png`,
        "url": `${appUrl}/${entity.externalWebsiteSlug || 'entity'}`,
        "additionalProperty": [
          entity.holdingSince ? {
            "@type": "PropertyValue",
            "name": "Holding Since",
            "value": entity.holdingSince
          } : null,
          entity.countryFlag ? {
            "@type": "PropertyValue",
            "name": "Country",
            "value": entity.countryFlag
          } : null
        ].filter(Boolean)
      }
    }))
  };

  return (
    <Script
      id="entity-list-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  );
}



export function EntitySchema({ entity }: { entity: Entity }) {
  const appUrl = "https://droomdroom.com/bitcoin-treasury-tracker";
  const slug = entity.externalWebsiteSlug || 'entity';
  
  const holdingsText = entity.bitcoinHoldings ? `${entity.bitcoinHoldings} BTC` : '';
  const marketCapText = entity.marketCap ? `$${(entity.marketCap / 1000000).toFixed(1)}M market cap` : '';
  const countryText = entity.countryFlag ? `${entity.countryFlag} ` : '';
  const typeText = entity.type ? `${entity.type.toLowerCase()} company` : 'company';
  
  const detailedDescription = entity.entityAbout?.[0]?.content?.split('\n\n')[0] || 
    `${countryText}${entity.name} (${entity.ticker}) is a ${typeText} that ${entity.bitcoinHoldings ? `holds Bitcoin treasury since ${entity.holdingSince}` : 'operates in the digital asset space'}. ${marketCapText ? `Current ${marketCapText}.` : ''}`;


  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://droomdroom.com#website",
        "name": "Bitcoin Treasury Tracker | DroomDroom",
        "url": "https://droomdroom.com",
        "description": "Track Bitcoin holdings of public companies, governments, and institutions. Real-time data, market analysis, and corporate treasury insights.",
        "publisher": {
          "@type": "Organization",
          "name": "Bitcoin Treasury Tracker | DroomDroom",
          "url": "https://droomdroom.com",
          "logo": "https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://droomdroom.com/bitcoin-treasury-tracker/{search_term_string}"
          },
          "query-input": {
            "@type": "PropertyValueSpecification",
            "valueRequired": "http://schema.org/True",
            "valueName": "search_term_string"
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${appUrl}/${slug}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://droomdroom.com/bitcoin-treasury-tracker"
          },
          {
            "@type": "ListItem", 
            "position": 2,
            "name": "Bitcoin Treasury Tracker",
            "item": "https://droomdroom.com/bitcoin-treasury-tracker"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": entity.name,
            "item": `${appUrl}/${slug}`
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": `${appUrl}/${slug}#organization`,
        "name": entity.name,
        "alternateName": entity.ticker,
        "url": entity.entityLinks?.[0]?.url || `${appUrl}/${slug}`,
        "logo": `https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png`,
        "description": detailedDescription,
        "knowsAbout": [
          "Bitcoin",
          "Digital Assets", 
          "Corporate Treasury",
          "Cryptocurrency Holdings"
        ],
        "foundingLocation": entity.countryFlag ? {
          "@type": "Country",
          "name": entity.countryFlag
        } : undefined,
        "sameAs": entity.entityLinks?.map(link => link.url) || []
      },
      {
        "@type": "Corporation",
        "@id": `${appUrl}/${slug}#corporation`,
        "name": entity.name,
        "legalName": entity.name,
        "tickerSymbol": entity.ticker,
        "description": detailedDescription,
        "url": entity.entityLinks?.[0]?.url,
        "logo": `https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png`,
        "foundingDate": entity.holdingSince,
        "numberOfEmployees": entity.type === "PUBLIC" ? "Public Company" : entity.type
      },
      {
        "@type": "FinancialService",
        "@id": `${appUrl}/${slug}#financial-data`,
        "name": `${entity.name} Financial Data`,
        "description": `Market capitalization and financial metrics for ${entity.name}`,
        "provider": {
          "@id": `${appUrl}/${slug}#organization`
        },
        "serviceType": "Financial Technology",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Market Data",
          "itemListElement": [
            entity.marketCap ? {
              "@type": "Offer",
              "name": "Market Capitalization",
              "price": entity.marketCap,
              "priceCurrency": "USD"
            } : null,
            entity.sharePrice ? {
              "@type": "Offer",
              "name": "Share Price",
              "price": entity.sharePrice,
              "priceCurrency": "USD"
            } : null,
            entity.enterpriseValue ? {
              "@type": "Offer",
              "name": "Enterprise Value",
              "price": entity.enterpriseValue,
              "priceCurrency": "USD"
            } : null
          ].filter(Boolean)
        }
      },
      {
        "@type": "FinancialProduct",
        "@id": `${appUrl}/${slug}#bitcoin-holdings`,
        "name": `${entity.name} Bitcoin Holdings`,
        "description": `${entity.name} holds Bitcoin as corporate treasury asset${entity.holdingSince ? ` since ${entity.holdingSince}` : ''}`,
        "provider": {
          "@id": `${appUrl}/${slug}#organization`
        },
        "category": "Cryptocurrency Holdings",
        "feesAndCommissionsSpecification": "Corporate Treasury Asset",
        "annualPercentageRate": entity.profitLossPercentage ? `${entity.profitLossPercentage}%` : undefined,
        "offers": {
          "@type": "Offer",
          "name": "Bitcoin Treasury Holdings",
          "description": `Current Bitcoin holdings: ${entity.bitcoinHoldings || 0} BTC`,
          "price": entity.usdValue || 0,
          "priceCurrency": "USD",
          "itemOffered": {
            "@type": "Service",
            "name": "Bitcoin Treasury Management",
            "category": "Financial Service"
          },
          "availability": "https://schema.org/InStock",
          "validFrom": entity.holdingSince
        },
        "additionalProperty": [
          entity.bitcoinHoldings ? {
            "@type": "PropertyValue",
            "name": "Bitcoin Holdings",
            "value": entity.bitcoinHoldings,
            "unitCode": "BTC"
          } : null,
          entity.costBasis ? {
            "@type": "PropertyValue",
            "name": "Cost Basis",
            "value": entity.costBasis,
            "unitCode": "USD"
          } : null,
          entity.avgCostPerBTC ? {
            "@type": "PropertyValue",
            "name": "Average Cost Per BTC",
            "value": entity.avgCostPerBTC,
            "unitCode": "USD"
          } : null
        ].filter(Boolean)
      },
      {
        "@type": "WebPage",
        "@id": `${appUrl}/${slug}#webpage`,
        "url": `${appUrl}/${slug}`,
        "name": `${entity.name} (${entity.ticker}) - Bitcoin Holdings & Market Data`,
        "description": detailedDescription,
        "inLanguage": "en-US",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://droomdroom.com#website"
        },
        "about": {
          "@id": `${appUrl}/${slug}#organization`
        },
        "mainEntity": {
          "@id": `${appUrl}/${slug}#corporation`
        },
        "breadcrumb": {
          "@id": `${appUrl}/${slug}#breadcrumb`
        },
        "dateModified": entity.updatedAt,
        "datePublished": entity.createdAt || entity.holdingSince,
        "keywords": [
          entity.ticker,
          entity.name,
          "Bitcoin treasury",
          "Corporate Bitcoin",
          "Cryptocurrency holdings"
        ].filter(Boolean).join(', ')
      },
      {
        "@type": "Dataset",
        "@id": `${appUrl}/${slug}#dataset`,
        "name": `${entity.name} Bitcoin Treasury Dataset`,
        "description": `Comprehensive Bitcoin holdings, market data, and treasury information for ${entity.name} (${entity.ticker})`,
        "about": [
          "Bitcoin Holdings",
          "Corporate Treasury", 
          "Market Data",
          "Financial Metrics"
        ],
        "creator": {
          "@type": "Organization",
          "name": "DroomDroom",
          "url": "https://droomdroom.com"
        },
        "publisher": {
          "@type": "Organization", 
          "name": "DroomDroom",
          "url": "https://droomdroom.com"
        },
        "dateModified": entity.updatedAt,
        "datePublished": entity.createdAt || entity.holdingSince,
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "distribution": {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": `${appUrl}/api/entity?slug=${slug}`
        },
        "keywords": [
          entity.ticker,
          entity.name,
          "Bitcoin",
          "Treasury",
          "Holdings",
          "Market Cap",
          "Financial Data"
        ].filter(Boolean).join(', ')
      },
      {
        "@type": "Article",
        "@id": `${appUrl}/${slug}#article`,
        "headline": `${entity.name} Bitcoin Treasury Analysis`,
        "description": detailedDescription,
        "author": {
          "@type": "Organization",
          "name": "DroomDroom"
        },
        "publisher": {
          "@type": "Organization",
          "name": "DroomDroom",
          "logo": {
            "@type": "ImageObject",
            "url": "https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png"
          }
        },
        "datePublished": entity.createdAt || entity.holdingSince,
        "dateModified": entity.updatedAt,
        "mainEntityOfPage": {
          "@id": `${appUrl}/${slug}#webpage`
        },
        "about": {
          "@id": `${appUrl}/${slug}#organization`
        },
        "articleBody": entity.entityAbout?.[0]?.content || detailedDescription,
        "keywords": [
          entity.ticker,
          entity.name, 
          "Bitcoin treasury",
          "Corporate Bitcoin holdings",
          "Institutional Bitcoin"
        ].filter(Boolean).join(', ')
      }
    ].filter(item => item && Object.keys(item).length > 2) // Remove undefined items
  };

  return (
    <Script
      id="entity-comprehensive-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0)
      }}
    />
  );
}