"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import ProductCard from "./product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debounce } from "lodash"
import Pagination from "./pagination";

export default function ProductList({ initialProducts = [], initialPagination = {} }) {
  const [products, setProducts] = useState(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Use a ref to store the last search params string to avoid unnecessary fetches
  const lastSearchParamsRef = useRef(searchParams.toString())

  // Get current page from URL or default to 1
  const currentPage = Number(searchParams.get("page") || 1)

  // Get current sort from URL or default to "newest"
  const currentSort = searchParams.get("sort") || "newest"

  // Function to create new search params
  const createQueryString = (name, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) {
      params.delete(name)
    } else {
      params.set(name, value)
    }
    return params.toString()
  }

  // Handle sort change
  const handleSortChange = (value) => {
    // Reset to page 1 when sorting changes
    const newParams = createQueryString("sort", value)
    const pageResetParams = new URLSearchParams(newParams)
    pageResetParams.set("page", "1")
    router.push(`${pathname}?${pageResetParams.toString()}`)
  }

  // Handle page change
  const handlePageChange = (page) => {
    router.push(`${pathname}?${createQueryString("page", page)}`)
  }

  // Debounced fetch function to prevent too many requests
  const debouncedFetch = useCallback(
    debounce(async (paramsString) => {
      try {
        setLoading(true)
        const apiUrl = `/api/products?${paramsString}`

        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`)
        }

        const data = await response.json()
        setProducts(data.products || [])
        setPagination(data.pagination || { total: 0, page: 1, limit: 12, pages: 1 })
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }, 300),
    [],
  )

  // Fetch products when search params change
  useEffect(() => {
    const currentParamsString = searchParams.toString()

    // Only fetch if the params have actually changed
    if (currentParamsString !== lastSearchParamsRef.current) {
      lastSearchParamsRef.current = currentParamsString
      debouncedFetch(currentParamsString)
    }
  }, [searchParams, debouncedFetch])

  // Render loading state
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  // Render empty state
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No products found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
        <Button
          onClick={() => {
            router.push(pathname)
          }}
        >
          Clear all filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Product count and sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-gray-500">
          Showing {products.length} of {pagination.total || 0} products
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm">Sort by:</span>
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
        />
      )}
    </div>
  )
}
