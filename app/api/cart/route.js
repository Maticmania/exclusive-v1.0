import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Cart from "@/models/cart"
import Product from "@/models/product"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    let cart = await Cart.findOne({ user: session.user.id }).populate({
      path: "items.product",
      model: Product,
    })

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] })
      await cart.save()
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await req.json()

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Get product details
    const product = await Product.findById(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 400 })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: session.user.id })

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] })
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      })
    }

    await cart.save()

    return NextResponse.json({
      message: "Product added to cart",
      cart,
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

