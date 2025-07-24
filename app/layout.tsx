import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/toaster"
import { OrganizationSchema } from "@/components/schema-markup"
import { AppleStatusBar } from "@/components/apple-status-bar"
import HeaderFooter from "@/components/HeaderFooter"


const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

export const metadata: Metadata = {
  title: {
    template: '%s | Bitcoin Treasury Tracker | DroomDroom',
    default: 'Bitcoin Treasury Tracker: Real-Time Holding Analytics of Companies & Governments | DroomDroom',
  },
  description: "Track real-time Bitcoin holdings of public companies & governments. Get in-depth analytics, historical data, and performance insights with Bitcoin Treasury Tracker powered by DroomDroom.",
  keywords: "Bitcoin, Treasury, Tracker, Companies, Governments, Analytics, Historical Data, Performance Insights",
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
    canonical: "https://droomdroom.com/bitcoin-treasury-tracker",
  },
  openGraph: {
    title: "Bitcoin Treasury Tracker | DroomDroom",
    description: "Track real-time Bitcoin holdings of public companies & governments. Get in-depth analytics, historical data, and performance insights with Bitcoin Treasury Tracker powered by DroomDroom.",
    url: "https://droomdroom.com/bitcoin-treasury-tracker",
    siteName: "Bitcoin Treasury Tracker | DroomDroom",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png",
        width: 1200,
        height: 630,
        alt: "Bitcoin Treasury Tracker | DroomDroom",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@droomdroom",
    creator: "@droomdroom",
    title: "Bitcoin Treasury Tracker | DroomDroom",
    description: "Track real-time Bitcoin holdings of public companies & governments. Get in-depth analytics, historical data, and performance insights with Bitcoin Treasury Tracker powered by DroomDroom.",
    images: {
      url: "https://droomdroom.com/bitcoin-treasury-tracker/assets/og-image-new.png",
      alt: "Bitcoin Treasury Tracker | DroomDroom",
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'Bitcoin Treasury Tracker',
    'format-detection': 'telephone=no',
  }
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <script>
      var clickRankAi = document.createElement("script");
      clickRankAi.src = "https://js.clickrank.ai/seo/a2f08e6a-dc8a-4b26-849f-098224a52825/script?" + new Date().getTime();
      clickRankAi.async = true;
      document.head.appendChild(clickRankAi);
    </script>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppleStatusBar />
          <OrganizationSchema 
            name="DroomDroom"
            url={"https://droomdroom.com/bitcoin-treasury-tracker"}
            logo={`https://droomdroom.com/price/DroomDroom_light.svg`}
            description="Track real-time Bitcoin holdings of public companies & governments. Get in-depth analytics, historical data, and performance insights with Bitcoin Treasury Tracker powered by DroomDroom."
          />
          <div className="relative flex min-h-screen flex-col antialiased bg-background text-foreground safe-area">
            <HeaderFooter>
              {children}
            </HeaderFooter>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
