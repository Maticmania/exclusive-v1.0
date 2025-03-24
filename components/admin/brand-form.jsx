"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, Save, ArrowLeft, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ImageUploader from "./image-uploader"

export default function BrandForm({ brand = null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [logo, setLogo] = useState(brand?.logo ? [brand.logo] : [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: brand?.name || "",
      description: brand?.description || "",
      featured: brand?.featured || false,
    },
  })

  // Watch form values
  const watchFeatured = watch("featured")

  // Handle logo upload
  const handleLogoChange = (newImages) => {
    setLogo(newImages)
    setValue("logo", newImages[0] || "")
  }

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      // Add logo to form data
      data.logo = logo[0] || ""

      const url = brand ? `/api/admin/brands/${brand._id}` : "/api/admin/brands"

      const method = brand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save brand")
      }

      toast.success(brand ? "Brand updated successfully" : "Brand created successfully")

      // Redirect to brands list
      router.push("/admin/brands")
      router.refresh()
    } catch (error) {
      console.error("Error saving brand:", error)
      toast.error(error.message || "Failed to save brand")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle brand deletion
  const handleDelete = async () => {
    if (!brand) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/brands/${brand._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete brand")
      }

      toast.success("Brand deleted successfully")

      // Redirect to brands list
      router.push("/admin/brands")
      router.refresh()
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast.error(error.message || "Failed to delete brand")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/brands")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Brands</span>
        </Button>

        <div className="flex items-center gap-2">
          {brand && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the brand. If this brand is used by any
                    products, the deletion will fail.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{brand ? "Update" : "Create"} Brand</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name", { required: "Brand name is required" })} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={watchFeatured}
                onCheckedChange={(checked) => setValue("featured", checked)}
              />
              <Label htmlFor="featured" className="font-normal cursor-pointer">
                Featured brand
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Brand Logo</Label>
            <ImageUploader images={logo} onChange={handleLogoChange} maxImages={1} />
          </div>
        </div>
      </div>
    </form>
  )
}

