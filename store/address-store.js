import { create } from "zustand"

export const useAddressStore = create((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  // Fetch addresses from the server
  fetchAddresses: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/user/addresses")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch addresses")
      }

      const data = await response.json()
      set({ addresses: data, isLoading: false })
    } catch (error) {
      console.error("Error fetching addresses:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  // Add a new address
  addAddress: async (address) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      })

      if (!response.ok) throw new Error("Failed to add address")

      const newAddress = await response.json()

      // If the new address is set as default, update all other addresses
      if (newAddress.isDefault) {
        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isDefault: addr._id === newAddress._id,
          })),
          isLoading: false,
        }))
      } else {
        set((state) => ({
          addresses: [...state.addresses, newAddress],
          isLoading: false,
        }))
      }
    } catch (error) {
      console.error("Error adding address:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  // Update an existing address
  updateAddress: async (id, address) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      })

      if (!response.ok) throw new Error("Failed to update address")

      const updatedAddress = await response.json()

      // If the updated address is set as default, update all other addresses
      if (updatedAddress.isDefault) {
        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isDefault: addr._id === id,
          })),
          isLoading: false,
        }))
      } else {
        set((state) => ({
          addresses: state.addresses.map((addr) => (addr._id === id ? updatedAddress : addr)),
          isLoading: false,
        }))
      }
    } catch (error) {
      console.error("Error updating address:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  // Delete an address
  deleteAddress: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete address")

      set((state) => ({
        addresses: state.addresses.filter((addr) => addr._id !== id),
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error deleting address:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  // Set an address as default
  setDefaultAddress: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/user/addresses/${id}/default`, {
        method: "PUT",
      })

      if (!response.ok) throw new Error("Failed to set default address")

      set((state) => ({
        addresses: state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr._id === id,
        })),
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error setting default address:", error)
      set({ error: error.message, isLoading: false })
    }
  },
}))

