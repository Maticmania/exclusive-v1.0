import { Suspense } from "react";
import ProductList from "@/components/products/product-list";
import ProductFilters from "@/components/products/product-filters";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product";

export const metadata = {
  title: "Products | Exclusive",
  description: "Browse our exclusive collection of products",
};

// Fetch products from the database
async function getProducts() {
  await connectToDatabase();

  const products = (await Product.find().sort({ createdAt: -1 }).lean()) || [];

  return products.map((product) => ({
    ...product,
    _id: product._id.toString(), // Ensure _id is a string
    category: product.category
      ? {
          _id: product.category._id.toString(),
          name: product.category.name || "Unknown Category",
        }
      : null,
    brand: product.brand
      ? {
          _id: product.brand._id.toString(),
          name: product.brand.name || "Unknown Brand",
        }
      : null,
    variants:
      product.variants?.map((variant) => ({
        ...variant,
        _id: variant._id.toString(),
      })) || [],
    dimensions: product.dimensions
      ? {
          length: product.dimensions.length,
          width: product.dimensions.width,
          height: product.dimensions.height,
          unit: product.dimensions.unit,
        }
      : null,
    isOnFlashSale: Boolean(product.isOnFlashSale),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

export default async function ProductsPage() {
  const products = (await getProducts()) || [];

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
            {products.length > 0 ? (
              <Suspense fallback={<div>Loading products...</div>}>
                <ProductList initialProducts={products} />
              </Suspense>
            ) : (
              <div className="text-center text-xl">No products found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
