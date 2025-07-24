import { Metadata } from 'next';
import { cleanSEOIMAGEURL, formatNumberWithSuffix, sanitizeHtmlForSEO } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  try {
    // Fetch entity data directly from database during build time
    const entity = await prisma.entity.findFirst({
      where: { slug },
      include: {
        entityAbout: true,
      }
    });
    
    if (!entity) {
      console.warn(`Entity not found for slug: ${slug}`);
      throw new Error('ENTITY_NOT_FOUND');
    }
    
    const data = entity;

    // console.log("data", data);
    
    // Format the holding since date
    const formatHoldingSinceDate = (dateString: string | null): string => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    };
    
    const countryText = data.countryFlag ? `${data.countryFlag} ` : '';
    const holdingsText = data.bitcoinHoldings ? `${formatNumberWithSuffix(data.bitcoinHoldings)} BTC` : '';
    const marketCapText = data.marketCap ? `$${(data.marketCap / 1000000).toFixed(1)}M market cap` : '';
    const typeText = data.type ? `${data.type.toLowerCase()} company` : 'company';
    const formattedHoldingSince = formatHoldingSinceDate(data.holdingSince);
    
    // Use the first paragraph of entityAbout content as description, or fallback
    const detailedDescription = data.entityAbout?.[0]?.content?.split('\n\n')[0] || 
      `${countryText}${data.name}${data.ticker ? ` (${data.ticker})` : ''} is a ${typeText} that ${data.bitcoinHoldings ? `holds Bitcoin treasury since ${formattedHoldingSince}` : 'operates in the digital asset space'}.`;
    
    const titleParts = [
      data.name,
      formattedHoldingSince ? `Holding BTC since ${formattedHoldingSince}` : 'Bitcoin Treasury',
      'Bitcoin Treasury Tracker',
      'DroomDroom'
    ].filter(Boolean);
    
    const seoTitle = titleParts.join(' | ');
    
    const keywordParts = [
      data.ticker,
      data.name,
      `${data.ticker} stock`,
      `${data.name} bitcoin`,
      data.bitcoinHoldings ? `${data.bitcoinHoldings} BTC` : 'bitcoin holdings',
      data.type ? `${data.type.toLowerCase()} company` : 'company',
      'bitcoin treasury',
      'crypto holdings',
      'bitcoin corporate treasury',
      data.holdingSince ? `bitcoin since ${data.holdingSince}` : '',
      marketCapText ? `${marketCapText.replace('$', '')} company` : '',
      'institutional bitcoin',
      'corporate bitcoin adoption'
    ].filter(Boolean);
    
    return {
      title: data.seoTitle ? data.seoTitle : seoTitle,
      description: data.seoDescription ? sanitizeHtmlForSEO(data.seoDescription) : detailedDescription,
      keywords: data.seoKeywords?.length>0  ? data.seoKeywords.join(', ') : keywordParts.join(', '),
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: `https://droomdroom.com/bitcoin-treasury-tracker/${slug}`,
      },
      openGraph: {
        title: data.seoTitle ? data.seoTitle : seoTitle,
        description: data.seoDescription ? sanitizeHtmlForSEO(data.seoDescription) : detailedDescription,
        url: `https://droomdroom.com/bitcoin-treasury-tracker/${slug}`,
        siteName: 'Bitcoin Treasury Tracker | DroomDroom',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: data.seoImage ? cleanSEOIMAGEURL(data.seoImage)! : `https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png`,
            width: 1200,
            height: 630,
            alt: `${data.name}${data.ticker ? ` (${data.ticker})` : ''} - Bitcoin Holdings`,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@droomdroom',
        creator: '@droomdroom',
        title: data.seoTitle ? data.seoTitle : seoTitle,
        description: data.seoDescription ? sanitizeHtmlForSEO(data.seoDescription) : detailedDescription,
        images: {
          url: data.seoImage ? cleanSEOIMAGEURL(data.seoImage)! : `https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png`,
          alt: `${data.name}${data.ticker ? ` (${data.ticker})` : ''} - Bitcoin Holdings`,
        },
      },
    };
  } catch (error) {
    // Only log actual errors, not expected 404s
    if (error instanceof Error && error.message !== 'ENTITY_NOT_FOUND') {
      console.error(`Error generating metadata for ${slug}:`, error);
    }
    
    return {
      title: `Entity Details - Bitcoin Treasury Tracker | DroomDroom`,
      description: `Get detailed information, real-time prices, flows, and market data for this entity on Bitcoin Treasury Tracker powered by DroomDroom.`,
      keywords: 'entity details, crypto entity, entity price, entity flows, entity market data, entity tracker',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: `https://droomdroom.com/bitcoin-treasury-tracker/${slug}`,
      },
      openGraph: {
        title: `Entity Details - Bitcoin Treasury Tracker | DroomDroom`,
        description: `Get detailed information, real-time prices, flows, and market data for this entity on Bitcoin Treasury Tracker powered by DroomDroom.`,
        url: `https://droomdroom.com/bitcoin-treasury-tracker/${slug}`,
        siteName: 'Bitcoin Treasury Tracker | DroomDroom',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: `https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png`,
            width: 1200,
            height: 630,
            alt: 'Entity Details',
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@droomdroom',
        creator: '@droomdroom',
        title: `Entity Details - Bitcoin Treasury Tracker | DroomDroom`,
        description: `Get detailed information, real-time prices, flows, and market data for this entity on Bitcoin Treasury Tracker powered by DroomDroom.`,
        images: {
          url: `https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png`,
          alt: 'Entity Details',
        },
      },
    };
  }
}

export default function EntityDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
