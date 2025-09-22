'use client'

import { useState, useCallback } from 'react'
import { ImagePlus, Loader2, X, Upload, ArrowUp, ArrowDown } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useDropzone } from 'react-dropzone'
import { getApiUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Product } from '@/lib/types/product'

interface ProductImagesDetailsProps {
  formData: Product
  setFormData: (formData: Product) => void
  disabled?: boolean
  className?: string
}

export default function ProductImagesDetails({
  formData,
  setFormData,
  disabled = false,
  className
}: ProductImagesDetailsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const maxImages = 5
  const maxSizeMB = 5

  const handleUpload = useCallback(async (file: File) => {
    try {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Please upload an image smaller than ${maxSizeMB}MB`,
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, GIF)",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_TARGET_URL || process.env.UPLOAD_TARGET_URL || getApiUrl('/upload')
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData({
        ...formData,
        images: [...(formData.images || []), data.url]
      })

      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully.",
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }, [formData, setFormData, toast])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      if ((formData.images?.length || 0) + acceptedFiles.length > maxImages) {
        toast({
          title: "Too many images",
          description: `You can upload up to ${maxImages} images.`,
          variant: "destructive",
        })
        return
      }
      acceptedFiles.forEach((file) => handleUpload(file))
    }
  }, [handleUpload, formData.images, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxFiles: maxImages - (formData.images?.length || 0),
    disabled: disabled || isUploading || (formData.images?.length || 0) >= maxImages
  })

  const handleRemove = (index: number) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newImages = [...(formData.images || [])]
    const [movedItem] = newImages.splice(index, 1)
    newImages.splice(index - 1, 0, movedItem)
    setFormData({ ...formData, images: newImages })
  }

  const handleMoveDown = (index: number) => {
    if (index === (formData.images?.length || 0) - 1) return
    const newImages = [...(formData.images || [])]
    const [movedItem] = newImages.splice(index, 1)
    newImages.splice(index + 1, 0, movedItem)
    setFormData({ ...formData, images: newImages })
  }

  return (
    <div className={cn("space-y-6 w-full", className)}>
      {/* Dropzone */}
      {(formData.images?.length || 0) < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            "relative w-full h-64 rounded-lg border-2 border-dashed border-gray-200 bg-gray-100 transition-all duration-300 cursor-pointer group",
            isDragActive
              ? "border-gray-400 bg-gray-200"
              : "hover:border-gray-400 hover:bg-gray-200",
            (disabled || isUploading || (formData.images?.length || 0) >= maxImages)
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          )}
        >
          <input {...getInputProps()} disabled={disabled || isUploading || (formData.images?.length || 0) >= maxImages} />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <div className="p-3 rounded-lg bg-gray-200 border border-gray-200 shadow-sm mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Uploading...
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we upload your images
                </p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Product Images
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {isDragActive ? 'Drop the images here' : 'Drag and drop images here, or click to select'}
                </p>
                <p className="text-xs text-gray-600">
                  JPG, PNG, GIF (max {maxSizeMB}MB, up to {maxImages} images)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Grid */}
      {(formData.images?.length || 0) > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Uploaded Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images?.map((url, index) => (
              <div
                key={url}
                className="relative group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    fill
                    className="object-cover"
                    alt={`Product image ${index + 1}`}
                    src={url}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                    onClick={() => handleMoveUp(index)}
                    disabled={disabled || index === 0}
                  >
                    <ArrowUp className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button
                    type="button"
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                    onClick={() => handleMoveDown(index)}
                    disabled={disabled || index === (formData.images?.length || 0) - 1}
                  >
                    <ArrowDown className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}