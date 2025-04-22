import Product from "@/models/product"
import { connectToDatabase } from "./mongodb"

// Cache for product data with expiration
const cache = {
  randomProducts: { data: null, timestamp: 0, ttl: 3600000 }, // 1 hour
  featuredProducts: { data: null, timestamp: 0, ttl: 3600000 },
  newArrivals: { data: null, timestamp: 0, ttl: 3600000 },
  bestSellers: { data: null, timestamp: 0, ttl: 3600000 },
}

// Check if cache is valid
function isCacheValid(cacheKey) {
  const cacheItem = cache[cacheKey]
  return cacheItem.data !== null && Date.now() - cacheItem.timestamp < cacheItem.ttl
}

// Single database connection for all functions
let dbConnection = null
async function getDbConnection() {
  if (!dbConnection) {
    await connectToDatabase()
    dbConnection = true
  }
}

export async function getRandomProducts(limit = 8, withDiscount = false) {
  // Check cache first
  const cacheKey = `randomProducts_${limit}_${withDiscount}`
  if (cache[cacheKey] && isCacheValid(cacheKey)) {
    return cache[cacheKey].data
  }

  try {
    await getDbConnection()

    let query = {}
    if (withDiscount) {
      query = {
        compareAtPrice: { $exists: true, $ne: null },
        $expr: { $gt: ["$compareAtPrice", "$price"] },
      }
    }

    // Use MongoDB's $sample for random selection (much faster than client-side sorting)
    const products = await Product.aggregate([{ $match: query }, { $sample: { size: limit } }])

    const result = JSON.parse(JSON.stringify(products))

    // Cache the result
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
      ttl: 3600000, // 1 hour
    }

    return result
  } catch (error) {
    console.error("Error getting random products:", error)
    return []
  }
}

export async function getFeaturedProducts(count = 8) {
  const cacheKey = "featuredProducts"
  if (isCacheValid(cacheKey)) {
    return cache[cacheKey].data
  }

  try {
    await getDbConnection()

    const products = await Product.find({ featured: true })
      .limit(count)
      .lean()

    const result = JSON.parse(JSON.stringify(products))

    // Cache the result
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
      ttl: 3600000,
    }

    return result
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export async function getNewArrivals(count = 8) {
  const cacheKey = "newArrivals"
  if (isCacheValid(cacheKey)) {
    return cache[cacheKey].data
  }

  try {
    await getDbConnection()

    const products = await Product.find()
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort({ createdAt: -1 })
      .limit(count)
      .lean()

    const result = JSON.parse(JSON.stringify(products))

    // Cache the result
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
      ttl: 3600000,
    }

    return result
  } catch (error) {
    console.error("Error fetching new arrivals:", error)
    return []
  }
}

export async function getBestSellers(count = 4) {
  const cacheKey = "bestSellers"
  if (isCacheValid(cacheKey)) {
    return cache[cacheKey].data
  }

  try {
    await getDbConnection()

    const products = await Product.find()
      // .populate("category", "name slug")
      // .populate("brand", "name slug")
      .sort({ sold: -1 })
      .limit(count)
      .lean()

    const result = JSON.parse(JSON.stringify(products))

    // Cache the result
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
      ttl: 3600000,
    }

    return result
  } catch (error) {
    console.error("Error fetching best sellers:", error)
    return []
  }
}
