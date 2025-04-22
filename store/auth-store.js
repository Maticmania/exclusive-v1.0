import { create } from "zustand"
import { persist } from "zustand/middleware"

// Create auth store with persistence
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (userData) =>
        set({
          user: userData,
          isAuthenticated: !!userData,
          isLoading: false,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      hasRole: (requiredRoles) => {
        const { user } = get()
        if (!user || !user.role) return false
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
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
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

      addItem: (product, quantity = 1, variantId = null) => {
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

      updateQuantity: (itemId, quantity) => {
        const { items } = get()
        const updatedItems = items.map((item) => (item._id === itemId ? { ...item, quantity } : item))

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        })
      },

      removeItem: (itemId) => {
        const { items } = get()
        const updatedItems = items.filter((item) => item._id !== itemId)

        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        })
      },

      clearCart: () => set({ items: [], total: 0 }),

      setLoading: (isLoading) => set({ isLoading }),

      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        
        if (!isAuthenticated) {
          // Reset cart if user is not authenticated
          set({ items: [], total: 0, isLoading: false })
          return
        }

        try {
          set({ isLoading: true })
          const response = await fetch("/api/cart", {
            credentials: 'include', // Important for NextAuth session
          })
          
          if (!response.ok) {
            throw new Error("Failed to fetch cart")
          }
          
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

      addProduct: (product) => {
        const { products } = get()
        if (!products.some((p) => p._id === product._id)) {
          set({ products: [...products, product] })
        }
      },

      removeProduct: (productId) => {
        const { products } = get()
        set({ products: products.filter((p) => p._id !== productId) })
      },

      isInWishlist: (productId) => {
        const { products } = get()
        return products.some((p) => p._id === productId)
      },

      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        
        if (!isAuthenticated) {
          // Reset wishlist if user is not authenticated
          set({ products: [] })
          return
        }

        try {
          const response = await fetch("/api/wishlist", {
            credentials: 'include', // Important for NextAuth session
          })
          
          if (!response.ok) {
            throw new Error("Failed to fetch wishlist")
          }

          const data = await response.json()
          set({
            products: data.products || [],
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