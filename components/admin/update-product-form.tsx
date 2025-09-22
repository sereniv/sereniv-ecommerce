"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { DocumentIcon } from "@/components/icons";
import ProductBasicDetails from "./product-basic-details";
import ProductImagesDetails from "./product-images-details";
import { Product } from "@/lib/types/product";
import { ProductSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";

interface UpdateProjectFormProps {
  slug : string;
  initialData: Product;
}

interface FormStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function UpdateProjectForm({
  slug ,
  initialData,
}: UpdateProjectFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<Product>(
    initialData ||
      ({
        name: "",
        slug: "",
        description: "",
        thumbnail: "",
        images: [],
        price: 0,
        weight: "",
        stock: 0,
        isActive: true,
        isFeatured: false,
      } as Product)
  );
  const [mounted, setMounted] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [stepValidated, setStepValidated] = useState<{
    [key: number]: boolean;
  }>({
    0: false,
    1: false,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps: FormStep[] = [
    {
      id: "basics",
      title: "Prduct Details",
      icon: <DocumentIcon />,
      description: "Add all of your Product details",
    },
    {
      id: "Product Images",
      title: "All Product Images",
      icon: <DocumentIcon />,
      description: "Add all of your Product Images",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormSubmitting(true);
      const response = await fetch(`/api/admin/products/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update project");
      }

      setFormSubmitted(true);
      toast({
        title: "Project Updated",
        description: "Project has been successfully updated.",
      });
     router.push(`/admin/products`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const validateProductDetails = () => {
    const result = ProductSchema.safeParse({
      slug: formData.slug,
      name: formData.name,
      description: formData.description,
      thumbnail: formData.thumbnail,
      images: formData.images || [],
      price: formData.price,
      weight: formData.weight,
      stock: formData.stock,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    });

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.errors.forEach((error) => {
        errors[error.path.join(".")] = error.message;
      });
      console.log("Basic Details Errors", errors);
      return {
        isValid: false,
        errors: errors,
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
            "Project Details: " + (errorMessages || "Validation failed")
          );
          const errorMessage =
            validationErrors.length === 1
              ? validationErrors[0]
              : `Project Details:\n${validationErrors.join("\n")}`;
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

  return (
    <>
      <div className="lg:col-span-3">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Steps</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="flex flex-col">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left border-l-2",
                    currentStep === index
                      ? "border-l-primary font-medium bg-muted/50"
                      : "border-l-transparent"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full bg-muted-foreground/10",
                      currentStep === index && "bg-primary/10 text-primary"
                    )}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Form Content */}
      <div className="lg:col-span-8">
        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-2xl font-semibold">
              {steps[currentStep].title}
            </CardTitle>
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
                <ProductImagesDetails
                  formData={formData}
                  setFormData={setFormData}
                />
              )}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={formSubmitting || formSubmitted}
                  >
                    {formSubmitting
                      ? "Submitting..."
                      : formSubmitted
                      ? "Project Submitted"
                      : "Update Project"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
