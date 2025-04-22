import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Cart from "@/models/cart"

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Find user's cart
    const cart = await Cart.findOne({ user: session.user.id })

    if (cart) {
      // Clear all items
      cart.items = []
      await cart.save()
    }

    return NextResponse.json({
      message: "Cart cleared successfully",
      cart: { items: [], total: 0 },
    })
  } catch (error) {
    console.error("Clear cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
