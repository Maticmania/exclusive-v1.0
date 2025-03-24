import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Wishlist from "@/models/wishlist"
import Product from "@/models/product"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    let wishlist = await Wishlist.findOne({ user: session.user.id }).populate({
      path: "products",
      model: Product,
    })

    if (!wishlist) {
      wishlist = new Wishlist({ user: session.user.id, products: [] })
      await wishlist.save()
    }

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("Wishlist fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if product exists
    const product = await Product.findById(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: session.user.id })

    if (!wishlist) {
      wishlist = new Wishlist({ user: session.user.id, products: [] })
    }

    // Check if product already in wishlist
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId)
      await wishlist.save()
    }

    return NextResponse.json({
      message: "Product added to wishlist",
      wishlist,
    })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

