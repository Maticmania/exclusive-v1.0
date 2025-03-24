import { notFound } from "next/navigation"
import Image from "next/image"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import { formatCurrency } from "@/lib/utils"
import AddToCartButton from "@/components/products/add-to-cart-button"
import AddToWishlistButton from "@/components/products/add-to-wishlist-button"
import RelatedProducts from "@/components/products/related-products"

export async function generateMetadata({ params }) {
  const product = await getProduct(params?.productId)

  if (!product) {
    return {
      title: "Product Not Found | Exclusive",
      description: "The requested product could not be found",
    }
  }

  return {
    title: `${product.name} | Exclusive`,
    description: product.description,
  }
}

async function getProduct(productId) {
  try {
    await connectToDatabase()

    const product = await Product.findById(productId).lean()

    if (!product) {
      return null
    }

    return {
      ...product,
      _id: product._id.toString(),
      category: product.category,
        // ? typeof product.category === "object"
        //   ? { _id: product.category._id.toString(), name: product.category.name }
        //   : product.category.toString()
        // : null,
      brand: product.brand
        ? typeof product.brand === "object"
          ? { _id: product.brand._id.toString(), name: product.brand.name }
          : product.brand.toString()
        : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

async function getRelatedProducts(categoryId, currentProductId) {
  try {
    await connectToDatabase()

    const products = await Product.find({
      category: categoryId,
      _id: { $ne: currentProductId },
    })
      .limit(4)
      .lean()

    return products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      category: product.category
        ? typeof product.category === "object"
          ? { _id: product.category._id.toString(), name: product.category.name }
          : product.category.toString()
        : null,
      brand: product.brand
        ? typeof product.brand === "object"
          ? { _id: product.brand._id.toString(), name: product.brand.name }
          : product.brand.toString()
        : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params?.productId)

  if (!product) {
    notFound()
  }

  // Get the category ID for related products
  const categoryId = product.category && typeof product.category === "object" ? product.category._id : product.category

  const relatedProducts = await getRelatedProducts(categoryId, params?.productId)
console.log(product);

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-bold mt-2 text-primary">{formatCurrency(product.price)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-sm">
              <span className="font-medium">Category:</span>{" "}
              { product.category.name }
            </p>
            <p className="text-sm">
              <span className="font-medium">Availability:</span>{" "}
              {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </p>
          </div>

          <div className="flex gap-4">
            <AddToCartButton product={product} />
            <AddToWishlistButton productId={product._id} />
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-4">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              {/* Add more detailed description here */}
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="py-4">
            <div className="prose max-w-none">
              <p>Product specifications would go here.</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-4">
            <div className="prose max-w-none">
              <p>Product reviews would go here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <Suspense fallback={<div>Loading related products...</div>}>
          <RelatedProducts products={relatedProducts} />
        </Suspense>
      </div>
    </div>
  )
}

