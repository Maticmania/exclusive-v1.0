import { Suspense } from "react"
import ProductList from "@/components/products/product-list"
import ProductFilters from "@/components/products/product-filters"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Search Results | Exclusive",
  description: "Search results for products in our exclusive collection",
}
export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  const entries = Object.entries(searchParams ?? {});
  const query = new URLSearchParams(entries).toString();

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products?${query}`;

  const response = await fetch(apiUrl, { next: { revalidate: 60 } });
  const { products, pagination } = await response.json();

  const { search } = await searchParams
  const searchQuery = search || "";

  const breadcrumbItems = [
    { label: "Search" },
    ...(searchQuery ? [{ label: `"${searchQuery}"` }] : []),
  ];

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">{searchQuery ? `Search Results for "${searchQuery}"` : "Search Results"}</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilters />
          </div>

          <div className="w-full md:w-3/4">
            <Suspense fallback={<div>Loading search results...</div>}>
              <ProductList initialProducts={products} initialPagination={pagination} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

