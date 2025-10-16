"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/use-products";
import { Star, ShieldCheck, Leaf, Award } from "lucide-react";

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <div className="bg-white min-h-screen border-t">
      {/* Hero Section */}
      <div className="py-20 md:py-32">
        <Container>
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-gray-900">
              Skincare for the Sereniv
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Effective, transparent, and gentle formulations designed to
              simplify your routine.
            </p>
            <Link href="/products">
              <Button
                size="lg"
                className="bg-gray-900 text-white hover:bg-black rounded-lg px-10 py-6 text-lg font-medium h-auto"
              >
                Shop All Products
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Featured Products Section */}
      <div className="py-16 md:py-24">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Featured Products
              </h2>
              <p className="text-gray-600 text-lg">
                Our most popular solutions for healthy, glowing skin
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products &&
                  products.length > 0 &&
                  products.slice(0, 3).map((product) => {
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
                              src={
                                product.thumbnail || "/images/placeholder.jpg"
                              }
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
                              <span className="text-xs text-gray-500">
                                (127)
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{minPrice}
                              </span>
                              {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹
                                  {Math.round(
                                    minPrice / (1 - maxDiscount / 100)
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-lg px-10 py-6 text-base font-medium h-auto"
                >
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Value Propositions Section */}
      <div className="py-16 md:py-24">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Why Choose Sereniv
              </h2>
              <p className="text-gray-600 text-lg">
                Committed to your skin's health and the planet's well-being
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
                  <Leaf className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Clean Ingredients
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Formulated without parabens, sulfates, or artificial
                  fragrances. Only the best for your skin.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Cruelty-Free
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We never test on animals. All of our products are 100% vegan
                  and ethically made.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-6">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Transparent
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We believe in full transparency, from our ingredients to our
                  pricing. No hidden costs.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Skincare Routine?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of happy customers who trust Sereniv for their
              daily skincare needs.
            </p>
            <Link href="/products">
              <Button
                size="lg"
                className="bg-gray-900 text-white hover:bg-black rounded-lg px-10 py-6 text-lg font-medium h-auto"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
}
