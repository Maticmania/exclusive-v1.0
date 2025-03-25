import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Category from "@/models/category"
import Product from "@/models/product"
import { slugify } from "@/lib/utils"
import { uploadSingleImage, deleteImageFromCloudinary } from "@/lib/cloudinaryUpload"

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

    const categoryData = await req.json()

    if (!categoryData.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    await connectToDatabase()
    const {id} = await params
    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Update slug if name changes
    if (categoryData.name !== category.name) {
      categoryData.slug = slugify(categoryData.name)
    }

    // Handle Image Update
    if (categoryData.image && categoryData.image !== category.image) {
      // Delete old image from Cloudinary
      if (category.image) {
        await deleteImageFromCloudinary(category.image)
      }
      // Upload new image
      categoryData.image = await uploadSingleImage(categoryData.image)
    }

    Object.assign(category, categoryData)
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
    const {id} = await params

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Delete category image from Cloudinary
    if (category.image) {
      await deleteImageFromCloudinary(category.image)
    }

    await Category.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
