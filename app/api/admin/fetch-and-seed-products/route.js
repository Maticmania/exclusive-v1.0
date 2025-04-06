import { NextResponse } from "next/server"
import {connectToDatabase} from "../../../../lib/mongodb"
import Product from "../../../../models/product"
import Category from "../../../../models/category"
import Brand from "../../../../models/brand"
import User from "../../../../models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { slugify } from "../../../../lib/utils"

export async function GET(request) {
  try {
    // Check authentication and admin role
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // // Check if user is admin
    // const user = await User.findOne({ email: session.user.email })
    // if (!user || user.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    // }

    await connectToDatabase()

    // Get the limit parameter from the URL, default to 20 products
    const url = new URL(request.url)
    const limit = url.searchParams.get("limit") ? Number.parseInt(url.searchParams.get("limit")) : 20

    // Fetch products from DummyJSON API
    console.log(`Fetching ${limit} products from DummyJSON API...`)
    const response = await fetch(`https://dummyjson.com/products?limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
      return NextResponse.json({ error: "No products found in API response" }, { status: 404 })
    }

    console.log(`Successfully fetched ${data.products.length} products. Starting seeding...`)

    // Process and seed the products
    const results = await seedProducts(data.products)

    // Count successes and failures
    const created = results.filter((r) => r.status === "created").length
    const updated = results.filter((r) => r.status === "updated").length
    const failed = results.filter((r) => r.status === "failed").length

    return NextResponse.json({
      success: true,
      message: `Seeding completed: ${created} created, ${updated} updated, ${failed} failed`,
      totalProducts: results.length,
      created,
      updated,
      failed,
    })
  } catch (error) {
    console.error("Error in fetch-and-seed-products:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function seedProducts(productsData) {
  const results = []

  // Find or create a default user for reviews
  let defaultUser = await User.findOne({ role: "admin" })
  if (!defaultUser) {
    defaultUser = await User.findOne({})
  }

  for (const productData of productsData) {
    try {
      // Find or create category
      let category
      if (productData.category) {
        category = await Category.findOne({
          name: { $regex: new RegExp(`^${productData.category}$`, "i") },
        })

        if (!category) {
          category = await Category.create({
            name: productData.category.charAt(0).toUpperCase() + productData.category.slice(1),
            slug: slugify(productData.category),
            description: `${productData.category} category`,
            isActive: true,
          })
          console.log(`Created new category: ${category.name}`)
        }
      }

      // Find or create brand
      let brand
      if (productData.brand) {
        brand = await Brand.findOne({
          name: { $regex: new RegExp(`^${productData.brand}$`, "i") },
        })

        if (!brand) {
          brand = await Brand.create({
            name: productData.brand,
            slug: slugify(productData.brand),
            description: `${productData.brand} brand`,
            isActive: true,
          })
          console.log(`Created new brand: ${brand.name}`)
        }
      }

      // Create slug from title
      const slug = slugify(productData.title)

      // Format reviews to match our schema
      const reviews = []
      if (productData.rating && defaultUser) {
        // Create a dummy review if the product has a rating but no reviews
        reviews.push({
          user: defaultUser._id,
          rating: productData.rating,
          comment: "Great product!",
          createdAt: new Date(),
        })
      }

      // Calculate compareAtPrice from discountPercentage if available
      let compareAtPrice = 0
      if (productData.discountPercentage && productData.discountPercentage > 0) {
        compareAtPrice = Number.parseFloat((productData.price / (1 - productData.discountPercentage / 100)).toFixed(2))
      }

      // Prepare images array
      const images = []
      if (productData.images && Array.isArray(productData.images)) {
        images.push(...productData.images)
      }
      if (productData.thumbnail && !images.includes(productData.thumbnail)) {
        images.push(productData.thumbnail)
      }

      // Prepare product data
      const productToCreate = {
        name: productData.title,
        slug,
        description: productData.description || `${productData.title} - A quality product`,
        price: productData.price,
        compareAtPrice,
        category: category ? category._id : null,
        brand: brand ? brand._id : null,
        stock: productData.stock || 10,
        images,
        thumbnail: productData.thumbnail,
        reviews,
        ratings: productData.rating || 0,
        numReviews: reviews.length,
        sku: productData.id ? `SKU-${productData.id}` : `SKU-${Math.floor(Math.random() * 10000)}`,
        tags: productData.tags || [productData.category],
        status: "published",
        featured: true,
        freeShipping: Math.random() > 0.5, // Random boolean
        warrantyInformation: "Standard warranty applies",
        shippingInformation: "Standard shipping applies",
        returnPolicy: "30-day return policy",
        minimumOrderQuantity: 1,
        weight: productData.weight || 0.5,
        weightUnit: "kg",
        dimensions: productData.dimensions || { width: 10, height: 10, depth: 10, unit: "cm" },
        availabilityStatus: productData.stock > 0 ? "In Stock" : "Out of Stock",
        discountPercentage: productData.discountPercentage || 0,
      }

      // Check if product already exists
      let product = await Product.findOne({ slug })

      if (product) {
        // Update existing product
        product = await Product.findOneAndUpdate({ slug }, productToCreate, { new: true })
        console.log(`Updated product: ${product.name}`)
        results.push({
          id: product._id,
          name: product.name,
          slug: product.slug,
          status: "updated",
        })
      } else {
        // Create new product
        product = await Product.create(productToCreate)
        console.log(`Created product: ${product.name}`)
        results.push({
          id: product._id,
          name: product.name,
          slug: product.slug,
          status: "created",
        })
      }
    } catch (error) {
      console.error(`Error processing product ${productData.title || "unknown"}:`, error)
      results.push({
        title: productData.title || "unknown",
        error: error.message,
        status: "failed",
      })
    }
  }

  return results
}

