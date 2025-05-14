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

export const metadata = {
  title: "Shop All Products | Exclusive",
  keywords: [
    "e-commerce",
    "online shopping",
    "exclusive deals",
    "best prices",
    "quality products",
    "electronics",
    "fashion",
    "home goods",
  ],
  description: "Browse a wide selection of quality products at the best prices.",
  openGraph: {
    title: "Shop All Products | Exclusive",
    description: "Wide selection of electronics, fashion, and more.",
    url: "https://exclusive-v1-0.onrender.com/",
    siteName: "Exclusive",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://i.ibb.co/mCX1G1B4/Macbook-Air-exclusive-v1-0-onrender-com.png", // Host an OG image
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

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
