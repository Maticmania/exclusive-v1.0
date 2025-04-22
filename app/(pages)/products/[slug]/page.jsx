import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductDetails from "@/components/products/product-details";
import RelatedProducts from "@/components/products/related-products";

// Helper function to get the full URL including the protocol
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

async function getProduct(slug) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch product: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function getRelatedProducts(categorySlug, currentProductSlug) {
  try {
    if (!categorySlug) return [];

    const baseUrl = getBaseUrl();
    // Note: Your current /api/products doesn't support 'exclude', so we'll fetch and filter client-side
    const res = await fetch(
      `${baseUrl}/api/products?category=${categorySlug}&limit=10`, // Get 5, filter to 4 after excluding current
      {
        next: { revalidate: 60 }, // Revalidate every minute
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch related products: ${res.statusText}`);
    }

    const data = await res.json();
    // Filter out the current product
    const related = (data.products || []).filter(
      (p) => p.slug !== currentProductSlug
    );
    return related.slice(0, 10); // Return up to 4 related products
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params; // Correct destructuring
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Exclusive",
      description: "The requested product could not be found",
    };
  }

  return {
    title: `${product.name} | Exclusive`,
    description: product.description || "View this exclusive product",
  };
}

export default async function ProductPage({ params }) {
  const { slug } = params; // Correct destructuring
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Use category slug from product for related products
  const categorySlug = product.category?.slug;
  console.log("Category slug:", categorySlug);

  const relatedProducts = await getRelatedProducts(categorySlug, slug);

  return (
    <div className="container max-w-screen-xl mx-auto px-[5%] md:px-0">
      <ProductDetails product={product} />

      <div className="mt-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
          <div className="h-8 w-3 bg-primary rounded"></div>
          <h2 className="text-2xl font-bold">Related Items</h2>
          </div>
          <a href={`/products?category=${categorySlug}&page=1`} className="hover:underline bg-primary p-2 px-4 rounded-lg text-white">
            See All
          </a>
        </div>
        <Suspense fallback={<div>Loading related products...</div>}>
          <RelatedProducts products={relatedProducts} />
        </Suspense>
      </div>
    </div>
  );
}