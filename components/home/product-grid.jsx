import React from "react";
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";

const ProductGrid = ({
  leftText = "Just For You",
  rightText,
  children,
  className = "text-black",
  viewAll,
  products = [],
}) => {
  return (
    <div className="grid gap-5 px-[5%]">
      <div className="flex w-full justify-between items-center max-h-[56px]">
        <div className="flex justify-center items-center gap-2">
          <span className="h-8 w-4 bg-primary rounded"></span>
          <p className={`${className} text-sm sm:text-base text-primary md:text-lg`}>
            {leftText}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center w-full">
        {/* Use a div instead of h1 to avoid nesting issues */}
        <div className="text-2xl font-bold">{children}</div>
        {rightText && (
          <Button className="rounded border md:w-[10%]">
            See All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-8">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {viewAll && (
        <div className="flex justify-center items-center w-full">
          <Button className="w-[200px] py-6 md:w-[300px] bg-bgsecondary hover:bg-hover">
            View All
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;