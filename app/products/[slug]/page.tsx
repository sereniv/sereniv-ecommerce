"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { FormShimmer } from "@/components/ui/shimmer";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ProductPage() {
  const params = useParams();
  const { toast } = useToast();

  if (!params || !params.slug) {
    return <FormShimmer />;
  }

  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");

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
        // Set default selected size to the first variant's size
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
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <FormShimmer />
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <Image
            src={product.thumbnail || "/placeholder-product.jpg"}
            alt={product.name}
            width={400}
            height={500}
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div className="space-y-4">
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.title && (
            <p className="text-xl text-muted-foreground">{product.title}</p>
          )}
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <span className="ml-2 text-sm text-muted-foreground">(127)</span>
          </div>
          <p className="text-2xl font-semibold">
            ₹{product.variants.find((v) => v.size === selectedSize)?.price ||
              product.variants[0].price}
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Size</label>
            <div className="flex gap-2">
              {product.variants.map((variant) => (
                <Button
                  key={variant.size}
                  variant={selectedSize === variant.size ? "default" : "outline"}
                  onClick={() => setSelectedSize(variant.size)}
                >
                  {variant.size}
                </Button>
              ))}
            </div>
          </div>
          <Button size="lg" className="w-full">
            Add to Cart
          </Button>
          <div className="p-4 bg-muted rounded-lg">
            <p className="italic text-sm">
              "I have seen a reduction in acne and oiliness ever since I started
              using this product" - Nikhil V.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          <h3 className="text-xl font-semibold mb-3">What Makes It Potent?</h3>
          <ul className="space-y-2 mb-6">
            {product.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{ingredient.description}</span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ideal For</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Skin type: Oily/Combination, Acne-Prone
                </p>
                <p className="text-sm text-muted-foreground">
                  Concerns: Acne, Breakouts & Oiliness
                </p>
                <p className="text-sm text-muted-foreground">
                  Suitable for: 15+ years
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Apply on wet face. Pour an appropriate quantity into wet hands,
                  rub together into a light lather, and massage into face. Rinse
                  thoroughly.
                </p>
                <p className="text-sm font-medium mt-2">
                  When to use: AM & PM. Everyday.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Consumer Studies */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Consumer Studies</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Significant reduction in skin oiliness after 6 washes
                  </p>
                  <Badge variant="secondary">90%</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Acne occurrences reduced after 6 weeks
                  </p>
                  <Badge variant="secondary">87%</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Skin felt smoother & brighter after 4 weeks
                  </p>
                  <Badge variant="secondary">90%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Separator />

      {/* Ingredients Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.ingredients.map((ingredient, index) => (
                <div key={index} className="space-y-1">
                  <p className="font-medium">{ingredient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ingredient.description}
                  </p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-xs font-mono break-words">
              {product.ingredients.map((i) => i.name).join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* FAQs Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">FAQs</h2>
        <Accordion type="single" collapsible className="w-full">
          {product.faqs?.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}