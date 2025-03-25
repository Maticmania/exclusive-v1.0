import { notFound } from "next/navigation"
import { Suspense } from "react"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import ProductDetails from "@/components/products/product-details"
import RelatedProducts from "@/components/products/related-products"

// Helper function to serialize MongoDB documents and handle ObjectIds
function serializeMongoData(data) {
  if (data === null || data === undefined) {
    return data
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString()
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeMongoData(item))
  }

  // Handle ObjectId (direct check)
  if (data && typeof data === "object" && data.constructor && data.constructor.name === "ObjectId") {
    return data.toString()
  }

  // Handle plain objects (including those with ObjectId properties)
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const result = {}
    for (const [key, value] of Object.entries(data)) {
      // Skip functions
      if (typeof value !== "function") {
        result[key] = serializeMongoData(value)
      }
    }
    return result
  }

  // Return primitive values as is
  return data
}

async function getProduct(productId) {
  try {
    await connectToDatabase()

    // Find the product by ID
    const product = await Product.findById(productId)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .lean()

    if (!product) {
      return null
    }

    // Serialize the product to handle ObjectIds
    return serializeMongoData(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

async function getRelatedProducts(categoryId, currentProductId) {
  try {
    if (!categoryId) return []

    await connectToDatabase()

    const products = await Product.find({
      category: categoryId,
      _id: { $ne: currentProductId },
    })
      .limit(4)
      .lean()

    // Serialize the products to handle ObjectIds
    return serializeMongoData(products)
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
  }
}

export async function generateMetadata({ params: { productId } }) {
  const product = await getProduct(productId)

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

export default async function ProductPage({ params: { productId } }) {
  const product = await getProduct(productId)

  if (!product) {
    notFound()
  }

  // Get the category ID for related products
  const categoryId = product.category && typeof product.category === "object" ? product.category._id : product.category

  const relatedProducts = await getRelatedProducts(categoryId, productId)

  return (
    <div className="container max-w-screen-xl mx-auto">
      <ProductDetails product={product} />

      <div className="mt-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Related Items</h2>
          <a href="/products" className="text-primary hover:underline">
            See All
          </a>
        </div>
        <Suspense fallback={<div>Loading related products...</div>}>
          <RelatedProducts products={relatedProducts} />
        </Suspense>
      </div>

      <div className="mt-20 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recently Viewed</h2>
        </div>
        <Suspense fallback={<div>Loading products...</div>}>
          <RelatedProducts products={relatedProducts.slice(0, 2)} />
        </Suspense>
      </div>
    </div>
  )
}

