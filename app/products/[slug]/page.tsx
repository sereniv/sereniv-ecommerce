"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { FormShimmer } from "@/components/ui/shimmer";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";
import Shimmer from "./shimmer";

export default function ProductPage() {
  const params = useParams();
  const { toast } = useToast();

  if (!params || !params.slug) {
    return <Shimmer />;
  }

  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!slug) {
          throw new Error("No product slug provided");
        }

        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch product: ${response.statusText}`
          );
        }

        const responseData = await response.json();
        setProduct(responseData);
        if (responseData.variants && responseData.variants.length > 0) {
          setSelectedSize(responseData.variants[0].size);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load product",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, toast]);

  if (loading || !product) {
    return (
      <Shimmer/>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.size === selectedSize) ||
    product.variants[0];
  const finalPrice =
    Number(selectedVariant.price) -
    (Number(selectedVariant.price) * (Number(selectedVariant?.discount) || 0)) / 100;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="text-sm text-gray-500">
          Home / Products / {product.name}
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={product.thumbnail || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="rounded-full px-3 py-1 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Product Name */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.title && (
                <p className="text-lg text-gray-600">{product.title}</p>
              )}
            </div>

            {/* Rating */}
            {/* <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(127 reviews)</span>
            </div> */}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{Math.round(finalPrice)}
              </span>
              {/* {selectedVariant?.discount && selectedVariant.discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{selectedVariant.price}
                  </span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {selectedVariant.discount}% OFF
                  </Badge>
                </>
              )} */}
            </div>

            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            <Separator />

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Size
              </label>
              <div className="flex gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.size}
                    className={`px-6 py-3 rounded-lg border-2 transition-all font-medium ${
                      selectedSize === variant.size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-900 hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedSize(variant.size)}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {Number(selectedVariant.stock) > 0
                  ? `${selectedVariant.stock} in stock`
                  : "Out of stock"}
              </p>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(Number(selectedVariant.stock), quantity + 1))
                  }
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3">
              <Button
                className="flex-1 h-12 bg-gray-900 hover:bg-black text-white rounded-lg font-medium text-base"
                disabled={selectedVariant.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-lg border-2 border-gray-200 hover:border-gray-900"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {product.description && (
        <div className="py-12">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this product
              </h2>
              <div
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product?.description }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Key Ingredients */}
      {product.ingredients && product.ingredients.length > 0 && (
        <div className="py-12">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Key Ingredients
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.ingredients.map((ingredient, index) => (
                <Card
                  key={ingredient.id}
                  className="border-2 hover:border-gray-300 transition"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {ingredient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {ingredient.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQs */}
      {product.faqs && product.faqs.length > 0 && (
        <div className="py-12">
          <div className="container mx-auto max-w-7xl px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {product.faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  value={`item-${index}`}
                  className="bg-white border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
}
