import { Suspense } from "react";
import HeroSection from "@/components/home/hero-section";
import FlashSales from "@/components/home/flash-sales";
import {
  getRandomProducts,
  getBestSellers,
  getFeaturedProducts,
} from "@/lib/product-helpers";
import BrowseByCategory from "@/components/home/browse-category";
import BestSeller from "@/components/home/Best-selling";
import ProductShowcase from "@/components/home/Product-showcase";
import Featured from "@/components/home/Featured";
import FeaturedProduct from "@/components/home/Featured-Products";
import Offers from "@/components/about/Offers";

export default async function HomePage() {
  const flashSaleProducts = await getRandomProducts(12, true);
  const bestSellingProducts = await getBestSellers(10);
  const featuredProducts = await getFeaturedProducts(12);
  return (
    <main>
      <HeroSection />

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center">
            Loading flash sales...
          </div>
        }
      >
        <FlashSales products={flashSaleProducts} />
      </Suspense>
      <BrowseByCategory />
      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center">
            Loading best selling...
          </div>
        }
      >
        <BestSeller product={bestSellingProducts} />
      </Suspense>
      <ProductShowcase />
      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center">
            Loading featured products...
          </div>
        }
      >
        <FeaturedProduct product={featuredProducts} />
        <Featured />
      </Suspense>
      <Offers />
    </main>
  );
}
