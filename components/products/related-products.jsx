"use client"

import { useRef } from "react"
import ProductCard from "./product-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function RelatedProducts({ products = [] }) {
  const scrollContainerRef = useRef(null)

  if (!products || products.length === 0) {
    return <div className="text-center py-10 text-gray-500">No related products found</div>
  }

  // Scroll left/right by a fixed amount (e.g., 300px)
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  return (
    <div className="relative py-6">
      {/* <div className="flex items-center justify-end mb-4">
            {products.length > 3 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              className="rounded-full shadow-sm hover:bg-gray-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              className="rounded-full shadow-sm hover:bg-gray-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div> */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="flex-shrink-0 w-[280px] sm:w-[250px] md:w-[220px] snap-start mx-2"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}