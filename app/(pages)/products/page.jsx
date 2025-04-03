import ProductList from "@/components/products/product-list";
import ProductFilters from "@/components/products/product-filters";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata = {
  title: "Products | Exclusive",
  description: "Browse our exclusive collection of products",
};


export default async function ProductsPage() {
  // Breadcrumb items
  const breadcrumbItems = [{ label: "Products" }];

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilters />
          </div>

          <div className="w-full md:w-3/4">
              <ProductList />
          </div>
        </div>
      </div>
    </div>
  );
}
