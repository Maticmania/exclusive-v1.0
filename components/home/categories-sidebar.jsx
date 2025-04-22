import Link from "next/link"
import { ChevronRight } from "lucide-react"

const categories = [
  { name: "Woman's Fashion", slug: "womens", subcategories: ["Clothing", "Shoes", "Accessories", "Jewelry"] },
  { name: "Men's Fashion", slug: "mens-fashion", subcategories: ["Clothing", "Shoes", "Accessories", "Watches"] },
  { name: "Electronics", slug: "electronics", subcategories: [] },
  { name: "Home & Lifestyle", slug: "home-and-lifestyle", subcategories: [] },
  { name: "Medicine", slug: "medicine", subcategories: [] },
  { name: "sports accessories", slug: "sports-accessories", subcategories: [] },
  { name: "Baby's & Toys", slug: "baby-and-toys", subcategories: [] },
  { name: "Groceries & Pets", slug: "groceries-and-pets", subcategories: [] },
]

export default function CategoriesSidebar() {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <ul className="divide-y">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/products?category=${category.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm">{category.name}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

