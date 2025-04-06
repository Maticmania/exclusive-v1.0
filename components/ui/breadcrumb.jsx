import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }) {
  // Validate items prop
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
        </ol>
      </nav>
    );
  }

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
            ) : item.href ? (
              <Link href={item.href} className="ml-1 text-sm text-gray-500 hover:text-gray-700">
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-sm text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Other components remain unchanged
export function BreadcrumbList({ children }) {
  return <ol className="inline-flex items-center space-x-1 md:space-x-2">{children}</ol>;
}

export function BreadcrumbItem({ children }) {
  return <li className="inline-flex items-center">{children}</li>;
}

export function BreadcrumbLink({ href, children }) {
  return (
    <Link href={href} className="text-sm text-gray-500 hover:text-gray-700">
      {children}
    </Link>
  );
}

export function BreadcrumbPage({ children }) {
  return (
    <span className="ml-1 text-sm font-medium text-gray-700" aria-current="page">
      {children}
    </span>
  );
}

export function BreadcrumbSeparator() {
  return <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />;
}

export function BreadcrumbEllipsis() {
  return <span className="mx-2 text-gray-400">...</span>;
}