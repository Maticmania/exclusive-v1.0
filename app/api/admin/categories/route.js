import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Category from "@/models/category"
import { slugify } from "@/lib/utils"

// Get all categories
export async function GET(req) {
  try {
    await connectToDatabase()

    const categories = await Category.find().sort({ name: 1 })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new category (admin and superadmin only)
export async function POST(req) {
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

    // Check if category already exists
    const existingCategory = await Category.findOne({ name })

    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 })
    }

    // Create slug from name
    const slug = slugify(name)

    const category = new Category({
      name,
      slug,
      description,
      image,
      featured: featured || false,
    })

    await category.save()

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

