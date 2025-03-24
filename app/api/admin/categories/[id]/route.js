import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Category from "@/models/category"
import Product from "@/models/product"
import { slugify } from "@/lib/utils"

// Get a single category
export async function GET(req, { params }) {
  try {
    await connectToDatabase()

    const category = await Category.findById(params.id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a category (admin and superadmin only)
export async function PUT(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const { name, description, image, featured } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    await connectToDatabase()

    const category = await Category.findById(params.id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if name is changed and if the new name already exists
    if (name !== category.name) {
      const existingCategory = await Category.findOne({ name })

      if (existingCategory && existingCategory._id.toString() !== params.id) {
        return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 })
      }

      // Update slug if name changes
      category.slug = slugify(name)
    }

    category.name = name
    category.description = description
    if (image) category.image = image
    category.featured = featured

    await category.save()

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a category (admin and superadmin only)
export async function DELETE(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    await connectToDatabase()

    // Check if category is used in any products
    const productsUsingCategory = await Product.countDocuments({ category: params.id })

    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category that is used by products",
          productsCount: productsUsingCategory,
        },
        { status: 400 },
      )
    }

    const category = await Category.findByIdAndDelete(params.id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

