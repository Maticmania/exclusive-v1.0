import { Suspense } from "react"
import ProductList from "@/components/products/product-list"
import ProductFilters from "@/components/products/product-filters"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"

export const metadata = {
  title: "Products | Exclusive",
  description: "Browse our exclusive collection of products",
}

// Fetch products from the database
async function getProducts() {
  await connectToDatabase()

  const products = await Product.find().sort({ createdAt: -1 }).lean()

  // Convert MongoDB _id to string and properly serialize all objects
  return products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    category: product.category
      ? {
          _id: product.category._id.toString(),
          name: product.category.name || "Unknown Category",
        }
      : null,
    brand: product.brand
      ? {
          _id: product.brand._id.toString(),
          name: product.brand.name || "Unknown Brand",
        }
      : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }))
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilters />
          </div>

          <div className="w-full md:w-3/4">
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductList initialProducts={products} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

