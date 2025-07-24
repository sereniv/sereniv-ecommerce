"use client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useShowHeaderFooter } from "@/lib/hooks/useShowHeaderFooter";

export default function HeaderFooter({ children }: { children: React.ReactNode }) {
  const show = useShowHeaderFooter();
  return (
    <>
      {show && <Header />}
      <main className="flex-1 w-full">{children}</main>
      {show && <Footer />}
    </>
  );
} 