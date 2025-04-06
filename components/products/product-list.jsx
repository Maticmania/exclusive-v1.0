"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./product-card";
import { useWishlistStore, useCartStore } from "@/store/auth-store";
import Pagination from "./pagination";
import ProductSort from "./product-sort";

export default function ProductList({ initialProducts = [], initialPagination = null }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [pagination, setPagination] = useState(
    initialPagination || {
      total: 0,
      page: 1,
      limit: 12,
      pages: 1,
    }
  );
  const searchParams = useSearchParams();
  const { syncWithServer: syncWishlist } = useWishlistStore();
  const { syncWithServer: syncCart } = useCartStore();

  useEffect(() => {
    // Sync wishlist and cart with server
    syncWishlist();
    syncCart();

    // Fetch products whenever searchParams change
    fetchProducts();
  }, [searchParams, syncWishlist, syncCart]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryString = searchParams.toString();
      const response = await fetch(`/api/products?${queryString}`, {
        cache: "no-store", // Ensure fresh data
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.products || []);
      setPagination(
        data.pagination || { total: 0, page: 1, limit: 12, pages: 1 }
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setPagination({ total: 0, page: 1, limit: 12, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {pagination.total} products
        </p>
        <ProductSort />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
        />
      )}
    </div>
  );
}