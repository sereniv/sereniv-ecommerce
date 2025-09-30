"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Button,
  Input,
  Container,
  Grid,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui";
import { H1, P, Small } from "@/components/ui/typography";
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
  const [prodcuts, setProducts] = useState<Product[]>([]);
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

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <Container className=" mx-auto">
        <div className="flex justify-between items-center mb-8">
          <H1 className="text-4xl font-light tracking-tighter text-gray-900 mb-4">
            Manage Products
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
                className="pl-10 border-gray-200 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Button className="bg-gray-900 hover:bg-black text-white rounded-md px-8 py-3">
                <Link href="products/add-product">Add Product</Link>
              </Button>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <Grid cols={1} gap="lg">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white shadow-sm rounded-lg border border-gray-200 animate-pulse"
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="flex flex-wrap gap-2 my-2">
                          <div className="h-5 bg-gray-100 rounded-full w-20"></div>
                          <div className="h-5 bg-gray-100 rounded-full w-24"></div>
                          <div className="h-5 bg-gray-100 rounded-full w-28"></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start">
                        <div className="w-4 h-4 mr-2 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-4 h-4 mr-2 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200 flex justify-between pt-4">
                    <div>
                      <div className="h-9 bg-gray-200 rounded-full w-16"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-9 bg-gray-200 rounded-full w-24"></div>
                      <div className="h-9 bg-gray-200 rounded-full w-16"></div>
                    </div>
                  </CardFooter>
                </div>
              ))}
            </Grid>
          ) : prodcuts.length === 0 ? (
            <div className="text-center py-10">
              <P className="text-lg text-gray-600 mb-4">No products found</P>
              <Button className="bg-gray-900 hover:bg-black text-white rounded-full px-8 py-3">
                <Link href="products/add-product">Add Product</Link>
              </Button>
            </div>
          ) : (
            <Grid cols={1} gap="lg">
              {prodcuts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow-sm rounded-lg border border-gray-200 group hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{product.description}</p>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200 flex justify-between pt-4">
                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Link
                            href={`/admin/products/update-product/${product.slug}`}
                          >
                            <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-full px-8 py-3">
                              Update
                            </Button>
                          </Link>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-full px-8 py-3">
                        <Link href={`products/${product.slug}`} target="_blank">
                          View
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border border-gray-200 rounded-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900">
                              Are you sure you want to delete this product?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              This action cannot be undone. This will
                              permanently delete the product "{product.name}"
                              and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-full px-8 py-3">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.slug)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </div>
              ))}
            </Grid>
          )}
        </div>
      </Container>
    </div>
  );
}
