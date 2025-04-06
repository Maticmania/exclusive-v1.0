import { Suspense } from "react"
import ProductList from "@/components/products/product-list"
import ProductFilters from "@/components/products/product-filters"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Search Results | Exclusive",
  description: "Search results for products in our exclusive collection",
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

// Fetch products from API
async function getProducts(searchParams) {
  try {
    const apiUrl = buildApiUrl(searchParams)
    const response = await fetch(apiUrl, { next: { revalidate: 60 } }) // Cache for 60 seconds

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching products:", error)
    return { products: [], pagination: { total: 0, page: 1, limit: 12, pages: 0 } }
  }
}

export default async function SearchPage({ searchParams }) {
  const { products, pagination } = await getProducts(searchParams)
  const searchQuery = searchParams.search || ""

  // Construct breadcrumb items
  const breadcrumbItems = [
    { label: "Search" },
    ...(searchQuery ? [{ label: `"${searchQuery}"` }] : []),
  ]

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">{searchQuery ? `Search Results for "${searchQuery}"` : "Search Results"}</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilters />
          </div>

          <div className="w-full md:w-3/4">
            <Suspense fallback={<div>Loading search results...</div>}>
              <ProductList initialProducts={products} initialPagination={pagination} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

