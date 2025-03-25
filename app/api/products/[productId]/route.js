import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"

// Helper function to serialize MongoDB documents and handle ObjectIds
function serializeMongoData(data) {
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

// Get a single product (public)
export async function GET(req, { params }) {
  try {
    await connectToDatabase()

    const product = await Product.findById(params.productId)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Serialize the product to handle ObjectIds
    const serializedProduct = serializeMongoData(product)

    return NextResponse.json(serializedProduct)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a product (admin and superadmin only)
export async function PUT(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const productData = await req.json()

    await connectToDatabase()

    const product = await Product.findById(params.productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update slug if name is changed and slug is not provided
    if (productData.name && !productData.slug && productData.name !== product.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    // Check if new slug already exists (if slug is being changed)
    if (productData.slug && productData.slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug: productData.slug })
      if (existingProduct && existingProduct._id.toString() !== params.productId) {
        return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
      }
    }

    // Update product with all fields from request
    Object.keys(productData).forEach((key) => {
      product[key] = productData[key]
    })

    await product.save()

    // Serialize the product to handle ObjectIds
    const serializedProduct = serializeMongoData(product.toObject())

    return NextResponse.json({
      message: "Product updated successfully",
      product: serializedProduct,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a product (admin and superadmin only)
export async function DELETE(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    await connectToDatabase()

    const product = await Product.findByIdAndDelete(params.productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

