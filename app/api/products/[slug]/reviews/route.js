import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"

// Get all reviews for a product
export async function GET(req, { params }) {
  try {
    await connectToDatabase()

    const product = await Product.findOne({ slug: params.slug }).select("reviews").lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product.reviews || [])
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a review to a product
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rating, comment } = await req.json()

    if (!rating || !comment) {
      return NextResponse.json({ error: "Rating and comment are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    await connectToDatabase()

    const product = await Product.findOne({ slug: params.slug })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find((review) => review.user.toString() === session.user.id)

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    // Add the review
    product.reviews.push({
      user: session.user.id,
      rating,
      comment,
    })

    // Update product rating
    product.rating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length

    await product.save()

    return NextResponse.json({
      message: "Review added successfully",
      review: product.reviews[product.reviews.length - 1],
    })
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

