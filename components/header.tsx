"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container, Flex } from "./ui";
import { cn } from "@/lib/utils";
import { Search, User, ShoppingCart, LogOut } from "lucide-react";
import SerenivLogo from "@/public/assets/sereniv-logo.png";
import { useUser } from "@/hooks/use-user";

const menuItems = [
  { text: "Shop", url: "/shop" },
  { text: "About", url: "/about" },
  { text: "Contact", url: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useUser();

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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Prevent hydration mismatch by not rendering scroll-dependent styles until mounted
  const headerClassName = cn(
    "sticky top-0 z-50 w-full transition-all duration-300 safe-area-top",
    mounted && scrolled ? "bg-white/80 backdrop-blur-lg shadow-md" : "bg-white"
  );

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

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
                  <Link
                    href={item.url}
                    className="text-base text-gray-700 hover:text-black transition-colors"
                  >
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

            {/* User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={handleUserMenuClick}
                    className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
                  >
                    <User size={22} />
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.firstName || "User"}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  <User size={22} />
                </Link>
              )}
            </div>

            <button className="text-gray-700 hover:text-black transition-colors">
              <ShoppingCart size={22} />
            </button>
          </div>
        </Flex>
      </Container>
    </header>
  );
}
