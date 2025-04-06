"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Truck, RotateCcw, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import AddToWishlistButton from "@/components/products/add-to-wishlist-button"
import BuyNowButton from "./buy-now-button"

export default function ProductDetails({ product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)

  // Get color variants if they exist
  const colorVariant = product.variants?.find(
    (v) => v.name.toLowerCase() === "color" || v.name.toLowerCase() === "colours",
  )

  // Get size variants if they exist
  const sizeVariant = product.variants?.find((v) => v.name.toLowerCase() === "size" || v.name.toLowerCase() === "sizes")

  // Default colors if no color variants
  const defaultColors = []

  // Default sizes if no size variants
  const defaultSizes = []

  // Use variant colors or default colors
  const colors = colorVariant?.options || defaultColors

  // Use variant sizes or default sizes
  const sizes = sizeVariant?.options?.map((o) => o.name) || defaultSizes

  // Handle quantity changes
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // Get breadcrumb path
  const breadcrumbPath = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ]

  if (product.category) {
    breadcrumbPath.push({
      name: product.category.name,
      href: `/products?category=${product.category.slug || ""}`,
    })
  }

  breadcrumbPath.push({ name: product.name, href: "#" })

  return (
    <div className="w-full px-[5%] grid gap-10 min-h-[500px] py-10 font-inter">
      {/* Breadcrumb */}
      <p className="font-poppins text-base md:text-lg text-gray-500">
        {breadcrumbPath.map((item, index) => (
          <span key={index}>
            {index > 0 && " / "}
            {index === breadcrumbPath.length - 1 ? (
              item.name
            ) : (
              <Link href={item.href} className="hover:text-primary">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4 md:flex lg:flex-col md:space-y-0 xl:space-y-0 xl:flex xl:flex-row-reverse flex-row-reverse gap-4">
          <div className="aspect-square md:w-[85%] lg:w-full bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-row md:flex-col gap-4 overflow-y-auto md:max-h-[400px] scrollbar-none">
  {product.images.slice(0, 5).map((image, i) => (
    <div
      key={i}
      className={`w-[100px] lg:w-auto h-[100px] bg-gray-100 rounded-lg overflow-hidden cursor-pointer ${
        selectedImage === i ? "border-2 border-primary" : ""
      }`}
      onClick={() => setSelectedImage(i)}
    >
      <Image
        src={image || "/placeholder.svg?height=150&width=150"}
        alt={`${product.name} - Image ${i + 1}`}
        width={100}
        height={100}
        className="w-[100px] h-[100px] object-contain"
      />
    </div>
  ))}
</div>

        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold font-inter">{product.name}</h1>

          <div className="flex items-center space-x-2 font-poppins">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(product.rating || 4) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-gray-500">({product.reviewCount || 150} Reviews) </span>
            <span>|</span>
            <span className="text-green-500">{product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}</span>
          </div>

          <p className="text-2xl font-bold font-poppins">
            {formatCurrency(product.price)}
            {product.compareAtPrice && (
              <span className="text-lg line-through text-gray-500 ml-2">{formatCurrency(product.compareAtPrice)}</span>
            )}
          </p>

          <p className="text-gray-600 font-poppins text-sm">{product.description}</p>

          {/* Only show variants when they exist */}
          {(colors.length > 0 || sizes.length > 0) && (
            <div className="space-y-4 border-t pt-4">
              {/* Color options */}
              {colors.length > 0 && (
                <div className="flex items-center gap-2">
                  <p className="font-semibold font-poppins">Colours:</p>
                  <div className="flex space-x-2">
                    {colors.map((color, i) => (
                      <button
                        key={i}
                        className={`w-5 h-5 rounded-full border ${
                          selectedColor === i ? "ring-2 ring-offset-2 ring-primary" : ""
                        }`}
                        style={{
                          backgroundColor: color.value.startsWith("#") ? color.value : color.value,
                        }}
                        onClick={() => setSelectedColor(i)}
                        aria-label={`Select ${color.name} color`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size options */}
              {sizes.length > 0 && (
                <div className="flex items-center gap-2 font-poppins">
                  <p className="font-semibold">Size:</p>
                  <div className="flex space-x-2">
                    {sizes.map((size, i) => (
                      <button
                        key={size}
                        className={`px-3 py-1 border rounded-md hover:bg-primary hover:text-white ${
                          selectedSize === i ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => setSelectedSize(i)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4 ">
            <div className="flex items-center border rounded-md">
              <button className="px-3 py-1 text-xl" onClick={decreaseQuantity} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-xl border-x">{quantity}</span>
              <button className="px-3 py-1 text-xl" onClick={increaseQuantity} disabled={quantity >= product.stock}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="w-full">
            <BuyNowButton className={"w-full"} product={product} quantity={quantity} />
            </div>

            <AddToWishlistButton product={product} className="sm:w-auto" />
          </div>

          <div className="mt-4 rounded border">
            <div className="flex items-center gap-3 text-sm border p-4">
              <Truck className="w-5 h-5" />
              <div>
                <p className="font-medium">Free Delivery</p>
                <p className="text-gray-500">Enter your postal code for Delivery Availability</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm border p-4">
              <RotateCcw className="w-5 h-5" />
              <div>
                <p className="font-medium">Return Delivery</p>
                <p className="text-gray-500">
                  Free 30 Days Delivery Returns.{" "}
                  <Link href="/" className="underline hover:font-medium">
                    Details
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

