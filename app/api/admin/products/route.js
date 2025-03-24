import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import Category from "@/models/category"
import Brand from "@/models/brand"
import { slugify } from "@/lib/utils"

// Get all products (admin and superadmin only)
export async function GET(req) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    await connectToDatabase()

    // Build search query
    const searchQuery = search
      ? {
          $or: [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
        }
      : {}

    // Get total count for pagination
    const total = await Product.countDocuments(searchQuery)

    // Get products with pagination
    const products = await Product.find(searchQuery)
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Format products for response
    const formattedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      category: product.category
        ? {
            _id: product.category._id.toString(),
            name: product.category.name,
          }
        : null,
      brand: product.brand
        ? {
            _id: product.brand._id.toString(),
            name: product.brand.name,
          }
        : null,
    }))

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
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
      // Append a random string to make the slug unique
      const randomString = Math.random().toString(36).substring(2, 7)
      productData.slug = `${slug}-${randomString}`
    } else {
      productData.slug = slug
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

