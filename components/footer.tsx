'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXTwitter, 
  faDiscord, 
  faFacebook, 
  faYoutube, 
  faTelegram, 
  faLinkedin, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import { faRss, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { ExternalLink, Users, Building } from 'lucide-react';
import { Card } from './ui/card';

const Footer = () => {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme();
  
  useEffect(() => {
    setMounted(true)
  }, [theme])

  if (!mounted) {
    return null
  }

  const handleExternalRedirect = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.location.href = url;
  };

  const socialButton = (icon: any, color: string, url: string) => (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={cn(
        "group relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white",
        "transform transition-all duration-500 ease-out hover:scale-110 hover:-translate-y-1",
        "shadow-lg hover:shadow-xl hover:shadow-primary/20",
        "before:absolute before:inset-0 before:rounded-lg sm:before:rounded-xl before:transition-all before:duration-500",
        "before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100",
        "overflow-hidden flex-shrink-0 touch-manipulation"
      )}
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <FontAwesomeIcon icon={icon} className="relative z-10 transition-transform duration-300 group-hover:scale-110" />
    </a>
  );

  const linkButton = (text: string, href: string) => (
    <div  
      onClick={() => window.open(`https://droomdroom.com${href}`, '_blank')}
      className={cn(
        "relative inline-block px-2 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl",
        "bg-gradient-to-r from-[#ffa66a] to-[#ff9447] text-foreground",
        "transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-1",
        "shadow-md hover:shadow-xl hover:shadow-[#ffa66a]/25",
        "before:absolute before:inset-0 before:rounded-lg sm:before:rounded-xl before:bg-gradient-to-br before:from-white/20 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "overflow-hidden text-center cursor-pointer touch-manipulation"
      )}
    >
      <span className="relative z-10 transition-all duration-300">
        {text}
      </span>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
    </div>
  );

  return (
    <Card className="relative min-h-[400px] sm:min-h-[500px] flex flex-col px-3 sm:px-6 py-8 sm:py-12 pb-safe overflow-hidden w-full safe-area-bottom">
      {/* Background Pattern - matches entity page */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      </div>
      
      {/* Animated background elements - contained within footer */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-24 translate-x-24 transition-transform duration-1000 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full translate-y-16 -translate-x-16 transition-transform duration-1000 opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-orange-500/5 to-orange-400/5 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
      
      {/* Main Content Card - matches entity page card styling */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <div className={cn(
          "group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md",
          "transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-300/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-24 translate-x-24 sm:-translate-y-48 sm:translate-x-48 transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full translate-y-16 -translate-x-16 sm:translate-y-32 sm:-translate-x-32 transition-transform duration-1000 group-hover:scale-110" />
          
          <div className="relative space-y-8 sm:space-y-12">
            {/* Social Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-8">
              <div className="max-w-[600px] space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    Follow Us on Socials
                  </h2>
                </div>
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
                  We use social media to react to breaking news, update supporters and share information.
                </p>
              </div>
              
              <div className="flex gap-2 sm:gap-3 justify-start sm:justify-end flex-wrap w-full sm:w-auto">
                {socialButton(faXTwitter, "#000000", "https://twitter.com/droomdroom")}
                <a 
                  href="https://news.google.com/publications/CAAqKQgKIiNDQklTRkFnTWFoQUtEbVJ5YjI5dFpISnZiMjB1WTI5dEtBQVAB?hl=en-CA&gl=CA&ceid=CA:en" 
                  target="_blank" 
                  rel="nofollow" 
                  className={cn(
                    "group relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gray-800 text-white",
                    "transform transition-all duration-500 ease-out hover:scale-110 hover:-translate-y-1",
                    "shadow-lg hover:shadow-xl hover:shadow-primary/20",
                    "before:absolute before:inset-0 before:rounded-lg sm:before:rounded-xl before:transition-all before:duration-500",
                    "before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100",
                    "overflow-hidden flex-shrink-0 touch-manipulation"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 w-5 h-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_News_icon.svg"
                      alt="Google News"
                      width={20}
                      height={20}
                    />
                  </div>
                </a>
                {socialButton(faFacebook, "#1877F2", "https://www.facebook.com/0xDroomDroom/")}
                {socialButton(faYoutube, "#FF0000", "https://www.youtube.com/@droomdroom")}
                {socialButton(faTelegram, "#26A5E4", "https://t.me/droomdroom")}
                {socialButton(faLinkedin, "#0A66C2", "https://www.linkedin.com/company/droomdroom/posts/?feedView=all")}
                {socialButton(faInstagram, "#E4405F", "https://www.instagram.com/0xdroomdroom/")}
                {socialButton(faRss, "#EE802F", "https://droomdroom.com/feed/")}
              </div>
            </div>

            {/* Divider with enhanced styling */}
            <div className="relative">
              <div className="h-2 mx-auto w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full shadow-lg" />
              <div className="absolute inset-0 h-2 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20preserveAspectRatio%3D%27none%27%20overflow%3D%27visible%27%20height%3D%27100%25%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27black%27%20stroke%3D%27none%27%3E%3Cpolygon%20points%3D%279.4%2C2%2024%2C2%2014.6%2C21.6%200%2C21.6%27%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_100%] bg-repeat-x opacity-30" />
            </div>

            {/* Footer Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-6 sm:gap-8 lg:gap-12">
              {/* Brand Section */}
              <div className="space-y-6 sm:space-y-8 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                    <Building className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="w-[160px] sm:w-[200px] flex-shrink-0">
                    <Image
                      src={`https://droomdroom.com/price/DroomDroom_${theme === 'light' ? 'Black' : 'White'}.svg`}
                      alt="DroomDroom Logo"
                      width={240}
                      height={40}
                      priority
                      sizes="200px"
                      className="transition-all duration-300 group-hover:scale-105 filter group-hover:brightness-110"
                    />
                  </div>
                </div>
                <div className={cn(
                  "group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50",
                  "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
                  "transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10"
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-300/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-8 translate-x-8 sm:-translate-y-12 sm:translate-x-12 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  <p className="relative text-sm sm:text-base leading-relaxed font-medium max-w-[400px] text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    DroomDroom dedicates thousands of hours of research into the web3 industry to deliver you free, world-class, and accurate content.
                  </p>
                </div>
              </div>

              {/* Company Links */}
              <div className="flex flex-col sm:col-span-1">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground relative pb-0 mb-4 sm:mb-6 pt-3 sm:pt-5 border-t-[2px] sm:border-t-[3px] border-t-[#ffa66a] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Company
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 sm:mt-2.5">
                  {linkButton("About", "/about")}
                  {linkButton("Careers", "/careers")}
                  {linkButton("Partner", "/partner")}
                  {linkButton("Privacy Policy", "/privacy-policy")}
                  {linkButton("Terms of Service", "/terms")}
                  {linkButton("Contact Us", "/contact")}
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-col sm:col-span-1">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground relative pb-0 mb-4 sm:mb-6 pt-3 sm:pt-5 border-t-[2px] sm:border-t-[3px] border-t-[#ffa66a] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Quick Links
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 sm:mt-2.5">
                  {linkButton("Home", "/")}
                  {linkButton("Price", "/price")}
                  {linkButton("Converter", "/converter")}
                  {linkButton("Top List", "/top-list")}
                  {linkButton("Learn", "/learn")}
                  {linkButton("Winners of Web3", "/winners-of-web3")}
                  {linkButton("Future of Web3", "/future-of-web3")}
                  {linkButton("Press Release", "/press-release")}
                  {linkButton("Web Stories", "/web-stories")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="relative z-10 text-center text-sm text-muted-foreground pt-8 border-t border-border/30 max-w-[1200px] mx-auto mt-8">
        <div className={cn(
          "group relative overflow-hidden rounded-2xl p-6 border border-border/50",
          "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md",
          "transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-300/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute top-0 left-1/2 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          <p className="relative font-medium group-hover:text-foreground transition-colors duration-300">
            Copyright © 2025 DroomDroom Corporation. All Rights Reserved
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Footer;
