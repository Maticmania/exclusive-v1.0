import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Cart from "@/models/cart"
import Product from "@/models/product"

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { itemId } = await params

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quantity } = await req.json()

    if (!quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const cart = await Cart.findOne({ user: session.user.id })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity

    await cart.save()

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      model: Product,
      select: "name price images stock variants",
    })

    // Serialize the cart
    const serializedCart = cart.toJSON()

    return NextResponse.json({
      message: "Cart updated",
      cart: serializedCart,
    })
  } catch (error) {
    console.error("Update cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { itemId } = await params

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const cart = await Cart.findOne({ user: session.user.id })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Remove item from cart
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId)

    await cart.save()

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      model: Product,
      select: "name price images stock variants",
    })

    // Serialize the cart
    const serializedCart = cart

    return NextResponse.json({
      message: "Item removed from cart",
      cart: serializedCart,
    })
  } catch (error) {
    console.error("Remove from cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

