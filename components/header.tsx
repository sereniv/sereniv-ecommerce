"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Container, Flex } from "./ui";
import { FadeIn } from "./ui/animation";
import axios from "axios";
import { cn } from "@/lib/utils";

interface MenuItem {
  text: string;
  url: string;
}

const MenuItemShimmer = () => {
  return (
    <div className="animate-pulse">
      <div className="h-5 bg-gradient-to-r from-muted/40 to-muted/20 rounded-md w-16 md:w-20 transition-all duration-500"></div>
    </div>
  );
};

const MenuShimmer = () => {
  return (
    <ul className="flex items-center justify-center space-x-10 md:space-x-16 overflow-x-auto scrollbar-hide">
      {[...Array(6)].map((_, index) => (
        <li key={index}>
          <MenuItemShimmer />
        </li>
      ))}
    </ul>
  );
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://api.droomdroom.online/api/v1/header-menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleThemeToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (!mounted) {
    return null;
  }

  const handleNavClick = (path: string) => {
    const url = `https://droomdroom.com${path}`;
    window.open(url, '_blank');
  }

  return (
    <header className="z-50 w-full safe-area-top">
      {/* Background Pattern - matches entity page */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      </div>
      
      <div className="relative bg-gradient-to-br from-background/95 via-background/98 to-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg overflow-hidden safe-area">
        {/* Animated background elements - contained within header */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-transform duration-1000 opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full translate-y-12 -translate-x-12 transition-transform duration-1000 opacity-60 pointer-events-none" />
        
        <div className="relative bg-gradient-to-br from-background/90 to-background/60 backdrop-blur-md border-b border-border/50 overflow-hidden">
          <Flex justify="center" align="center" className="py-2 px-10 relative">
            <div
              className="absolute left-10 cursor-pointer group"
              onClick={handleThemeToggle}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                           w-[44px] h-[14px]
                           bg-gradient-to-r from-secondary/60 to-secondary/40 dark:from-secondary/60 dark:to-secondary/40
                           transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                           rounded-full shadow-inner
                           cursor-pointer group-hover:shadow-lg"
              />
              <div
                className={cn(
                  "absolute w-[28px] h-[28px] rounded-full flex items-center justify-center",
                  "transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                  "shadow-lg group-hover:shadow-xl",
                  "bg-gradient-to-br from-white to-white/90 dark:from-orange-500 dark:to-orange-400",
                  "border border-border/20 dark:border-orange-400/20",
                  isAnimating ? "scale-90" : "scale-100",
                  theme === "dark"
                    ? "left-full -translate-x-[26px] -translate-y-1/2 top-1/2"
                    : "left-0 translate-x-[-2px] -translate-y-1/2 top-1/2",
                  "cursor-pointer group-hover:scale-105"
                )}
              >
                {theme === "dark" ? (
                  <span className="text-sm text-white transform transition-transform duration-300 group-hover:scale-110">
                    🌙
                  </span>
                ) : (
                  <span className="text-sm transform transition-transform duration-300 text-orange-600 group-hover:scale-110">
                    ☀️
                  </span>
                )}
              </div>
            </div>

            <a href="/" className="flex items-center group">
              <FadeIn>
                <div className="relative">
                  <Image
                    className="h-[24px] md:h-[28px] w-auto transform transition-all duration-500 group-hover:scale-105 filter group-hover:brightness-110"
                    src={`https://droomdroom.com/price/DroomDroom_${theme === "light" ? "Black" : "White"}.svg`}
                    alt="DroomDroom Logo"
                    width={180}
                    height={30}
                    priority
                  />
                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                </div>
              </FadeIn>
            </a>
          </Flex>
        </div>

        <div className="relative bg-gradient-to-br from-background/85 to-background/70 backdrop-blur-sm border-b border-border/40 overflow-hidden">
          <Container>
            <nav className="flex justify-center items-center py-1">
              {isLoading ? (
                <MenuShimmer />
              ) : (
                <ul className="flex items-center justify-start space-x-4 sm:space-x-8 md:space-x-16 overflow-x-auto scrollbar-hide w-full px-4 sm:justify-center sm:px-0">
                  {menuItems.length > 0 && menuItems.map((item) => (
                    <li key={item.text} className="flex-shrink-0">
                      <button 
                        onClick={() => handleNavClick(item.url)} 
                        className={cn(
                          "relative font-bold text-sm sm:text-base md:text-lg whitespace-nowrap px-2 py-1",
                          "text-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-500 ease-out",
                          "group overflow-hidden rounded-lg touch-manipulation",
                          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500/0 before:via-orange-500/10 before:to-orange-500/0",
                            "before:translate-x-[-100%] before:transition-transform before:duration-500",
                            "hover:before:translate-x-[100%]",
                            "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5",
                            "after:bg-gradient-to-r after:from-orange-600 after:to-orange-500/60 after:transition-all after:duration-300",
                          "hover:after:w-full after:shadow-lg"
                        )}
                      >
                        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                          {item.text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </Container>
        </div>
      </div>
    </header>
  );
}