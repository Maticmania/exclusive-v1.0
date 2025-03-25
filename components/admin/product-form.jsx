"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Save, ArrowLeft, Trash2, Plus, X } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    control,
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
      tags: product?.tags || [],
      sku: product?.sku || "",
      weight: product?.weight || "",
      weightUnit: product?.weightUnit || "kg",
      dimensions: {
        length: product?.dimensions?.length || "",
        width: product?.dimensions?.width || "",
        height: product?.dimensions?.height || "",
        unit: product?.dimensions?.unit || "cm",
      },
      warrantyInformation: product?.warrantyInformation || "",
      shippingInformation: product?.shippingInformation || "",
      variants: product?.variants || [],
    },
  })

  // Use field arrays for variants and tags
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  })

  // Watch form values
  const watchFeatured = watch("featured")
  const watchIsPublished = watch("isPublished")
  const watchTags = watch("tags")

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

  // Handle tags input
  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value) {
      e.preventDefault()
      const newTag = e.target.value.trim().toLowerCase()
      if (newTag && !watchTags.includes(newTag)) {
        setValue("tags", [...watchTags, newTag])
      }
      e.target.value = ""
    }
  }

  const removeTag = (tagToRemove) => {
    setValue(
      "tags",
      watchTags.filter((tag) => tag !== tagToRemove),
    )
  }

  // Add a new variant type
  const addVariantType = () => {
    appendVariant({ name: "", options: [] })
  }

  // Add a new option to a variant type
  const addVariantOption = (variantIndex) => {
    const currentVariants = [...variantFields]
    const currentOptions = currentVariants[variantIndex].options || []

    setValue(`variants.${variantIndex}.options`, [
      ...currentOptions,
      { name: "", value: "", additionalPrice: 0, stock: 0, sku: "" },
    ])
  }

  // Remove a variant option
  const removeVariantOption = (variantIndex, optionIndex) => {
    const currentVariants = [...variantFields]
    const currentOptions = [...currentVariants[variantIndex].options]
    currentOptions.splice(optionIndex, 1)

    setValue(`variants.${variantIndex}.options`, currentOptions)
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

      // Convert numeric fields in dimensions
      if (data.dimensions) {
        if (data.dimensions.length) data.dimensions.length = Number.parseFloat(data.dimensions.length)
        if (data.dimensions.width) data.dimensions.width = Number.parseFloat(data.dimensions.width)
        if (data.dimensions.height) data.dimensions.height = Number.parseFloat(data.dimensions.height)
      }

      // Convert weight to number
      if (data.weight) data.weight = Number.parseFloat(data.weight)

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

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name", { required: "Product name is required" })} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
            </div>

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

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {watchTags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Input placeholder="Add tags (press Enter to add)" onKeyDown={handleTagInput} />
              <p className="text-xs text-muted-foreground">Press Enter to add a tag</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={6}
                {...register("description", { required: "Description is required" })}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-4 md:col-span-2">
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
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-2">
                <Input id="weight" type="number" step="0.01" min="0" {...register("weight")} />
                <Select onValueChange={(value) => setValue("weightUnit", value)} defaultValue={watch("weightUnit")}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dimensions</Label>
              <div className="grid grid-cols-4 gap-2">
                <Input placeholder="Length" type="number" step="0.01" min="0" {...register("dimensions.length")} />
                <Input placeholder="Width" type="number" step="0.01" min="0" {...register("dimensions.width")} />
                <Input placeholder="Height" type="number" step="0.01" min="0" {...register("dimensions.height")} />
                <Select
                  onValueChange={(value) => setValue("dimensions.unit", value)}
                  defaultValue={watch("dimensions.unit")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="ft">ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="warrantyInformation">Warranty Information</Label>
              <Textarea id="warrantyInformation" rows={3} {...register("warrantyInformation")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="shippingInformation">Shipping Information</Label>
              <Textarea id="shippingInformation" rows={3} {...register("shippingInformation")} />
            </div>
          </div>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Product Variants</h3>
              <Button type="button" onClick={addVariantType} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Variant Type
              </Button>
            </div>

            {variantFields.length === 0 && (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-muted-foreground">No variants added yet. Add a variant type like Size or Color.</p>
              </div>
            )}

            <Accordion type="multiple" className="space-y-4">
              {variantFields.map((variantField, variantIndex) => (
                <AccordionItem key={variantField.id} value={`variant-${variantIndex}`} className="border rounded-md">
                  <AccordionTrigger className="px-4">
                    <div className="flex items-center justify-between w-full">
                      <span>{watch(`variants.${variantIndex}.name`) || "New Variant Type"}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeVariant(variantIndex)
                        }}
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`variant-name-${variantIndex}`}>Variant Type Name</Label>
                        <Input
                          id={`variant-name-${variantIndex}`}
                          placeholder="e.g. Size, Color, Material"
                          {...register(`variants.${variantIndex}.name`, {
                            required: "Variant type name is required",
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Options</Label>
                          <Button
                            type="button"
                            onClick={() => addVariantOption(variantIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>

                        {(!watch(`variants.${variantIndex}.options`) ||
                          watch(`variants.${variantIndex}.options`).length === 0) && (
                          <div className="text-center py-4 border border-dashed rounded-md">
                            <p className="text-muted-foreground">
                              No options added yet. Add options like Small, Medium, Large.
                            </p>
                          </div>
                        )}

                        {watch(`variants.${variantIndex}.options`) &&
                          watch(`variants.${variantIndex}.options`).map((option, optionIndex) => (
                            <Card key={optionIndex} className="mb-2">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base">
                                    {watch(`variants.${variantIndex}.options.${optionIndex}.name`) || "New Option"}
                                  </CardTitle>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariantOption(variantIndex, optionIndex)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`option-name-${variantIndex}-${optionIndex}`}>Option Name</Label>
                                    <Input
                                      id={`option-name-${variantIndex}-${optionIndex}`}
                                      placeholder="e.g. Small, Red, Cotton"
                                      {...register(`variants.${variantIndex}.options.${optionIndex}.name`, {
                                        required: "Option name is required",
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`option-value-${variantIndex}-${optionIndex}`}>Option Value</Label>
                                    <Input
                                      id={`option-value-${variantIndex}-${optionIndex}`}
                                      placeholder="e.g. S, #FF0000, cotton"
                                      {...register(`variants.${variantIndex}.options.${optionIndex}.value`, {
                                        required: "Option value is required",
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`option-price-${variantIndex}-${optionIndex}`}>
                                      Additional Price
                                    </Label>
                                    <Input
                                      id={`option-price-${variantIndex}-${optionIndex}`}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      {...register(`variants.${variantIndex}.options.${optionIndex}.additionalPrice`, {
                                        valueAsNumber: true,
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`option-stock-${variantIndex}-${optionIndex}`}>Stock</Label>
                                    <Input
                                      id={`option-stock-${variantIndex}-${optionIndex}`}
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      {...register(`variants.${variantIndex}.options.${optionIndex}.stock`, {
                                        valueAsNumber: true,
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2 col-span-2">
                                    <Label htmlFor={`option-sku-${variantIndex}-${optionIndex}`}>SKU</Label>
                                    <Input
                                      id={`option-sku-${variantIndex}-${optionIndex}`}
                                      placeholder="SKU for this variant"
                                      {...register(`variants.${variantIndex}.options.${optionIndex}.sku`)}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <div className="space-y-2">
            <Label>Product Images</Label>
            <ImageUploader images={images} onChange={handleImagesChange} maxImages={10} />
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}

