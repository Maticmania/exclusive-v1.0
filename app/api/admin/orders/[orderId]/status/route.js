import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Order from "@/models/order"
import { checkApiRole } from "@/lib/auth-middleware"

export async function PUT(request, { params }) {
  try {
    // Check if user is admin or superadmin
    const authCheck = await checkApiRole(request, ["admin", "superadmin"])
    if (!authCheck.success) {
      return NextResponse.json({ error: authCheck.message }, { status: authCheck.status })
    }

    const { orderId } = await params
    const { orderStatus } = await request.json()

    // Validate orderStatus
    const validStatuses = ["returned", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await connectToDatabase()

    // Find and update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    )

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
