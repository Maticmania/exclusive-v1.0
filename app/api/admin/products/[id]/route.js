import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import Category from "@/models/category"
import Brand from "@/models/brand"
import { slugify } from "@/lib/utils"

// Get a single product (admin and superadmin only)
export async function GET(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    await connectToDatabase()

    const product = await Product.findById(params.id).populate("category", "name").populate("brand", "name")

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

    const productData = await req.json()

    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Name, price, and category are required",
        },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

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

    // Update slug if name changes
    if (productData.name !== product.name) {
      const slug = slugify(productData.name)

      // Check if slug already exists
      const existingProduct = await Product.findOne({
        slug,
        _id: { $ne: params.id },
      })

      if (existingProduct) {
        // Append a random string to make the slug unique
        const randomString = Math.random().toString(36).substring(2, 7)
        productData.slug = `${slug}-${randomString}`
      } else {
        productData.slug = slug
      }
    }

    // Update product
    Object.keys(productData).forEach((key) => {
      product[key] = productData[key]
    })

    await product.save()

    // Populate category and brand for response
    await product.populate("category", "name")
    await product.populate("brand", "name")

    return NextResponse.json(product)
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

    const product = await Product.findByIdAndDelete(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

