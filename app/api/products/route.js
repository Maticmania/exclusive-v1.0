import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"

// Get all products (public)
export async function GET(req) {
  try {
    await connectToDatabase()

    const products = await Product.find().sort({ createdAt: -1 })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new product (admin and superadmin only)
export async function POST(req) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const { name, description, price, images, category, stock } = await req.json()

    if (!name || !description || !price || !category || stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const product = new Product({
      name,
      description,
      price,
      images: images || [],
      category,
      stock,
    })

    await product.save()

    return NextResponse.json({ message: "Product created successfully", product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

