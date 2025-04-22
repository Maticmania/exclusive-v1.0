import { Suspense } from "react"
import ProductList from "@/components/products/product-list"
import ProductFilters from "@/components/products/product-filters"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Products | Exclusive",
  description: "Browse our exclusive collection of products",
}

// Function to build API URL with search params
function buildApiUrl(searchParams) {
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`
  const url = new URL(baseUrl, "http://localhost:3000")

  // Add all search params to the URL
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value)
    }
  })

  return url.toString()
}

// Fetch products from API with caching
async function getProducts(searchParams) {
  try {
    const apiUrl = buildApiUrl(searchParams)

    // Use Next.js cache with revalidation
    const response = await fetch(apiUrl, {
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching products:", error)
    return { products: [], pagination: { total: 0, page: 1, limit: 12, pages: 0 } }
  }
}

export default async function ProductsPage({ searchParams }) {
  const { products, pagination } = await getProducts(searchParams)

  // Construct breadcrumb items
  const breadcrumbItems = [{ label: "Products" }]

  if (searchParams.category) {
    breadcrumbItems.push({ label: searchParams.category.replace(/-/g, " ") })
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6 capitalize">
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
