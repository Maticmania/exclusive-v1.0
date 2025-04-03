"use client"

import ProductCard from "./product-card"

export default function RelatedProducts({ products = [] }) {
  if (!products || products.length === 0) {
    return <div className="text-center py-10">No related products found</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

