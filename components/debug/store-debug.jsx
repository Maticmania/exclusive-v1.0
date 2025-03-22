"use client"

import { useState } from "react"
import { useAuthStore, useCartStore, useWishlistStore } from "@/store/auth-store"

export default function StoreDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("auth")

  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()

  const stores = {
    auth: {
      name: "Auth Store",
      data: {
        user: authStore.user,
        isAuthenticated: authStore.isAuthenticated,
        isLoading: authStore.isLoading,
        isAdmin: authStore.isAdmin(),
        isSuperAdmin: authStore.isSuperAdmin(),
      },
    },
    cart: {
      name: "Cart Store",
      data: {
        items: cartStore.items,
        total: cartStore.total,
        itemCount: cartStore.items.length,
      },
    },
    wishlist: {
      name: "Wishlist Store",
      data: {
        products: wishlistStore.products,
        productCount: wishlistStore.products.length,
      },
    },
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setIsVisible(!isVisible)} className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">
        {isVisible ? "Hide" : "Debug"} Stores
      </button>

      {isVisible && (
        <div className="mt-2 p-4 bg-white border rounded-md shadow-lg w-96 max-h-96 overflow-auto">
          <div className="flex space-x-2 mb-4">
            {Object.keys(stores).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === key ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {stores[key].name}
              </button>
            ))}
          </div>

          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(stores[activeTab].data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

