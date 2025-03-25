"use client"

import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Star } from "lucide-react"

export default function RelatedProducts({ products }) {
  if (!products || products.length === 0) {
    return <p>No related products found.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product._id}
          href={`/products/${product._id}`}
          className="group block overflow-hidden rounded-lg border hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{product.discountPercentage}%
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium line-clamp-1">{product.name}</h3>
            <div className="flex items-center mt-1">
              <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
              {product.compareAtPrice && (
                <p className="ml-2 text-sm text-gray-500 line-through">{formatCurrency(product.compareAtPrice)}</p>
              )}
            </div>
            <div className="flex items-center mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(product.rating || 4) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="ml-1 text-xs text-gray-500">({product.reviewCount || 75})</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

