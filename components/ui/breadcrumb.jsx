import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function Breadcrumb({ items }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Home
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {index === items.length - 1 ? (
              <span className="ml-1 text-sm font-medium text-gray-700" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="ml-1 text-sm text-gray-500 hover:text-gray-700">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

