"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Container, Flex } from "./ui";
import { cn } from "@/lib/utils";
import { Search, User, ShoppingCart } from 'lucide-react';
import SerenivLogo from "@/public/assets/sereniv-logo.png"

const menuItems = [
  { text: 'Shop', url: '/shop' },
  { text: 'About', url: '/about' },
  { text: 'Contact', url: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Prevent hydration mismatch by not rendering scroll-dependent styles until mounted
  const headerClassName = cn(
    "sticky top-0 z-50 w-full transition-all duration-300 safe-area-top",
    mounted && scrolled ? "bg-white/80 backdrop-blur-lg shadow-md" : "bg-white"
  );

  return (
    <header className={headerClassName}>
      <Container>
        <Flex justify="between" align="center" className="h-20">
          {/* Logo */}
          <Link href="/">
            <Image
              className="h-20 w-auto"
              src={SerenivLogo}
              alt="Sereniv Logo"
              width={180}
              height={30}
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex items-center space-x-8">
              {menuItems.map((item) => (
                <li key={item.text}>
                  <Link href={item.url} className="text-base text-gray-700 hover:text-black transition-colors">
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-6">
            <button className="text-gray-700 hover:text-black transition-colors">
              <Search size={22} />
            </button>
            <button className="text-gray-700 hover:text-black transition-colors">
              <User size={22} />
            </button>
            <button className="text-gray-700 hover:text-black transition-colors">
              <ShoppingCart size={22} />
            </button>
          </div>
        </Flex>
      </Container>
    </header>
  );
}