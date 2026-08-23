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
      <div
        ref={scrollContainerRef}
        className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="flex-shrink-0 w-[45%] sm:w-[30%] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}