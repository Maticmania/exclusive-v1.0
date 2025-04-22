import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Order from "@/models/order"
import Product from "@/models/product"
import mongoose from "mongoose"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = params
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return NextResponse.json({ error: `Invalid Order ID: ${orderId}` }, { status: 400 })
    }

    await connectToDatabase()

    const order = await Order.findOne({ _id: orderId, user: session.user.id }).lean()
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Manually populate each item.product
    const itemsWithProduct = await Promise.all(
      order.items.map(async (item) => {
        let productData = null
        if (mongoose.isValidObjectId(item.product)) {
          const product = await Product.findOne(item.product).lean()
          if (product) {
            productData = {
              _id: product._id,
              name: product.name || "Unknown Product",
              image:
                product.images?.length > 0
                  ? product.images[product.images.length - 1]
                  : "/placeholder.svg",
            }
          }
        }

        return {
          ...item,
          _id: item._id,
          product: productData || {
            _id: item.product,
            name: "Unknown Product",
            image: "/placeholder.svg",
          },
        }
      })
    )

    const transformedOrder = {
      ...order,
      _id: order._id,
      user: order.user,
      items: itemsWithProduct,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
    }

    return NextResponse.json(transformedOrder)
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

