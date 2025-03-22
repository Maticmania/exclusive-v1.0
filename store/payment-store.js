import { create } from "zustand"

export const usePaymentStore = create((set, get) => ({
  paymentOptions: [],
  isLoading: false,
  error: null,

  // Fetch payment options from the server
  fetchPaymentOptions: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/user/payment-options")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch payment options")
      }

      const data = await response.json()
      set({ paymentOptions: data, isLoading: false })
    } catch (error) {
      console.error("Error fetching payment options:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  // Add a new payment option
  addPaymentOption: async (paymentData, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/user/payment-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentData, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add payment option")
      }

      const newPaymentOption = await response.json()

      // Update local state
      set((state) => ({
        paymentOptions: [...state.paymentOptions, newPaymentOption],
        isLoading: false,
      }))

      return { success: true }
    } catch (error) {
      console.error("Error adding payment option:", error)
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  // Update an existing payment option
  updatePaymentOption: async (id, paymentData, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/user/payment-options/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentData, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update payment option")
      }

      const updatedPaymentOption = await response.json()

      // Update local state
      set((state) => ({
        paymentOptions: state.paymentOptions.map((option) => (option._id === id ? updatedPaymentOption : option)),
        isLoading: false,
      }))

      return { success: true }
    } catch (error) {
      console.error("Error updating payment option:", error)
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  // Delete a payment option
  deletePaymentOption: async (id, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/user/payment-options/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete payment option")
      }

      // Update local state
      set((state) => ({
        paymentOptions: state.paymentOptions.filter((option) => option._id !== id),
        isLoading: false,
      }))

      return { success: true }
    } catch (error) {
      console.error("Error deleting payment option:", error)
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  // Set a payment option as default
  setDefaultPaymentOption: async (id, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/user/payment-options/${id}/default`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to set default payment option")
      }

      // Update local state
      set((state) => ({
        paymentOptions: state.paymentOptions.map((option) => ({
          ...option,
          isDefault: option._id === id,
        })),
        isLoading: false,
      }))

      return { success: true }
    } catch (error) {
      console.error("Error setting default payment option:", error)
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },
}))

