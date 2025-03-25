import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

// Add the serializeMongoData function to handle ObjectIds
export function serializeMongoData(data) {
  if (data === null || data === undefined) {
    return data
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString()
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeMongoData(item))
  }

  // Handle ObjectId (direct check)
  if (data && typeof data === "object" && data.constructor && data.constructor.name === "ObjectId") {
    return data.toString()
  }

  // Handle plain objects (including those with ObjectId properties)
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const result = {}
    for (const [key, value] of Object.entries(data)) {
      // Skip functions
      if (typeof value !== "function") {
        result[key] = serializeMongoData(value)
      }
    }
    return result
  }

  // Return primitive values as is
  return data
}

