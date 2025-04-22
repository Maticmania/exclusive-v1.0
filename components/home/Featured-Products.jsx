import { Suspense } from "react";
import { Button } from "../ui/button";
import ProductCard from "../products/product-card";

export default async function FeaturedProduct({ product }) {
  return (
    <div className="px-[5%] py-5">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-3 bg-primary rounded"></div>
            <h2 className="text-2xl font-bold text-primary">Our Products</h2>
          </div>
        </div>
        <Suspense fallback={<div>Loading products...</div>}>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {product.map((item, index) => (
              <ProductCard product={item} key={index} />
            ))}
          </div>
        </Suspense>
        <div className="flex justify-center mt-6">
          <Button className="bg-primary text-white hover:bg-primary-foreground font-medium py-4 px-8 rounded">
            View All Products
          </Button>
        </div>
      </div>
    </div>
  );
}
