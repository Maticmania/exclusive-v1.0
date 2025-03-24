"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function ProductForm({ product = null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [images, setImages] = useState(product?.images || [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
      compareAtPrice: product?.compareAtPrice || "",
      category: product?.category?._id || product?.category || "",
      brand: product?.brand?._id || product?.brand || "",
      stock: product?.stock || 0,
      featured: product?.featured || false,
      isPublished: product?.isPublished !== false, // Default to true if not specified
    },
  })

  // Watch form values
  const watchFeatured = watch("featured")
  const watchIsPublished = watch("isPublished")

  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/admin/categories")
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        // Fetch brands
        const brandsRes = await fetch("/api/admin/brands")
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          setBrands(brandsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load categories and brands")
      }
    }

    fetchData()
  }, [])

  // Handle image upload
  const handleImagesChange = (newImages) => {
    setImages(newImages)
    setValue("images", newImages)
  }

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      // Add images to form data
      data.images = images

      // Convert price and compareAtPrice to numbers
      data.price = Number.parseFloat(data.price)
      if (data.compareAtPrice) {
        data.compareAtPrice = Number.parseFloat(data.compareAtPrice)
      }

      const url = product ? `/api/admin/products/${product._id}` : "/api/admin/products"

      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save product")
      }

      toast.success(product ? "Product updated successfully" : "Product created successfully")

      // Redirect to products list
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error(error.message || "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product deletion
  const handleDelete = async () => {
    if (!product) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete product")
      }

      toast.success("Product deleted successfully")

      // Redirect to products list
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error(error.message || "Failed to delete product")
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
          onClick={() => router.push("/admin/products")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Button>

        <div className="flex items-center gap-2">
          {product && (
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
                    This action cannot be undone. This will permanently delete the product.
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
                <span>{product ? "Update" : "Create"} Product</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name", { required: "Product name is required" })} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea id="description" rows={6} {...register("description", { required: "Description is required" })} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <ImageUploader images={images} onChange={handleImagesChange} maxImages={5} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="price">
              Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price must be positive" },
              })}
            />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Compare at Price</Label>
            <Input
              id="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              {...register("compareAtPrice", {
                min: { value: 0, message: "Compare at price must be positive" },
              })}
            />
            {errors.compareAtPrice && <p className="text-sm text-destructive">{errors.compareAtPrice.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("category", value)} defaultValue={watch("category")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select onValueChange={(value) => setValue("brand", value)} defaultValue={watch("brand")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">
              Stock <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              {...register("stock", {
                required: "Stock is required",
                min: { value: 0, message: "Stock must be positive" },
              })}
            />
            {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={watchFeatured}
                onCheckedChange={(checked) => setValue("featured", checked)}
              />
              <Label htmlFor="featured" className="font-normal cursor-pointer">
                Featured product
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={watchIsPublished}
                onCheckedChange={(checked) => setValue("isPublished", checked)}
              />
              <Label htmlFor="isPublished" className="font-normal cursor-pointer">
                Published
              </Label>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

