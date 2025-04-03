"use client";

import { useState, useEffect, useCallback } from "react";
import ProductCard from "./product-card";
import { useWishlistStore, useCartStore } from "@/store/auth-store";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { syncWithServer: syncWishlist } = useWishlistStore();
  const { syncWithServer: syncCart } = useCartStore();

  // Memoize sync functions to prevent unnecessary re-renders
  const syncData = useCallback(() => {
    syncWishlist();
    syncCart();
  }, [syncWishlist, syncCart]);

  useEffect(() => {
    syncData(); // Sync wishlist & cart

    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        if (!data.products || data.products.length === 0) {
          throw new Error("No products available");
        }

        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Depend on `syncData` to avoid re-fetching unnecessarily

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

  if (products.length === 0) {
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
