import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Brand from "@/models/brand"
import { slugify } from "@/lib/utils"
import { uploadSingleImage } from "@/lib/cloudinaryUpload"

// Get all brands
export async function GET(req) {
  try {
    await connectToDatabase()

    const brands = await Brand.find().sort({ name: 1 })

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new brand (admin and superadmin only)
export async function POST(req) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const { name, description, logo, featured } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name })

    if (existingBrand) {
      return NextResponse.json({ error: "Brand already exists" }, { status: 409 })
    }

    // Upload logo to Cloudinary
    let logoUrl = null
    if (logo) {
      logoUrl = await uploadSingleImage(logo) // Upload Base64 string
    }

    // Create slug from name
    const slug = slugify(name)

    const brand = new Brand({
      name,
      slug,
      description,
      logo :logoUrl,
      featured: featured || false,
    })

    await brand.save()

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error("Error creating brand:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

