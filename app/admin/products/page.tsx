"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Button,
  Input,
  Container,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Product } from "@/lib/types";
import { Plus, Edit, Eye, Trash2, Package } from "lucide-react";

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

export default function ProductsAdminPage() {
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

      const response = await fetch(
        `/api/admin/products?${queryParams.toString()}`
      );
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

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/products/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (!mounted) return null;


  console.log("Prodcuts" , products)

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="py-12 border-b">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Manage Products
                </h1>
                <p className="text-gray-600">
                  {loading ? "Loading..." : `${products.length} products`}
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
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
                    className="pl-12 h-12 border-2 border-gray-200 rounded-lg w-full md:w-[300px] focus:border-gray-900 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="bg-gray-900 hover:bg-black text-white rounded-lg px-6 h-12 font-medium">
                  <Link href="products/add-product" className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Product
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Products List */}
      <div className="py-12">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-pulse"
                  >
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-100 rounded w-20"></div>
                          <div className="h-6 bg-gray-100 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-10 w-20 bg-gray-100 rounded-lg"></div>
                        <div className="h-10 w-20 bg-gray-100 rounded-lg"></div>
                        <div className="h-10 w-20 bg-gray-100 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No products match "${searchQuery}". Try a different search.`
                    : "Get started by adding your first product."}
                </p>
                <Button className="bg-gray-900 hover:bg-black text-white rounded-lg px-8 h-12 font-medium">
                  <Link href="products/add-product" className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Product
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => {
                  const minPrice = product.variants && product.variants.length > 0 
                    ? Math.min(...product.variants.map((v) => Number(v.price)))
                    : 0;
                  const totalStock = product.variants && product.variants.length > 0
                    ? product.variants.reduce((sum, v) => sum + Number(v.stock), 0)
                    : 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all hover:shadow-md"
                    >
                      <div className="p-6">
                        <div className="flex gap-6 items-start">
                          {/* Product Image */}
                          <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image
                              src={product.thumbnail || "/images/placeholder.jpg"}
                              alt={product.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {product.name}
                                </h3>
                                {product.title && (
                                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                                    {product.title}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {product.isActive ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                      Inactive
                                    </Badge>
                                  )}
                                  {product.isFeatured && (
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                      Featured
                                    </Badge>
                                  )}
                                  {product.tags && product.tags.slice(0, 2).map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 flex-shrink-0">
                                <Link href={`/admin/products/update-product/${product.slug}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-gray-200 hover:border-gray-900 rounded-lg"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/products/${product.slug}`} target="_blank">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-gray-200 hover:border-gray-900 rounded-lg"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-white border-2 border-gray-200 rounded-lg">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-gray-900 text-xl font-bold">
                                        Delete Product
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-600">
                                        Are you sure you want to delete "{product.name}"? This action cannot be undone and will permanently delete all associated data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-2 border-gray-200 hover:bg-gray-50 rounded-lg">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(product.slug)}
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                      >
                                        Delete Product
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>

                            {/* Product Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Price</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {minPrice > 0 ? `₹${minPrice}` : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Variants</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {product.variants?.length || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Stock</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {totalStock}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}