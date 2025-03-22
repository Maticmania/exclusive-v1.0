import { create } from "zustand"
import { persist } from "zustand/middleware"

// Create auth store with persistence
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Set user data
      setUser: (userData) =>
        set({
          user: userData,
          isAuthenticated: !!userData,
          isLoading: false,
        }),

      // Clear user data on logout
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Role checking functions
      hasRole: (requiredRoles) => {
        const { user } = get()
        if (!user || !user.role) return false

        // Convert to array if single role is provided
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

        return roles.includes(user.role)
      },

      isAdmin: () => {
        const { hasRole } = get()
        return hasRole(["admin", "superadmin"])
      },

      isSuperAdmin: () => {
        const { hasRole } = get()
        return hasRole("superadmin")
      },
    }),
    {
      name: "auth-storage", // name of the item in storage
      partialize: (state) => ({ user: state.user }), // only store user data
    },
  ),
)

// Create a cart store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      // Add item to cart
      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existingItem = items.find((item) => item.product._id === product._id)

        if (existingItem) {
          // Update quantity if item exists
          const updatedItems = items.map((item) =>
            item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item,
          )

          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          })
        } else {
          // Add new item
          const newItems = [...items, { product, quantity }]
          set({
            items: newItems,
            total: calculateTotal(newItems),
          })
        }
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        const { items } = get()
        const updatedItems = items.map((item) => (item.product._id === productId ? { ...item, quantity } : item))

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        })
      },

      // Remove item from cart
      removeItem: (productId) => {
        const { items } = get()
        const updatedItems = items.filter((item) => item.product._id !== productId)

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        })
      },

      // Clear cart
      clearCart: () => set({ items: [], total: 0 }),

      // Sync cart with server
      syncWithServer: async () => {
        try {
          const response = await fetch("/api/cart")
          if (!response.ok) throw new Error("Failed to fetch cart")

          const data = await response.json()

          set({
            items: data.items.map((item) => ({
              product: item.product,
              quantity: item.quantity,
            })),
            total: data.total,
          })
        } catch (error) {
          console.error("Error syncing cart:", error)
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items, total: state.total }),
    },
  ),
)

// Helper function to calculate total
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}

// Create a wishlist store
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      products: [],

      // Add product to wishlist
      addProduct: (product) => {
        const { products } = get()
        if (!products.some((p) => p._id === product._id)) {
          set({ products: [...products, product] })
        }
      },

      // Remove product from wishlist
      removeProduct: (productId) => {
        const { products } = get()
        set({ products: products.filter((p) => p._id !== productId) })
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const { products } = get()
        return products.some((p) => p._id === productId)
      },

      // Sync wishlist with server
      syncWithServer: async () => {
        try {
          const response = await fetch("/api/wishlist")
          if (!response.ok) throw new Error("Failed to fetch wishlist")

          const data = await response.json()

          set({
            products: data.products,
          })
        } catch (error) {
          console.error("Error syncing wishlist:", error)
        }
      },
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({ products: state.products }),
    },
  ),
)

