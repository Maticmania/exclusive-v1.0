import { Suspense } from "react";
import { Button } from "../ui/button";
import RelatedProducts from "../products/related-products";

export default async function BestSeller({ product }) {
  return (
    <main className="px-[5%] py-5">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-3 bg-primary rounded"></div>
            <h2 className="text-xl font-bold text-primary">Just For You</h2>
          </div>
          <Button>View All</Button>
        </div>
            <h2 className="text-2xl font-bold">Best Selling Products</h2>
        <Suspense fallback={<div>Loading products...</div>}>
          <RelatedProducts products={product} />
        </Suspense>
      </div>
    </main>
  );
}
