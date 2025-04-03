import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"

// Update a review
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

    const product = await Product.findOne({ slug: params.slug })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex(
      (review) => review._id.toString() === params.reviewId && review.user.toString() === session.user.id,
    )

    if (reviewIndex === -1) {
      return NextResponse.json({ error: "Review not found or you are not authorized to update it" }, { status: 404 })
    }

    // Update the review
    product.reviews[reviewIndex].rating = rating
    product.reviews[reviewIndex].comment = comment
    product.reviews[reviewIndex].updatedAt = Date.now()

    // Update product rating
    product.rating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length

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

// Delete a review
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const product = await Product.findOne({ slug: params.slug })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex(
      (review) =>
        review._id.toString() === params.reviewId &&
        (review.user.toString() === session.user.id || session.user.role === "admin"),
    )

    if (reviewIndex === -1) {
      return NextResponse.json({ error: "Review not found or you are not authorized to delete it" }, { status: 404 })
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1)

    // Update product rating
    if (product.reviews.length > 0) {
      product.rating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    } else {
      product.rating = 0
    }

    await product.save()

    return NextResponse.json({
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

