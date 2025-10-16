"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Product, Variant } from "@/lib/types";
import { slugify } from "@/lib/utils";
import RichTextEditor from "../rich-text-editor";
import ImageUpload from "../image-upload";
import { Trash, Save, Edit, X, Plus, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function ProductBasicDetails({
  formData,
  setFormData,
  formErrors,
}: {
  formData: Partial<Product>;
  setFormData: (formData: Partial<Product>) => void;
  formErrors: { [key: string]: string };
}) {
  const { toast } = useToast();
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null
  );
  const [tempVariant, setTempVariant] = useState<Variant | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const addVariant = () => {
    const newVariant: Variant = {
      size: "",
      price: "", 
      stock: "", 
      discount: "",
    };
    const newIndex = (formData.variants || []).length;
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), newVariant],
    });
    setEditingVariantIndex(newIndex);
    setTempVariant(newVariant);
  };
  const startEditVariant = (index: number) => {
    setEditingVariantIndex(index);
    setTempVariant({ ...(formData.variants?.[index] || {}) } as Variant);
  };

  const saveVariant = (index: number) => {
    if (!tempVariant) return;

    if (!tempVariant.size || !tempVariant.size.trim()) {
      toast({
        title: "Validation Error",
        description: "Variant size is required",
        variant: "destructive",
      });
      return;
    }

    const price = tempVariant.price === "" ? 0 : Number(tempVariant.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Validation Error",
        description: "Variant price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const stock = tempVariant.stock === "" ? 0 : Number(tempVariant.stock);
    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Validation Error",
        description: "Variant stock cannot be negative",
        variant: "destructive",
      });
      return;
    }

    const discount =
      tempVariant.discount === "" ? 0 : Number(tempVariant.discount);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast({
        title: "Validation Error",
        description: "Variant discount must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    const updatedVariants = [...(formData.variants || [])];
    updatedVariants[index] = {
      ...tempVariant,
      price,
      stock,
      discount,
    };
    setFormData({
      ...formData,
      variants: updatedVariants,
    });
    setEditingVariantIndex(null);
    setTempVariant(null);

    toast({
      title: "Success",
      description: "Variant saved successfully",
    });
  };

  const cancelEditVariant = (index: number) => {
    const variant = formData.variants?.[index];
    if (!variant || !variant.size) {
      removeVariant(index);
    }
    setEditingVariantIndex(null);
    setTempVariant(null);
  };

  const updateTempVariant = (updatedFields: Partial<Variant>) => {
    if (!tempVariant) return;
    setTempVariant({
      ...tempVariant,
      ...updatedFields,
      price:
        updatedFields.price !== undefined
          ? updatedFields.price === ""
            ? ""
            : Number(updatedFields.price)
          : tempVariant.price,
      stock:
        updatedFields.stock !== undefined
          ? updatedFields.stock === ""
            ? ""
            : Number(updatedFields.stock)
          : tempVariant.stock,
      discount:
        updatedFields.discount !== undefined
          ? updatedFields.discount === ""
            ? ""
            : Number(updatedFields.discount)
          : tempVariant.discount,
    });
  };

  const removeVariant = (index: number) => {
    const updatedVariants = (formData.variants || []).filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      variants: updatedVariants,
    });
    if (editingVariantIndex === index) {
      setEditingVariantIndex(null);
      setTempVariant(null);
    }
  };

  const addCategory = () => {
    const trimmedCategory = categoryInput.trim();
    if (!trimmedCategory) {
      toast({
        title: "Validation Error",
        description: "Category cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const currentCategories = formData.categories || [];
    if (currentCategories.includes(trimmedCategory)) {
      toast({
        title: "Duplicate Entry",
        description: "This category has already been added",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      categories: [...currentCategories, trimmedCategory],
    });
    setCategoryInput("");
  };

  const removeCategory = (categoryToRemove: string) => {
    setFormData({
      ...formData,
      categories: (formData.categories || []).filter(
        (cat) => cat !== categoryToRemove
      ),
    });
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) {
      toast({
        title: "Validation Error",
        description: "Tag cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const currentTags = formData.tags || [];
    if (currentTags.includes(trimmedTag)) {
      toast({
        title: "Duplicate Entry",
        description: "This tag has already been added",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      tags: [...currentTags, trimmedTag],
    });
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((tag) => tag !== tagToRemove),
    });
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory();
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const getVariantError = (index: number, field: string) => {
    return formErrors[`variant.${index}.${field}`];
  };

  const isEditing = (index: number) => editingVariantIndex === index;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Product Name <span className="text-red-600">*</span>
          </label>
          <Input
            id="name"
            required
            placeholder="e.g., Salicylic Acid + LHA 2% Cleanser"
            value={formData.name ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
                slug: slugify(e.target.value),
              })
            }
            className={cn(
              "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900",
              formErrors.name && "border-red-600 focus-visible:ring-red-600"
            )}
          />
          {formErrors.name && (
            <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Product Title
          </label>
          <Input
            id="title"
            placeholder="e.g., Reduces Sebum & Prevents Breakout"
            value={formData.title ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            className={cn(
              "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900",
              formErrors.title && "border-red-600 focus-visible:ring-red-600"
            )}
          />
          {formErrors.title && (
            <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Description
          </label>
          <RichTextEditor
            value={formData.description ?? ""}
            onChange={(value: string) =>
              setFormData({ ...formData, description: value })
            }
            placeholder="Enter product description"
            minWords={15}
            maxWords={500}
            className="min-h-[150px] border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900"
          />
          {formErrors.description && (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Product Thumbnail
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Recommended size: 1200 × 630 pixels (PNG, JPEG, SVG)
          </p>
          <ImageUpload
            value={formData.thumbnail || ""}
            onChange={(value) =>
              setFormData({
                ...formData,
                thumbnail: value,
              })
            }
            disabled={false}
            className="border-2 border-gray-200 rounded-lg"
          />
          {formErrors.thumbnail && (
            <p className="text-sm text-red-600 mt-1">{formErrors.thumbnail}</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="border-t-2 border-gray-100 pt-6">
        <label
          htmlFor="categories"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Categories
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Add categories to organize your product
        </p>
        <div className="flex gap-2">
          <Input
            id="categories"
            placeholder="e.g., Fragrance free, Non-comedogenic"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={handleCategoryKeyDown}
            className="h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900"
          />
          <Button
            type="button"
            onClick={addCategory}
            className="h-12 px-6 bg-gray-900 hover:bg-black rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        {formData.categories && formData.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200"
              >
                <span>{category}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="hover:bg-blue-100 rounded-full p-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="border-t-2 border-gray-100 pt-6">
        <label
          htmlFor="tags"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Tags
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Add tags to help customers find your product
        </p>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="e.g., acne, oily skin, cleanser"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900"
          />
          <Button
            type="button"
            onClick={addTag}
            className="h-12 px-6 bg-gray-900 hover:bg-black rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-200"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-green-100 rounded-full p-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="border-t-2 border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Product Variants
            </label>
            <p className="text-xs text-gray-600">
              Add different sizes and pricing options
            </p>
          </div>
          <Button
            type="button"
            onClick={addVariant}
            className="h-10 px-6 bg-gray-900 hover:bg-black rounded-lg"
            disabled={editingVariantIndex !== null}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>

        {(formData.variants || []).length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">No variants added yet</p>
            <Button
              type="button"
              onClick={addVariant}
              variant="outline"
              className="border-2 border-gray-200 hover:border-gray-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Variant
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {(formData.variants || []).map((variant, index) => (
              <div
                key={index}
                className={cn(
                  "border-2 rounded-lg transition-all",
                  isEditing(index)
                    ? "border-blue-500 bg-blue-50/50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-900">
                      Variant {index + 1}
                      {isEditing(index) && (
                        <span className="text-xs text-blue-600 font-normal ml-2">
                          • Editing
                        </span>
                      )}
                    </h4>
                    <div className="flex gap-2">
                      {isEditing(index) ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveVariant(index)}
                            className="bg-green-600 hover:bg-green-700 h-9"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => cancelEditVariant(index)}
                            className="h-9 border-2"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startEditVariant(index)}
                            disabled={editingVariantIndex !== null}
                            className="h-9 border-2 border-gray-200 hover:border-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            disabled={editingVariantIndex !== null}
                            className="h-9 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing(index) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Size <span className="text-red-600">*</span>
                        </label>
                        <Input
                          required
                          placeholder="e.g., 100ml"
                          value={tempVariant?.size ?? ""}
                          onChange={(e) =>
                            updateTempVariant({ size: e.target.value })
                          }
                          className={cn(
                            "h-10 border-2 border-gray-200 rounded-lg",
                            getVariantError(index, "size") && "border-red-600"
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Price (₹) <span className="text-red-600">*</span>
                        </label>
                        <Input
                          required
                          type="number"
                          placeholder="249"
                          value={tempVariant?.price ?? ""}
                          min="0"
                          step="0.01"
                          onChange={(e) =>
                            updateTempVariant({ price: e.target.value })
                          }
                          className={cn(
                            "h-10 border-2 border-gray-200 rounded-lg",
                            getVariantError(index, "price") && "border-red-600"
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Stock <span className="text-red-600">*</span>
                        </label>
                        <Input
                          required
                          type="number"
                          placeholder="100"
                          value={tempVariant?.stock ?? ""}
                          min="0"
                          onChange={(e) =>
                            updateTempVariant({ stock: e.target.value })
                          }
                          className={cn(
                            "h-10 border-2 border-gray-200 rounded-lg",
                            getVariantError(index, "stock") && "border-red-600"
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Discount (%)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={tempVariant?.discount ?? ""}
                          min="0"
                          max="100"
                          onChange={(e) =>
                            updateTempVariant({ discount: e.target.value })
                          }
                          className="h-10 border-2 border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Size</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {variant.size || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{Number(variant.price)?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Stock</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {variant.stock ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Discount</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {variant.discount ? `${variant.discount}%` : "None"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Checkbox */}
      <div className="border-t-2 border-gray-100 pt-6">
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <Checkbox
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                isFeatured: !!checked,
              })
            }
            className="mt-0.5 border-2 border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
          />
          <div className="flex-1">
            <label
              htmlFor="isFeatured"
              className="block text-sm font-semibold text-gray-900 cursor-pointer"
            >
              Featured Product
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Mark this product as featured to display it on the homepage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductBasicDetails;
