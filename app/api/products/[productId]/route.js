import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"

// Get a single product (public)
export async function GET(req, { params }) {
  try {
    await connectToDatabase()

    const product = await Product.findById(params.productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
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

    const { name, description, price, images, category, stock } = await req.json()

    await connectToDatabase()

    const product = await Product.findById(params.productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update product fields
    if (name) product.name = name
    if (description) product.description = description
    if (price !== undefined) product.price = price
    if (images) product.images = images
    if (category) product.category = category
    if (stock !== undefined) product.stock = stock

    await product.save()

    return NextResponse.json({
      message: "Product updated successfully",
      product,
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

