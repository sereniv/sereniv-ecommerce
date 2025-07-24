"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';
import { Container, Flex } from "./ui";
import { cn } from "@/lib/utils";
import { Search, User, ShoppingCart } from 'lucide-react';

const menuItems = [
  { text: 'Shop', url: '/shop' },
  { text: 'About', url: '/about' },
  { text: 'Contact', url: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 safe-area-top",
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-md" : "bg-white"
      )}
    >
      <Container>
        <Flex justify="between" align="center" className="h-20">
          {/* Logo */}
          <Link href="/">
            <Image
              className="h-8 w-auto"
              src="https://droomdroom.com/price/DroomDroom_Black.svg"
              alt="DroomDroom Logo"
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