import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { hasRole } from "@/lib/auth-middleware"
import connectToDatabase from "@/lib/mongodb"
import Product from "@/models/product"

// Update a review (owner or admin only)
export async function PUT(req, { params }) {
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

    const product = await Product.findById(params.productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex((review) => review._id.toString() === params.reviewId)

    if (reviewIndex === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const review = product.reviews[reviewIndex]

    // Check if user is the review owner or an admin
    const isOwner = review.user && review.user.toString() === session.user.id
    const { authorized } = await hasRole(["admin", "superadmin"])

    if (!isOwner && !authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update review
    product.reviews[reviewIndex].rating = rating
    product.reviews[reviewIndex].comment = comment
    product.reviews[reviewIndex].date = new Date()

    await product.save()

    return NextResponse.json({
      message: "Review updated successfully",
      review: product.reviews[reviewIndex],
    })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a review (owner or admin only)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const product = await Product.findById(params.productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex((review) => review._id.toString() === params.reviewId)

    if (reviewIndex === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const review = product.reviews[reviewIndex]

    // Check if user is the review owner or an admin
    const isOwner = review.user && review.user.toString() === session.user.id
    const { authorized } = await hasRole(["admin", "superadmin"])

    if (!isOwner && !authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Remove review
    product.reviews.splice(reviewIndex, 1)
    await product.save()

    return NextResponse.json({
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

