"use client";
import { usePathname } from "next/navigation";

export function useShowHeaderFooter() {
  const pathname = usePathname();
  return !pathname?.includes("/embed");
} 