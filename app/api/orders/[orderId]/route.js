import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Order from "@/models/order"
import Product from "@/models/product"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const {orderId} = await params

    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
    }).populate({
      path: "items.product",
      model: Product,
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderStatus } = await req.json()

    if (!orderStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()
    const {orderId} = await params

    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Only allow cancellation if order is still processing
    if (orderStatus === "cancelled" && order.orderStatus !== "processing") {
      return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 })
    }

    order.orderStatus = orderStatus
    await order.save()

    return NextResponse.json({
      message: "Order updated successfully",
      order,
    })
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

