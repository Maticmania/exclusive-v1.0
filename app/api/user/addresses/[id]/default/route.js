import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

// Set an address as default
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const {id} = await params

    const addressId = id

    await connectToDatabase()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the address to set as default
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Update all addresses to not be default
    user.addresses.forEach((address) => {
      address.isDefault = false
    })

    // Set the selected address as default
    user.addresses[addressIndex].isDefault = true

    await user.save()

    return NextResponse.json({
      message: "Default address updated successfully",
    })
  } catch (error) {
    console.error("Error setting default address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

