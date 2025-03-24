import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import { connectToDatabase } from "@/lib/mongodb"
import Product from "@/models/product"
import Category from "@/models/category"
import Brand from "@/models/brand"
import { slugify } from "@/lib/utils"
import { uploadMultipleImages } from "@/lib/cloudinaryUpload" // Import function

export async function POST(req) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])
    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const productData = await req.json()

    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      return NextResponse.json(
        { error: "Missing required fields", details: "Name, price, and category are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Validate category exists
    const categoryExists = await Category.exists({ _id: productData.category })
    if (!categoryExists) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 })
    }

    // Validate brand exists if provided
    if (productData.brand) {
      const brandExists = await Brand.exists({ _id: productData.brand })
      if (!brandExists) {
        return NextResponse.json({ error: "Brand not found" }, { status: 400 })
      }
    }

    // Create slug from name
    const slug = slugify(productData.name)

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug })
    if (existingProduct) {
      const randomString = Math.random().toString(36).substring(2, 7)
      productData.slug = `${slug}-${randomString}`
    } else {
      productData.slug = slug
    }

    // Upload multiple images
    if (productData.images && productData.images.length > 0) {
      productData.images = await uploadMultipleImages(productData.images)
    }

    const product = new Product(productData)
    await product.save()

    // Populate category and brand for response
    await product.populate("category", "name")
    await product.populate("brand", "name")

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
