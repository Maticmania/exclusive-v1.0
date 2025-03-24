import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Order from "@/models/order"
import Cart from "@/models/cart"
import Product from "@/models/product"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).populate({
      path: "items.product",
      model: Product,
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shippingAddress, paymentMethod } = await req.json()

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Get user's cart
    const cart = await Cart.findOne({ user: session.user.id }).populate({
      path: "items.product",
      model: Product,
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Create order from cart
    const order = new Order({
      user: session.user.id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cart.total,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "processing",
    })

    await order.save()

    // Clear cart after order is created
    cart.items = []
    await cart.save()

    return NextResponse.json({
      message: "Order created successfully",
      order,
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

