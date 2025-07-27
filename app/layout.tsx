import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/toaster"
import { OrganizationSchema } from "@/components/schema-markup"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

export const metadata: Metadata = {
  title: {
    template: 'Sereniv - Honest, Authentic & Transparent',
    default: 'Sereniv - Honest, Authentic & Transparent',
  },
  description: "We believe our products should be accessible to all, but we will never compromise on quality, ensuring only the best products reach you. Our products are priced to allow you",
  keywords: "Sereniv , Beauty , Bearty Products",
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
    canonical: "https://sereniv.com",
  },
  openGraph: {
    title: "Sereniv - Honest, Authentic & Affordable Beauty Products",
    description: "We believe our products should be accessible to all, but we will never compromise on quality, ensuring only the best products reach you. Our products are priced to allow you",
    url: "/assets/sereniv-logo.png",
    siteName: "Sereniv",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Sereniv",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@droomdroom",
    creator: "@droomdroom",
    title: "Sereniv - Honest, Authentic & Affordable Beauty Products",
    description: "We believe our products should be accessible to all, but we will never compromise on quality, ensuring only the best products reach you. Our products are priced to allow you",
    images: {
      url: "/assets/sereniv-logo.png",
      alt: "Sereniv - Honest , Authentic & Transparent",
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'Sereniv - Honest , Authentic & Transparent',
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
      <body className={inter.className}>
          <OrganizationSchema
            name="Sereniv"
            url={"https://sereniv.com"}
            logo={"/assets/sereniv-logo.png"}
            description="We believe our products should be accessible to all, but we will never compromise on quality, ensuring only the best products reach you. Our products are priced to allow you"
          />
          <Header />
          <div className="relative flex min-h-screen flex-col antialiased bg-background text-foreground safe-area">
            {children}
          </div>
          <Footer />
          <Toaster />
      </body>
    </html>
  )
}
