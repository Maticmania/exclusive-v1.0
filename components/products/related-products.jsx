"use client"

import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

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
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="p-4">
            <h3 className="font-medium line-clamp-1">{product.name}</h3>
            <p className="mt-1 text-primary font-bold">{formatCurrency(product.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

