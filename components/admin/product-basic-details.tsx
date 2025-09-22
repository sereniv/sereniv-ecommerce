'use client'

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types/product";
import { slugify } from "@/lib/utils";
import RichTextEditor from "../rich-text-editor";
import ImageUpload from "../image-upload";

function ProductBasicDetails({
  formData,
  setFormData,
  formErrors,
}: {
  formData: Product;
  setFormData: (formData: Product) => void;
  formErrors: { [key: string]: string };
}) {
  console.log("formData", formData);
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
                "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                formErrors.name && "border-red-600 focus-visible:ring-red-600"
              )}
            />
            {formErrors.name && (
              <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
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
              <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
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
              <p className="text-sm text-red-600 mt-1">{formErrors.thumbnail}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="text-gray-600 font-semibold">
                Price <span className="text-red-600">*</span>
              </label>
              <Input
                id="price"
                required
                type="number"
                placeholder="Enter product price"
                value={formData.price || ""}
                min={0}
                step="0.01"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Number(e.target.value),
                  })
                }
                className={cn(
                  "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                  formErrors.price && "border-red-600 focus-visible:ring-red-600"
                )}
              />
              {formErrors.price && (
                <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="weight" className="text-gray-600 font-semibold">
                Weight <span className="text-red-600">*</span>
              </label>
              <Input
                id="weight"
                required
                placeholder="Enter product weight (e.g., 100g)"
                value={formData.weight || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: e.target.value,
                  })
                }
                className={cn(
                  "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                  formErrors.weight && "border-red-600 focus-visible:ring-red-600"
                )}
              />
              {formErrors.weight && (
                <p className="text-sm text-red-600 mt-1">{formErrors.weight}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="text-gray-600 font-semibold">
                Stock <span className="text-red-600">*</span>
              </label>
              <Input
                id="stock"
                required
                placeholder="Enter product stock"
                type="number"
                value={formData.stock || ""}
                min={0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: Number(e.target.value),
                  })
                }
                className={cn(
                  "h-12 border-gray-200 rounded-lg focus-visible:ring-gray-900",
                  formErrors.stock && "border-red-600 focus-visible:ring-red-600"
                )}
              />
              {formErrors.stock && (
                <p className="text-sm text-red-600 mt-1">{formErrors.stock}</p>
              )}
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
              <p className="text-sm text-red-600 mt-1">{formErrors.isFeatured}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductBasicDetails;