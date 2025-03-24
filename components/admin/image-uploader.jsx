"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { X, ImagePlus, Loader2 } from "lucide-react"

export default function ImageUploader({ images = [], onChange, maxImages = 5 }) {
  const [isUploading, setIsUploading] = useState(false)

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file) // Convert file to base64
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
  
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images`)
      return
    }
  
    setIsUploading(true)
  
    try {
      // Convert files to base64
      const base64Images = await Promise.all(files.map((file) => convertFileToBase64(file)))
  
      // Add images to state (temporary preview before saving to backend)
      onChange([...images, ...base64Images])
  
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} added`)
    } catch (error) {
      console.error("Error converting images:", error)
      toast.error("Failed to process images")
    } finally {
      setIsUploading(false)
      e.target.value = "" // Reset file input
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
            <Image src={image || "/placeholder.svg"} alt={`Product image ${index + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="border border-dashed rounded-md flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-muted/50 aspect-square">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center">Upload Image</span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  )
}

