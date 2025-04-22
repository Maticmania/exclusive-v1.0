import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isLoading: false,

      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          const updatedItems = items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
          set({ items: updatedItems, total: calculateTotal(updatedItems) })
        } else {
          const newItems = [...items, { ...item, quantity: 1 }]
          set({ items: newItems, total: calculateTotal(newItems) })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        const updatedItems = items.filter((item) => item.id !== id)
        set({ items: updatedItems, total: calculateTotal(updatedItems) })
      },

      updateQuantity: (id, quantity) => {
        const { items } = get()
        const updatedItems = items.map((item) => (item.id === id ? { ...item, quantity } : item))
        set({ items: updatedItems, total: calculateTotal(updatedItems) })
      },

      clearCart: () => set({ items: [], total: 0 }),

      setLoading: (isLoading) => set({ isLoading }),
      

      syncWithServer: async () => {
        set({ isLoading: true })
        try {
          // Placeholder for server sync logic
          set({ isLoading: false })
        } catch (error) {
          console.error("Error syncing with server:", error)
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

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
}
