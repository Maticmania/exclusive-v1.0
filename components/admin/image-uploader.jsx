"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { X, ImagePlus, Loader2 } from "lucide-react"

export default function ImageUploader({ images = [], onChange, maxImages = 5 }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)

    if (!files.length) return

    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images`)
      return
    }

    setIsUploading(true)

    try {
      // In a real app, you would upload these to a storage service
      // For this example, we'll create object URLs
      const newImages = files.map((file) => URL.createObjectURL(file))

      // Add the new images to the existing ones
      onChange([...images, ...newImages])

      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`)
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload images")
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ""
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

