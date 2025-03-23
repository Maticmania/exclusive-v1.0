// Simple debug logging utility
export function debugLog(message, data = null) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] ${message}`, data ? data : "")
    }
  }
  