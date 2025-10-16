"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Input, Container } from "@/components/ui";
import { H1, P, Small } from "@/components/ui/typography";
import { toast } from "@/components/ui/use-toast";
import { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="py-12 border-b">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  All Products
                </h1>
              </div>
              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                  className="pl-12 h-12 border-2 border-gray-200 rounded-lg w-full md:w-[400px] focus:border-gray-900 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Products Grid */}
      <div className="py-12">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="group">
                    <div className="bg-gray-100 animate-pulse rounded-lg overflow-hidden mb-4 aspect-square" />
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-100 animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
                      <div className="h-6 bg-gray-100 animate-pulse rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const minPrice = Math.min(
                    ...product.variants.map((v) => Number(v.price))
                  );
                  const hasDiscount = product.variants.some(
                    (v) => v.discount && Number(v.discount) > 0
                  );
                  const maxDiscount = Math.max(
                    ...product.variants
                      .map((v) => Number(v.discount))
                      .filter(
                        (discount) =>
                          discount !== null && discount !== undefined
                      )
                  );

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group"
                    >
                      <div className="relative">
                        {/* Discount Badge */}
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 z-10">
                            <Badge className="bg-red-500 text-white hover:bg-red-600">
                              {maxDiscount}% OFF
                            </Badge>
                          </div>
                        )}

                        {/* Product Image */}
                        <div className="bg-gray-50 rounded-lg overflow-hidden mb-4 aspect-square relative">
                          <Image
                            src={product.thumbnail || "/images/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          {/* Tags */}
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Product Name */}
                          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                            {product.name}
                          </h3>

                          {/* Product Title */}
                          {product.title && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {product.title}
                            </p>
                          )}

                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">(127)</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{minPrice}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹
                                {Math.round(minPrice / (1 - maxDiscount / 100))}
                              </span>
                            )}
                          </div>

                          {/* Categories */}
                          {product.categories &&
                            product.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {product.categories
                                  .slice(0, 2)
                                  .map((category, index) => (
                                    <span
                                      key={index}
                                      className="text-xs text-gray-500"
                                    >
                                      {category}
                                      {index <
                                        Math.min(
                                          product.categories.length - 1,
                                          1
                                        ) && " • "}
                                    </span>
                                  ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No products match "${searchQuery}". Try a different search.`
                    : "No products available at the moment."}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
