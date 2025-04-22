"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useSwipeable } from "react-swipeable";
import { formatCurrency, cn } from "@/lib/utils";
import AddToWishlistButton from "@/components/products/add-to-wishlist-button";
import BuyNowButton from "./buy-now-button";
import { ProductImage } from "./product-image";

export default function ProductDetails({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Get color variants
  const colorVariant = product.variants?.find(
    (v) =>
      v.name.toLowerCase() === "color" || v.name.toLowerCase() === "colours"
  );

  // Get size variants
  const sizeVariant = product.variants?.find(
    (v) => v.name.toLowerCase() === "size" || v.name.toLowerCase() === "sizes"
  );

  // Default colors/sizes
  const colors = colorVariant?.options || [];
  const sizes = sizeVariant?.options?.map((o) => o.name) || [];

  // Handle quantity changes
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Image navigation
  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePrevImage,
    trackMouse: true, // Allow mouse drag for desktop
  });

  // Breadcrumb path
  const breadcrumbPath = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ];

  if (product.category) {
    breadcrumbPath.push({
      name: product.category.name,
      href: `/products?category=${product.category.slug || ""}`,
    });
  }

  breadcrumbPath.push({ name: product.name, href: "#" });

  return (
    <div className="w-full grid gap-6 py-8 font-inter">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 font-poppins">
        {breadcrumbPath.map((item, index) => (
          <span key={index}>
            {index > 0 && " / "}
            {index === breadcrumbPath.length - 1 ? (
              <span className="text-gray-700">{item.name}</span>
            ) : (
              <Link href={item.href} className="hover:text-primary">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product Images */}
        <div className="flex flex-col md:flex-row-reverse gap-4">
          {/* Main image */}
          <div
            className="aspect-square bg-white rounded-lg shadow-md overflow-hidden cursor-pointer relative"
            onClick={() => setIsPreviewOpen(true)}
          >
             <Image
              src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-contain transition-transform duration-200 hover:scale-105"
              priority
            />
          </div>

          {/* Thumbnails */}
          <div className="flex md:flex-col gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 ">
            {product.images.slice(0, 5).map((image, i) => {
              const isLastVisible = i === 4 && product.images.length > 5;
              return (
                <button
                  key={i}
                  className={cn(
                    "relative flex-shrink-0 w-16 md:w-20 h-20 bg-white rounded-md shadow-sm overflow-hidden",
                    selectedImage === i ? "border border-primary" : ""
                  )}
                  onClick={() => setSelectedImage(i)}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name} - Image ${i + 1}`}
                    width={80}
                    height={80}
                  />
                  {isLastVisible && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold text-sm">
                      +{product.images.length - 5}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-inter">
            {product.name}
          </h1>

          <div className="flex items-center space-x-2 font-poppins">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < Math.round(product.rating || 4)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-gray-500">
              ({product.reviewCount || 150} Reviews)
            </span>
            <span>|</span>
            <span
              className={product.stock > 0 ? "text-green-500" : "text-red-500"}
            >
              {product.stock > 0
                ? `In stock (${product.stock})`
                : "Out of stock"}
            </span>
          </div>

          <p className="text-xl sm:text-2xl font-bold font-poppins">
            {formatCurrency(product.price)}
            {product.compareAtPrice && (
              <span className="text-base sm:text-lg line-through text-gray-500 ml-2">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </p>

          <p className="text-gray-600 font-poppins text-sm sm:text-base">
            {product.description}
          </p>

          {/* Variants */}
          {(colors.length > 0 || sizes.length > 0) && (
            <div className="space-y-4 border-t pt-4">
              {colors.length > 0 && (
                <div className="flex items-center gap-3">
                  <p className="font-semibold font-poppins text-sm">Colours:</p>
                  <div className="flex space-x-2">
                    {colors.map((color, i) => (
                      <button
                        key={i}
                        className={cn(
                          "w-6 h-6 rounded-full border",
                          selectedColor === i
                            ? "ring-2 ring-offset-2 ring-primary"
                            : ""
                        )}
                        style={{
                          backgroundColor: color.value.startsWith("#")
                            ? color.value
                            : color.value,
                        }}
                        onClick={() => setSelectedColor(i)}
                        aria-label={`Select ${color.name} color`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="flex items-center gap-3 font-poppins">
                  <p className="font-semibold text-sm">Size:</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, i) => (
                      <button
                        key={size}
                        className={cn(
                          "px-3 py-1 border rounded-md text-sm",
                          selectedSize === i
                            ? "bg-primary text-white"
                            : "hover:bg-primary/10"
                        )}
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

          {/* Quantity and Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 text-base font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <BuyNowButton
              className="w-full sm:w-auto flex-1"
              product={product}
              quantity={quantity}
            />
            <AddToWishlistButton product={product} className="sm:w-auto" />
          </div>

          {/* Delivery Info */}
          <div className="mt-4 rounded border bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm p-4 border-b">
              <Truck className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Free Delivery</p>
                <p className="text-gray-500">
                  Enter your postal code for Delivery Availability
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm p-4">
              <RotateCcw className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Return Delivery</p>
                <p className="text-gray-500">
                  Free 30 Days Delivery Returns.{" "}
                  <Link href="/" className="underline hover:text-primary">
                    Details
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent
          className="max-w-[90vw] sm:max-w-3xl p-0 bg-transparent border-none"
          {...swipeHandlers}
        >
          {/* <DialogClose className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 text-white hover:bg-black/70 rounded-full"
              aria-label="Close preview"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogClose> */}
          <div className="relative w-full h-[60vh] sm:h-[80vh] bg-white rounded-lg overflow-hidden">
            <Image
              src={
                product.images[selectedImage] ||
                "/placeholder.svg?height=800&width=800"
              }
              alt={`${product.name} - Image ${selectedImage + 1}`}
              fill
              className="object-contain"
              priority
            />
            {product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        selectedImage === i ? "bg-white" : "bg-white/50"
                      )}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
