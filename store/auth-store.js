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

      // Role checking functions
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
      isLoading: false,

      // Add item to cart
      addItem: (product, quantity = 1, variantId = null) => {
        // Check if product is valid
        if (!product || !product._id) {
          console.error("Invalid product data:", product)
          return
        }

        const { items } = get()
        const existingItem = items.find(
          (item) =>
            item.product &&
            item.product._id === product._id &&
            ((!variantId && !item.variant) || (variantId && item.variant && item.variant === variantId)),
        )

        if (existingItem) {
          // Update quantity if item exists
          const updatedItems = items.map((item) =>
            item.product &&
            item.product._id === product._id &&
            ((!variantId && !item.variant) || (variantId && item.variant && item.variant === variantId))
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )

          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          })
        } else {
          // Add new item
          const newItem = {
            product,
            quantity,
          }

          if (variantId) {
            newItem.variant = variantId
          }

          const newItems = [...items, newItem]
          set({
            items: newItems,
            total: calculateTotal(newItems),
          })
        }
      },

      // Update item quantity
      updateQuantity: (itemId, quantity) => {
        const { items } = get()
        const updatedItems = items.map((item) => (item._id === itemId ? { ...item, quantity } : item))

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        })
      },

      // Remove item from cart
      removeItem: (itemId) => {
        const { items } = get()
        const updatedItems = items.filter((item) => item._id !== itemId)

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        })
      },

      // Clear cart
      clearCart: () => set({ items: [], total: 0 }),

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Sync cart with server
      syncWithServer: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch("/api/cart")
          if (!response.ok) throw new Error("Failed to fetch cart")

          const data = await response.json()

          set({
            items: data.items || [],
            total: data.total || 0,
            isLoading: false,
          })
        } catch (error) {
          console.error("Error syncing cart:", error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items, total: state.total }),
    },
  ),
)

// Update the calculateTotal function to handle null values

// Helper function to calculate total
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    if (!item || !item.product) return sum
    const price = item.price || (item.product && item.product.price) || 0
    return sum + price * (item.quantity || 1)
  }, 0)
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

