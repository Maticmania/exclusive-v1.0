"use client";

import { useState, useEffect } from "react";
import ProductCard from "./product-card";
import { useWishlistStore, useCartStore } from "@/store/auth-store";

export default function ProductList({ initialProducts = [] }) {
  const [products, setProducts] = useState(Array.isArray(initialProducts) ? initialProducts : []);
  const [loading, setLoading] = useState(products.length === 0);
  const { syncWithServer: syncWishlist } = useWishlistStore();
  const { syncWithServer: syncCart } = useCartStore();

  useEffect(() => {
    // Sync wishlist and cart with server
    syncWishlist();
    syncCart();

    // Fetch products only if the initial list is empty
    if (initialProducts.length === 0) {
      const fetchProducts = async () => {
        try {
          const response = await fetch("/api/products");
          if (!response.ok) throw new Error("Failed to fetch products");

          const data = await response.json();
          setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [initialProducts, syncWishlist, syncCart]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-3 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/4" />
                <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
