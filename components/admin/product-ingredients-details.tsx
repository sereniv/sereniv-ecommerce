import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PlusIcon, XIcon } from "lucide-react";
import { z } from "zod";
import RichTextEditor from "../rich-text-editor";
import { useToast } from "../ui/use-toast";
import { Product , Ingredient } from "@/lib/types";

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
  };

  const removeIngredient = (index: number) => {
    const ingredients = [...(formData.ingredients || [])];
    ingredients.splice(index, 1);
    setFormData({ ...formData, ingredients });
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-md dark:bg-slate-800/40">
        <h3 className="font-medium mb-2 dark:text-white">Add Ingredients</h3>
        <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">
          Add ingredients used in your product. This helps users understand its composition.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1.5 text-foreground dark:text-white"
            >
              Ingredient Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <Input
              id="name"
              placeholder="e.g., Organic Sugar"
              value={newIngredient.name}
              onChange={(e) => {
                setNewIngredient({ ...newIngredient, name: e.target.value });
                setIngredientErrors({ ...ingredientErrors, name: undefined });
              }}
              className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
            {ingredientErrors.name && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">{ingredientErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1.5 text-foreground dark:text-white"
            >
              Description <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <RichTextEditor
              value={newIngredient.description || ""}
              onChange={(value) => {
                setNewIngredient({ ...newIngredient, description: value });
                setIngredientErrors({ ...ingredientErrors, description: undefined });
              }}
              placeholder="Enter ingredient description"
            />
            {ingredientErrors.description && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">{ingredientErrors.description}</p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addIngredient}
            className="w-full dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
      </div>

      {formData.ingredients && formData.ingredients.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-medium dark:text-white">Added Ingredients</h3>

          {formData.ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-md border dark:border-slate-700 p-4 relative shadow-sm"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(index)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive dark:text-slate-400 dark:hover:text-red-400"
              >
                <XIcon className="h-4 w-4" />
              </Button>

              <div className="pr-8">
                <h4 className="font-medium dark:text-white">{ingredient.name}</h4>
                <div
                  className="prose dark:prose-invert max-w-none mb-6 text-foreground dark:text-white/80"
                  dangerouslySetInnerHTML={{ __html: ingredient.description }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md dark:border-slate-700 dark:text-slate-400">
          <PlusIcon className="mx-auto h-8 w-8 mb-2" />
          <p>No ingredients added yet</p>
          <p className="text-sm mt-1">Add ingredients used in your product</p>
        </div>
      )}
    </div>
  );
}

export default ProductIngredientsDetails;