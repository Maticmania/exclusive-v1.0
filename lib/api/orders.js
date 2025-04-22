import axios from "axios"

export async function fetchOrders() {
  try {
    const response = await axios.get("/api/orders", {
      headers: {
        // Optional: Add auth token if needed
        "Content-Type": "application/json",
      },
    })
    return { data: response.data, error: null }
  } catch (err) {
    console.error("Fetch orders error:", err)
    return { data: null, error: err.response?.data?.error || "Failed to fetch orders" }
  }
}