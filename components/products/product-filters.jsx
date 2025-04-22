"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Cache for categories and brands
let categoriesCache = null
let brandsCache = null

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isInitialMount = useRef(true)
  const lastAppliedFilters = useRef({
    categories: [],
    brands: [],
    priceRange: [0, 10000],
  })

  // Get current filter values from URL
  const currentCategory = searchParams.get("category")
  const currentBrands = searchParams.get("brands")?.split(",").filter(Boolean) || []
  const minPrice = Number(searchParams.get("minPrice") || 0)
  const maxPrice = Number(searchParams.get("maxPrice") || 10000)

  // Local state for filters and fetched data
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
  const [selectedCategories, setSelectedCategories] = useState(currentCategory ? [currentCategory] : [])
  const [selectedBrands, setSelectedBrands] = useState(currentBrands)
  const [categories, setCategories] = useState(categoriesCache || [])
  const [brands, setBrands] = useState(brandsCache || [])
  const [loading, setLoading] = useState(!categoriesCache || !brandsCache)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("categories")
  const [applyingFilters, setApplyingFilters] = useState(false)

  // Count active filters for mobile badge
  const activeFilterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    selectedBrands.length +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0)

  // Fetch categories and brands only once and cache them
  useEffect(() => {
    // Skip fetching if we already have cached data
    if (categoriesCache && brandsCache) {
      setCategories(categoriesCache)
      setBrands(brandsCache)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Use Promise.all to fetch both in parallel
        const [catResponse, brandResponse] = await Promise.all([
          fetch("/api/admin/categories", {
            cache: "force-cache",
            next: { revalidate: 3600 }, // Cache for 1 hour
          }),
          fetch("/api/admin/brands", {
            cache: "force-cache",
            next: { revalidate: 3600 },
          }),
        ])

        if (!catResponse.ok) throw new Error("Failed to fetch categories")
        if (!brandResponse.ok) throw new Error("Failed to fetch brands")

        const [catData, brandData] = await Promise.all([catResponse.json(), brandResponse.json()])

        // Process and normalize the data
        const processedCategories = Array.isArray(catData) ? catData : catData.categories || catData.data || []

        const processedBrands = Array.isArray(brandData) ? brandData : brandData.brands || brandData.data || []

        // Update the cache
        categoriesCache = processedCategories
        brandsCache = processedBrands

        // Update state
        setCategories(processedCategories)
        setBrands(processedBrands)
      } catch (err) {
        console.error("Error fetching filters:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sync state with URL changes, but only when URL changes from external sources
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only update if we're not currently applying filters
    if (!applyingFilters) {
      const newPriceRange = [Number(searchParams.get("minPrice") || 0), Number(searchParams.get("maxPrice") || 10000)]
      const newCategories = currentCategory ? [currentCategory] : []

      // Use functional updates to avoid stale state issues
      setPriceRange((prev) => (JSON.stringify(prev) !== JSON.stringify(newPriceRange) ? newPriceRange : prev))

      setSelectedCategories((prev) => (JSON.stringify(prev) !== JSON.stringify(newCategories) ? newCategories : prev))

      setSelectedBrands((prev) => (JSON.stringify(prev) !== JSON.stringify(currentBrands) ? currentBrands : prev))
    }
  }, [searchParams, currentCategory, currentBrands, applyingFilters])

  // Apply filters to URL with debounce
  const applyFilters = (categories = selectedCategories, brands = selectedBrands, range = priceRange) => {
    // Prevent duplicate filter applications
    if (
      JSON.stringify(categories) === JSON.stringify(lastAppliedFilters.current.categories) &&
      JSON.stringify(brands) === JSON.stringify(lastAppliedFilters.current.brands) &&
      JSON.stringify(range) === JSON.stringify(lastAppliedFilters.current.priceRange) &&
      !isInitialMount.current
    ) {
      return
    }

    // Update last applied filters
    lastAppliedFilters.current = {
      categories,
      brands,
      priceRange: range,
    }

    // Prevent multiple rapid filter applications
    if (applyingFilters) return
    setApplyingFilters(true)

    // Build the query params
    const params = new URLSearchParams(searchParams.toString())

    // Handle category (only one at a time for now)
    if (categories.length > 0) {
      params.set("category", categories[0])
    } else {
      params.delete("category")
    }

    // Handle brands
    if (brands.length > 0) {
      params.set("brands", brands.join(","))
    } else {
      params.delete("brands")
    }

    // Handle price range
    if (range[0] > 0) {
      params.set("minPrice", range[0].toString())
    } else {
      params.delete("minPrice")
    }

    if (range[1] < 10000) {
      params.set("maxPrice", range[1].toString())
    } else {
      params.delete("maxPrice")
    }

    // Reset to page 1 when filters change
    params.set("page", "1")

    // Update URL
    router.push(`/products?${params.toString()}`, { scroll: false })
    setIsOpen(false)

    // Allow new filter applications after a delay
    setTimeout(() => {
      setApplyingFilters(false)
    }, 300)
  }

  // Handle category selection
  const handleCategoryChange = (slug) => {
    // For now, we only support one category at a time
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(slug) ? [] : [slug]
      return JSON.stringify(prev) !== JSON.stringify(newCategories) ? newCategories : prev
    })
  }

  // Handle brand selection
  const handleBrandChange = (slug) => {
    setSelectedBrands((prev) => {
      const newBrands = prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
      return JSON.stringify(prev) !== JSON.stringify(newBrands) ? newBrands : prev
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([0, 10000])

    // Update last applied filters
    lastAppliedFilters.current = {
      categories: [],
      brands: [],
      priceRange: [0, 10000],
    }

    router.push("/products", { scroll: false })
    setIsOpen(false)
  }

  // Skeleton loading component
  const SkeletonFilterItem = () => (
    <div className="flex items-center space-x-2 animate-pulse">
      <div className="w-5 h-5 bg-gray-200 rounded" />
      <div className="w-32 h-4 bg-gray-200 rounded" />
    </div>
  )

  if (error) {
    return <div className="p-4 text-red-500">Error loading filters: {error}</div>
  }

  const DesktopFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm hidden md:block">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            {loading ? (
              <div className="space-y-4 py-2 animate-pulse">
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="flex justify-between">
                  <div className="w-12 h-4 bg-gray-200 rounded" />
                  <div className="w-12 h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <Slider
                  value={priceRange}
                  min={0}
                  max={10000}
                  step={10}
                  onValueChange={setPriceRange}
                  onValueCommit={() => applyFilters(selectedCategories, selectedBrands, priceRange)}
                />
                <div className="flex items-center justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => <SkeletonFilterItem key={i} />)
                : categories.map((category) => (
                    <div key={category._id || category.id || category.slug} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.slug}`}
                        checked={selectedCategories.includes(category.slug)}
                        onCheckedChange={() => {
                          handleCategoryChange(category.slug)
                          applyFilters(
                            selectedCategories.includes(category.slug) ? [] : [category.slug],
                            selectedBrands,
                            priceRange,
                          )
                        }}
                      />
                      <Label htmlFor={`category-${category.slug}`} className="text-sm font-normal cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => <SkeletonFilterItem key={i} />)
                : brands.map((brand) => (
                    <div key={brand._id || brand.id || brand.slug} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand.slug}`}
                        checked={selectedBrands.includes(brand.slug)}
                        onCheckedChange={() => {
                          const newBrands = selectedBrands.includes(brand.slug)
                            ? selectedBrands.filter((b) => b !== brand.slug)
                            : [...selectedBrands, brand.slug]
                          handleBrandChange(brand.slug)
                          applyFilters(selectedCategories, newBrands, priceRange)
                        }}
                      />
                      <Label htmlFor={`brand-${brand.slug}`} className="text-sm font-normal cursor-pointer">
                        {brand.name}
                      </Label>
                    </div>
                  ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  return (
    <>
      <DesktopFilters />
      <div className="md:hidden px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-between py-2">
              <span className="flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-0 h-[80vh] flex flex-col overflow-hidden">
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle className="flex justify-between items-center">
                <span className="text-lg font-semibold">Filters</span>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm hover:text-destructive">
                    Clear All
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-3 px-4 bg-gray-50">
                <TabsTrigger value="categories" className="flex items-center justify-center py-2">
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="brands" className="flex items-center justify-center py-2">
                  Brands
                  {selectedBrands.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedBrands.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="price" className="flex items-center justify-center py-2">
                  Price
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <Badge variant="secondary" className="ml-1">
                      1
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="grow overflow-y-auto px-4 py-4">
                <TabsContent value="categories" className="mt-0 min-h-[200px]">
                  <div className="space-y-3">
                    {loading
                      ? Array(8)
                          .fill(0)
                          .map((_, i) => <SkeletonFilterItem key={i} />)
                      : categories.map((category) => (
                          <div
                            key={category._id || category.id || category.slug}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-category-${category.slug}`}
                              checked={selectedCategories.includes(category.slug)}
                              onCheckedChange={() => handleCategoryChange(category.slug)}
                            />
                            <Label
                              htmlFor={`mobile-category-${category.slug}`}
                              className="text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                  </div>
                </TabsContent>

                <TabsContent value="brands" className="mt-0 min-h-[200px]">
                  <div className="space-y-3">
                    {loading
                      ? Array(8)
                          .fill(0)
                          .map((_, i) => <SkeletonFilterItem key={i} />)
                      : brands.map((brand) => (
                          <div key={brand._id || brand.id || brand.slug} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-brand-${brand.slug}`}
                              checked={selectedBrands.includes(brand.slug)}
                              onCheckedChange={() => handleBrandChange(brand.slug)}
                            />
                            <Label
                              htmlFor={`mobile-brand-${brand.slug}`}
                              className="text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                            >
                              {brand.name}
                            </Label>
                          </div>
                        ))}
                  </div>
                </TabsContent>

                <TabsContent value="price" className="mt-0 min-h-[200px]">
                  <div className="space-y-4 py-2">
                    <Slider value={priceRange} min={0} max={10000} step={10} onValueChange={setPriceRange} />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>

              <div className="px-4 py-4 border-t bg-white">
                <div className="flex gap-2">
                  <Button
                    onClick={() => applyFilters(selectedCategories, selectedBrands, priceRange)}
                    className="flex-1"
                    disabled={applyingFilters}
                  >
                    {applyingFilters ? "Applying..." : "Apply Filters"}
                  </Button>
                  <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
