import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import Category from "@/models/category"
import Brand from "@/models/brand"
import { slugify } from "@/lib/utils"
import { uploadMultipleImages, deleteImageFromCloudinary } from "@/lib/cloudinaryUpload" // Import Cloudinary functions


// Get a single product (admin and superadmin only)
export async function GET(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    await connectToDatabase()
    const {id} = await params

    const product = await Product.findById(id).populate("category", "name").populate("brand", "name")

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
        { error: "Missing required fields", details: "Name, price, and category are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const {id} = await params

    const product = await Product.findById(id)
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
      const existingProduct = await Product.findOne({ slug, _id: { $ne: id } })

      productData.slug = existingProduct
        ? `${slug}-${Math.random().toString(36).substring(2, 7)}`
        : slug
    }

    // Handle Image Updates
    if (productData.images) {
      // Determine images to keep (old images still in request)
      const newImageSet = new Set(productData.images)
      const imagesToDelete = product.images.filter((img) => !newImageSet.has(img))

      // Delete removed images from Cloudinary
      await Promise.all(imagesToDelete.map((img) => deleteImageFromCloudinary(img)))

      // Upload new images (if any)
      const uploadedImages = await uploadMultipleImages(
        productData.images.filter((img) => !product.images.includes(img))
      )

      // Merge old and new images
      productData.images = [...new Set([...product.images, ...uploadedImages])]
    }

    // Update product data
    Object.assign(product, productData)
    await product.save()

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
    const {id} = await params

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete all product images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(product.images.map((img) => deleteImageFromCloudinary(img)))
    }

    await Product.findByIdAndDelete(id)

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

