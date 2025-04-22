import { NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import Order from "@/models/order"
import { checkApiRole } from "@/lib/auth-middleware"

export async function GET(request) {
  try {
    // Check if user is admin or superadmin
    const authCheck = await checkApiRole(request, ["admin", "superadmin"])
    if (!authCheck.success) {
      return NextResponse.json({ error: authCheck.message }, { status: authCheck.status })
    }

    await connectToDatabase()

    // Get all orders, sorted by createdAt in descending order
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate("user", "firstName lastName email").lean()

    // Convert MongoDB _id to string
    const formattedOrders = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user
        ? {
            ...order.user,
            _id: order.user._id.toString(),
          }
        : null,
      items: order.items.map((item) => ({
        ...item,
        _id: item._id.toString(),
        product: item.product ? item.product.toString() : null,
      })),
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
