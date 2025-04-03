import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Wishlist from "@/models/wishlist"

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const {productId} = await params

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const wishlist = await Wishlist.findOne({ user: session.user.id })

    if (!wishlist) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 })
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId)

    await wishlist.save()

    return NextResponse.json({
      message: "Product removed from wishlist",
      wishlist,
    })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

