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
import { Trash, Save, Edit, X, Plus } from "lucide-react";
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
      price: 0,
      stock: 0,
      discount: 0,
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
        title: "Variant size is required",
        description: "Please enter a valid variant size",
        variant: "destructive",
      });
      return;
    }
    if (tempVariant.price <= 0) {
      toast({
        title: "Variant price is required",
        description: "Please enter a valid variant price",
        variant: "destructive",
      });
      return;
    }
    if (tempVariant.stock < 0) {
      toast({
        title: "Variant stock is required",
        description: "Please enter a valid variant stock",
        variant: "destructive",
      });
      return;
    }

    const updatedVariants = [...(formData.variants || [])];
    updatedVariants[index] = tempVariant;
    setFormData({
      ...formData,
      variants: updatedVariants,
    });
    setEditingVariantIndex(null);
    setTempVariant(null);
  };

  const cancelEditVariant = (index: number) => {
    if (formData.variants?.[index] && !formData.variants[index].size) {
      removeVariant(index);
    }
    setEditingVariantIndex(null);
    setTempVariant(null);
  };

  const updateTempVariant = (updatedFields: Partial<Variant>) => {
    if (!tempVariant) return;
    setTempVariant({ ...tempVariant, ...updatedFields });
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
        title: "Category cannot be empty",
        description: "Please enter a valid category name",
        variant: "destructive",
      });
      return;
    }

    const currentCategories = formData.categories || [];
    if (currentCategories.includes(trimmedCategory)) {
      toast({
        title: "Duplicate category",
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
        title: "Tag cannot be empty",
        description: "Please enter a valid tag name",
        variant: "destructive",
      });
      return;
    }

    const currentTags = formData.tags || [];
    if (currentTags.includes(trimmedTag)) {
      toast({
        title: "Duplicate tag",
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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="text-gray-600 font-semibold">
              Name <span className="text-red-600">*</span>
            </label>
            <Input
              id="name"
              required
              placeholder="Enter product name"
              value={formData.name ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: slugify(e.target.value),
                })
              }
              className={cn(
                "h-10 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                formErrors.name && "border-red-600 focus-visible:ring-red-600"
              )}
            />
            {formErrors.name && (
              <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="text-gray-600 font-semibold">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter product title"
              value={formData.title ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className={cn(
                "h-10 border-gray-200 rounded-lg focus-visible:ring-gray-900",
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
              className="text-gray-600 font-semibold"
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
              className="min-h-[100px] border-gray-200 rounded-lg focus-visible:ring-gray-900"
            />
            {formErrors.description && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.description}
              </p>
            )}
          </div>

          <div>
            <label className="text-gray-600 font-semibold">
              Upload Thumbnail
            </label>
            <p className="text-xs text-gray-600 mt-1 mb-4">
              Recommended size: 1200 × 630 pixels (PNG, JPEG, SVG are supported)
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
              className="border-gray-200 rounded-lg"
            />
            {formErrors.thumbnail && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.thumbnail}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="categories" className="text-gray-600 font-semibold">
              Categories
            </label>
            <p className="text-xs text-gray-600 mt-1 mb-2">
              Add categories to organize your product
            </p>
            <div className="flex gap-2">
              <Input
                id="categories"
                placeholder="Enter category name"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleCategoryKeyDown}
                className="h-10 border-gray-200 rounded-lg focus-visible:ring-gray-900"
              />
              <Button
                type="button"
                onClick={addCategory}
                className="h-10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {formErrors.categories && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.categories}
              </p>
            )}
            {formData.categories && formData.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="text-gray-600 font-semibold">
              Tags
            </label>
            <p className="text-xs text-gray-600 mt-1 mb-2">
              Add tags to help customers find your product
            </p>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Enter tag name"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="h-10 border-gray-200 rounded-lg focus-visible:ring-gray-900"
              />
              <Button
                type="button"
                onClick={addTag}
                className="h-10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {formErrors.tags && (
              <p className="text-sm text-red-600 mt-1">{formErrors.tags}</p>
            )}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-gray-600 font-semibold">Variants</label>
              <Button
                type="button"
                onClick={addVariant}
                className="mt-2 mb-4"
                disabled={editingVariantIndex !== null}
              >
                Add Variant
              </Button>
            </div>
            {formErrors.variant && (
              <p className="text-sm text-red-600 mt-1">{formErrors.variant}</p>
            )}
            <div className="space-y-4">
              {(formData.variants || []).map((variant, index) => (
                <div
                  key={index}
                  className={cn(
                    "border p-4 rounded-lg space-y-4",
                    isEditing(index)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-gray-600 font-semibold">
                      Variant {index + 1}
                      {isEditing(index) && (
                        <span className="text-xs text-blue-600 ml-2">
                          (Editing)
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
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => cancelEditVariant(index)}
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            disabled={editingVariantIndex !== null}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing(index) ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor={`size-${index}`}
                          className="text-gray-600 font-semibold"
                        >
                          Size <span className="text-red-600">*</span>
                        </label>
                        <Input
                          id={`size-${index}`}
                          required
                          placeholder="Enter size (e.g., 100g)"
                          value={tempVariant?.size ?? ""}
                          onChange={(e) =>
                            updateTempVariant({ size: e.target.value })
                          }
                          className={cn(
                            "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                            getVariantError(index, "size") &&
                              "border-red-600 focus-visible:ring-red-600"
                          )}
                        />
                        {getVariantError(index, "size") && (
                          <p className="text-sm text-red-600 mt-1">
                            {getVariantError(index, "size")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`price-${index}`}
                          className="text-gray-600 font-semibold"
                        >
                          Price <span className="text-red-600">*</span>
                        </label>
                        <Input
                          id={`price-${index}`}
                          required
                          type="number"
                          placeholder="Enter product variant price"
                          value={tempVariant?.price ?? ""}
                          min={0}
                          step="0.01"
                          onChange={(e) =>
                            updateTempVariant({
                              price:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                          className={cn(
                            "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                            getVariantError(index, "price") &&
                              "border-red-600 focus-visible:ring-red-600"
                          )}
                        />{" "}
                        {getVariantError(index, "price") && (
                          <p className="text-sm text-red-600 mt-1">
                            {getVariantError(index, "price")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`stock-${index}`}
                          className="text-gray-600 font-semibold"
                        >
                          Stock <span className="text-red-600">*</span>
                        </label>
                        <Input
                          id={`stock-${index}`}
                          required
                          type="number"
                          placeholder="Enter stock"
                          value={tempVariant?.stock ?? ""}
                          min={0}
                          onChange={(e) =>
                            updateTempVariant({ stock: Number(e.target.value) })
                          }
                          className={cn(
                            "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                            getVariantError(index, "stock") &&
                              "border-red-600 focus-visible:ring-red-600"
                          )}
                        />
                        {getVariantError(index, "stock") && (
                          <p className="text-sm text-red-600 mt-1">
                            {getVariantError(index, "stock")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`discount-${index}`}
                          className="text-gray-600 font-semibold"
                        >
                          Discount
                        </label>
                        <Input
                          id={`discount-${index}`}
                          type="number"
                          placeholder="Enter discount (optional)"
                          value={tempVariant?.discount ?? ""}
                          min={0}
                          step="0.01"
                          onChange={(e) =>
                            updateTempVariant({
                              discount: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          className={cn(
                            "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                            getVariantError(index, "discount") &&
                              "border-red-600 focus-visible:ring-red-600"
                          )}
                        />
                        {getVariantError(index, "discount") && (
                          <p className="text-sm text-red-600 mt-1">
                            {getVariantError(index, "discount")}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Size</p>
                        <p className="text-sm font-medium">
                          {variant.size || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-sm font-medium">
                          ₹{variant.price?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className="text-sm font-medium">
                          {variant.stock ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Discount</p>
                        <p className="text-sm font-medium">
                          {variant.discount
                            ? `₹${variant.discount.toFixed(2)}`
                            : "None"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="isFeatured" className="text-gray-600 font-semibold">
              Featured
            </label>
            <div className="flex items-center space-x-2 mt-1">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isFeatured: !!checked,
                  })
                }
                className="border-gray-200 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
              />
              <span className="text-sm text-gray-600">
                Mark this product as featured
              </span>
            </div>
            {formErrors.isFeatured && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.isFeatured}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductBasicDetails;