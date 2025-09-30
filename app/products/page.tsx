"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Input, Container } from "@/components/ui";
import { H1, P, Small } from "@/components/ui/typography";
import { toast } from "@/components/ui/use-toast";
import { Product } from "@/lib/types";
import Image from "next/image";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();

      if (debouncedSearchQuery) {
        queryParams.append("search", debouncedSearchQuery);
      }

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch products",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      if (debouncedSearchQuery !== searchQuery) {
        setLoading(true);
      } else {
        fetchProducts();
      }
    }
  }, [debouncedSearchQuery, mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <Container className="">
        <div className="flex justify-between items-center mb-8">
          <H1 className="text-4xl font-light tracking-tighter text-gray-900 mb-4">
            All Products
          </H1>
          <div className="flex gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 border-gray-200 rounded-lg w-[350px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-200 animate-pulse rounded-lg overflow-hidden mb-4 h-[200px] w-[200px] mx-auto" />
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products &&
                products.length > 0 &&
                products.map((product) => (
                  <div key={product.id} className="text-center group w-[300px]">
                    <Link href={`/products/${product.slug}`}>
                      <div className="rounded-lg overflow-hidden mb-4 transition-shadow duration-300 group-hover:shadow-lg w-[300px] h-[300px] mx-auto">
                        <Image
                          src={product.thumbnail || "/images/placeholder.jpg"}
                          alt={product.name}
                          width={250}
                          height={320}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
