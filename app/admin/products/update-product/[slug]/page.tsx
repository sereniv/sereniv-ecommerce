"use client";

import UpdateProductForm from "@/components/admin/update-product-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product , Variant , Ingredient , Faq } from "@/lib/types";
import { FormShimmer } from "@/components/ui/shimmer";
import { useToast } from "@/components/ui/use-toast";

export default function AdminProductUpdatePage() {
  const params = useParams();
  const { toast } = useToast();

  if (!params || !params.slug) {
    return <FormShimmer />;
  }

  const slug = params.slug as string;

 const [product , setProduct] = useState<Partial<Product>>({
     name: "",
     slug: "",
     title: "",
     description: "",
     thumbnail: "",
     images: [],
     variants: [] as Variant[],
     isActive: true,
     isFeatured: false,
     categories: [],
     tags: [],
     ingredients: [] as Ingredient[],
     faqs: [] as Faq[],
     frequentlyBoughtProducts: [],
     relatedProducts: [],
   });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!slug) {
          throw new Error("No project slug provided");
        }

        const response = await fetch(`/api/admin/products/${slug}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch product: ${response.statusText}`
          );
        }

        const responseData = await response.json();
        console.log("Response data:", responseData);
        setProduct(responseData.data);
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

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {loading ? (
          <FormShimmer />
        ) : (
          <UpdateProductForm slug={slug} initialData={product} />
        )}
      </div>
    </div>
  );
}
