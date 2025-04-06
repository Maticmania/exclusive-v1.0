import { Suspense } from "react"
import ProductList from "@/components/products/product-list"
import ProductFilters from "@/components/products/product-filters"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import Category from "@/models/category"
import Brand from "@/models/brand"

export const metadata = {
  title: "Products | Exclusive",
  description: "Browse our exclusive collection of products",
}

// Function to serialize MongoDB data
function serializeMongoData(data) {
  if (data === null || data === undefined) {
    return data
  }

  if (data instanceof Date) {
    return data.toISOString()
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeMongoData(item))
  }

  if (data && typeof data === "object" && data.constructor && data.constructor.name === "ObjectId") {
    return data.toString()
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const result = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "function") {
        result[key] = serializeMongoData(value)
      }
    }
    return result
  }

  return data
}

// Update the getProducts function to handle pagination and all filters
async function getProducts(searchParams) {
  await connectToDatabase()
  
  const { category, brand, brands, minPrice, maxPrice, featured, search, sort } = await searchParams 
  const query = {}
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 12
  const skip = (page - 1) * limit


  // Filter by category slug
  if (category) {
    // Find category by slug
    const category = await Category.findOne({ slug: category }).lean()
    if (category) {
      query.category = category._id
    }
  }

  // Filter by brand
  if (brand) {
    // Find brand by slug
    const brand = await Brand.findOne({ slug: brand }).lean()
    if (brand) {
      query.brand = brand._id
    }
  } else if (brands) {
    const brandSlugs = brands.split(",")
    if (brandSlugs.length > 0) {
      const brands = await Brand.find({ slug: { $in: brandSlugs } }).lean()
      if (brands.length > 0) {
        query.brand = { $in: brands.map((b) => b._id) }
      }
    }
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) {
      query.price.$gte = Number.parseFloat(minPrice)
    }
    if (maxPrice) {
      query.price.$lte = Number.parseFloat(maxPrice)
    }
  }

  // Featured products
  if (featured === "true") {
    query.featured = true
  }

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      {tags: { $regex: search, $options: "i" } }
    ]
  }

  // Only show published products
  // query.isPublished = true

  // Sort options
  let sortOptions = { createdAt: -1 }
  if (sort) {
    switch (sort) {
      case "price-asc":
        sortOptions = { price: 1 }
        break
      case "price-desc":
        sortOptions = { price: -1 }
        break
      case "name-asc":
        sortOptions = { name: 1 }
        break
      case "name-desc":
        sortOptions = { name: -1 }
        break
    }
  }

  // Get total count for pagination
  const total = await Product.countDocuments(query)

  // Get products with pagination
  const products = await Product.find(query)
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean()

  // Prepare pagination data
  const pagination = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  }

  return {
    products: serializeMongoData(products),
    pagination,
  }
}

export default async function ProductsPage({ searchParams }) {
  const { products, pagination } = await getProducts(searchParams)

  // Construct breadcrumb items
  const breadcrumbItems = [{ label: "Products" }]
  const {category} =  await searchParams
  if (category) {
    breadcrumbItems.push({ label: category.replace(/-/g, " ") })
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilters />
          </div>

          <div className="w-full md:w-3/4">
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductList initialProducts={products} initialPagination={pagination} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

