"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, X } from "lucide-react";
import { z } from "zod";
import RichTextEditor from "../rich-text-editor";
import { useToast } from "../ui/use-toast";
import { Product, Ingredient } from "@/lib/types";
import { cn } from "@/lib/utils";

const ingredientSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
});

interface ProductIngredientsDetailsProps {
  formData: Product;
  setFormData: (formData: Product) => void;
  formErrors?: Record<string, string>;
}

function ProductIngredientsDetails({ formData, setFormData, formErrors }: ProductIngredientsDetailsProps) {
  const { toast } = useToast();

  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: "",
    description: "",
  });

  const [ingredientErrors, setIngredientErrors] = useState<{ name?: string; description?: string }>({});

  const addIngredient = () => {
    const validation = ingredientSchema.safeParse(newIngredient);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setIngredientErrors({
        name: errors.name?.[0],
        description: errors.description?.[0],
      });
      toast({
        title: "Validation Error",
        description: errors.name?.[0] || errors.description?.[0] || "Please fill in all required ingredient fields",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      ingredients: [...(formData.ingredients || []), newIngredient],
    });

    setNewIngredient({ name: "", description: "" });
    setIngredientErrors({});

    toast({
      title: "Success",
      description: "Ingredient added successfully",
    });
  };

  const removeIngredient = (index: number) => {
    const ingredients = [...(formData.ingredients || [])];
    ingredients.splice(index, 1);
    setFormData({ ...formData, ingredients });
    toast({
      title: "Success",
      description: "Ingredient removed successfully",
    });
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Ingredient Section */}
      <div className="border-t-2 border-gray-100 pt-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white">
          Add Ingredients
        </label>
        <p className="text-xs text-gray-600 mb-3 dark:text-gray-400">
          Add ingredients used in your product to help users understand its composition.
        </p>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="ingredient-name"
              className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
            >
              Ingredient Name <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <Input
              id="ingredient-name"
              placeholder="e.g., Organic Sugar"
              value={newIngredient.name}
              onChange={(e) => {
                setNewIngredient({ ...newIngredient, name: e.target.value });
                setIngredientErrors({ ...ingredientErrors, name: undefined });
              }}
              onKeyDown={handleIngredientKeyDown}
              className={cn(
                "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                ingredientErrors.name && "border-red-600 focus-visible:ring-red-600"
              )}
              aria-describedby={ingredientErrors.name ? "ingredient-name-error" : undefined}
            />
            {ingredientErrors.name && (
              <p id="ingredient-name-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                {ingredientErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ingredient-description"
              className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
            >
              Description <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <RichTextEditor
              value={newIngredient.description || ""}
              onChange={(value) => {
                setNewIngredient({ ...newIngredient, description: value });
                setIngredientErrors({ ...ingredientErrors, description: undefined });
              }}
              placeholder="Enter ingredient description"
              minWords={5}
              maxWords={200}
              className="min-h-[150px] border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700"
              aria-describedby={ingredientErrors.description ? "ingredient-description-error" : undefined}
            />
            {ingredientErrors.description && (
              <p id="ingredient-description-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                {ingredientErrors.description}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={addIngredient}
              className="h-12 w-full px-6 bg-gray-900 hover:bg-black rounded-lg text-white dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
        </div>
      </div>

      {/* Added Ingredients Section */}
      {formData.ingredients && formData.ingredients.length > 0 ? (
        <div className="border-t-2 border-gray-100 pt-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white">
            Added Ingredients
          </label>
          <div className="space-y-3">
            {formData.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 bg-white rounded-lg p-4 relative shadow-sm dark:bg-gray-800 dark:border-gray-700"
              >
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="absolute right-2 top-2 p-1 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/50"
                  aria-label={`Remove ${ingredient.name}`}
                >
                  <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                </button>
                <div className="pr-8">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {ingredient.name}
                  </h4>
                  <div
                    className="text-sm text-gray-900 dark:text-gray-200 mt-2"
                    dangerouslySetInnerHTML={{ __html: ingredient.description }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center dark:border-gray-700">
          <Plus className="h-12 w-12 text-gray-400 mx-auto mb-3 dark:text-gray-500" />
          <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">No ingredients added yet</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Add ingredients used in your product
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductIngredientsDetails;