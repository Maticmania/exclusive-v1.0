import { notFound } from "next/navigation"
import { Suspense } from "react"
import ProductDetails from "@/components/products/product-details"
import RelatedProducts from "@/components/products/related-products"

// Helper function to get the full URL including the protocol
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

async function getProduct(slug) {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`Failed to fetch product: ${res.statusText}`)
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

async function getRelatedProducts(categoryId, currentProductSlug) {
  try {
    if (!categoryId) return []

    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/products?category=${categoryId}&exclude=${currentProductSlug}&limit=4`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch related products: ${res.statusText}`)
    }

    const data = await res.json()
    return data.products || []
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug)

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

export default async function ProductPage({ params: { slug } }) {
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Get the category ID for related products
  const categoryId = product.category && typeof product.category === "object" ? product.category._id : product.category

  const relatedProducts = await getRelatedProducts(categoryId, slug)

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
    </div>
  )
}

