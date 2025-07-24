"use client"

import { useState, useCallback } from 'react'
import { ImagePlus, Loader2, X, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useDropzone } from 'react-dropzone'
import { getApiUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  title?: string
  description?: string
  maxSizeMB?: number
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  className,
  title = "Upload Image",
  description = "Drag and drop an image here, or click to select",
  maxSizeMB = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

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
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_TARGET_URL || process.env.UPLOAD_TARGET_URL || getApiUrl('/upload')
      console.log('Using upload URL:', uploadUrl)
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
      
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
  }, [onChange, toast, maxSizeMB])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      handleUpload(acceptedFiles[0])
    }
  }, [handleUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    disabled: disabled || isUploading
  })

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {!value && (
        <div 
          {...getRootProps()} 
          className={cn(
            "relative w-full h-48 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
            isDragActive
              ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/50"
              : "border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/30 to-orange-100/20 dark:from-orange-950/30 dark:to-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/50",
            disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <input {...getInputProps()} disabled={disabled || isUploading} />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200/50 dark:from-orange-800/50 dark:to-orange-700/30 border border-orange-200 dark:border-orange-700 shadow-lg mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  Uploading...
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Please wait while we upload your image
                </p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200/50 dark:from-orange-800/50 dark:to-orange-700/30 border border-orange-200 dark:border-orange-700 shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                  {isDragActive ? 'Drop the image here' : description}
                </p>
                <p className="text-xs text-orange-500 dark:text-orange-500">
                  JPG, PNG, GIF (max {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      {value && (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/50 dark:to-orange-900/30">
            <Image
              fill
              className="object-cover"
              alt="Uploaded image"
              src={value}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => onChange('')}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}