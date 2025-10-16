"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { DocumentIcon } from "@/components/icons";
import ProductBasicDetails from "./product-basic-details";
import ProductIngredientsDetails from "./product-ingredients-details";
import ProductFaqDetails from "./product-faq-details";
import ProductImagesDetails from "./product-images-details";
import { Product, Variant, Cart, Faq, Ingredient } from "@/lib/types";
import { ProductSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { Package, Leaf, HelpCircle, Image, Check } from "lucide-react";

interface FormStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function AddProductForm() {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
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

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [stepValidated, setStepValidated] = useState<{
    [key: number]: boolean;
  }>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps: FormStep[] = [
    {
      id: "basics",
      title: "Product Details",
      icon: <Package className="w-5 h-5" />,
      description: "Add all of your product details",
    },
    {
      id: "ingredients",
      title: "Product Ingredients",
      icon: <Leaf className="w-5 h-5" />,
      description: "Add all of your product ingredients details",
    },
    {
      id: "faqs",
      title: "Product FAQs",
      icon: <HelpCircle className="w-5 h-5" />,
      description: "Add all of your product FAQs details",
    },
    {
      id: "product-images",
      title: "Product Images",
      icon: <Image className="w-5 h-5" />,
      description: "Add all of your product images",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormSubmitting(true);
      const { createdAt, updatedAt, carts, id, ...payload } = formData;
      const response = await fetch(`/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      setFormSubmitted(true);
      toast({
        title: "Product Created",
        description: "Product has been successfully created.",
      });

      router.push(`/admin/products`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const validateProductDetails = () => {
    const result = ProductSchema.safeParse({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      thumbnail: formData.thumbnail,
      images: formData.images || [],
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      categories: formData.categories || [],
      tags: formData.tags || [],
      frequentlyBoughtProducts: formData.frequentlyBoughtProducts || [],
      relatedProducts: formData.relatedProducts || [],
    });

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.errors.forEach((error) => {
        errors[error.path.join(".")] = error.message;
      });
      return {
        isValid: false,
        errors,
      };
    }

    setStepValidated({ ...stepValidated, 0: true });
    return {
      isValid: true,
      errors: {},
    };
  };

  const nextStep = () => {
    try {
      let isDetails = {
        isValid: true,
        errors: {},
      };
      const validationErrors: string[] = [];
      let currentErrors: { [key: string]: string } = {};

      if (currentStep === 0) {
        isDetails = validateProductDetails();
        if (!isDetails.isValid) {
          currentErrors = { ...isDetails.errors };
          setFormErrors(currentErrors);
          const errorMessages = Object.values(currentErrors)
            .filter((msg) => msg)
            .join(", ");
          validationErrors.push(
            "Product Details: " + (errorMessages || "Validation failed")
          );
          const errorMessage =
            validationErrors.length === 1
              ? validationErrors[0]
              : `Product Details:\n${validationErrors.join("\n")}`;
          throw new Error(errorMessage);
        }
      }
      if (isDetails.isValid && currentStep < steps.length - 1) {
        setTimeout(() => {
          setCurrentStep((s) => s + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to proceed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  if (!mounted) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between border-b py-4">
            <div className="">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Add New Product
              </h1>
              <p className="text-gray-600">
                Fill in the details to create a new product
              </p>
            </div>
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      index < currentStep
                        ? "bg-green-100 text-green-700"
                        : index === currentStep
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-1",
                        index < currentStep ? "bg-green-200" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Steps */}
          <div className="lg:col-span-3">
            <Card className="sticky top-6 border-2 border-gray-200">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      className={cn(
                        "flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left border-l-4",
                        currentStep === index
                          ? "border-l-gray-900 bg-gray-50"
                          : index < currentStep
                          ? "border-l-green-500"
                          : "border-l-transparent"
                      )}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-lg transition-colors flex-shrink-0",
                          currentStep === index
                            ? "bg-gray-900 text-white"
                            : index < currentStep
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        )}
                      >
                        {index < currentStep ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "font-semibold text-sm mb-1",
                            currentStep === index
                              ? "text-gray-900"
                              : "text-gray-600"
                          )}
                        >
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 leading-tight">
                          {step.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-9">
            <Card className="border-2 border-gray-200">
              <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                    {steps[currentStep].icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {steps[currentStep].title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {steps[currentStep].description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                  {currentStep === 0 && (
                    <ProductBasicDetails
                      formData={formData}
                      setFormData={setFormData}
                      formErrors={formErrors}
                    />
                  )}

                  {currentStep === 1 && (
                    <ProductIngredientsDetails
                      // @ts-ignore
                      formData={formData}
                      setFormData={setFormData}
                      formErrors={formErrors}
                    />
                  )}

                  {currentStep === 2 && (
                    <ProductFaqDetails
                      // @ts-ignore
                      formData={formData}
                      setFormData={setFormData}
                      formErrors={formErrors}
                    />
                  )}

                  {currentStep === 3 && (
                    <ProductImagesDetails
                      // @ts-ignore
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 rounded-lg px-6 h-12 font-medium"
                    >
                      Back
                    </Button>
                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-gray-900 hover:bg-black text-white rounded-lg px-8 h-12 font-medium"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={formSubmitting || formSubmitted}
                        className="bg-gray-900 hover:bg-black text-white rounded-lg px-8 h-12 font-medium disabled:bg-gray-400"
                      >
                        {formSubmitting
                          ? "Submitting..."
                          : formSubmitted
                          ? "Product Submitted"
                          : "Submit Product"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}