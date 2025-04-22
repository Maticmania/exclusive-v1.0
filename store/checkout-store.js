import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCheckoutStore = create(
  persist(
    (set) => ({
      orderDetails: null,
      setOrderDetails: (details) =>
        set({
          orderDetails: {
            orderId: details.orderId || null,
            orderNumber: details.orderNumber || null,
            total: details.total || 0,
            items: details.items || [],
            email: details.email || null,
          },
        }),
      clearOrderDetails: () => set({ orderDetails: null }),
    }),
    {
      name: "checkout-storage",
      partialize: (state) => ({ orderDetails: state.orderDetails }),
    }
  )
);