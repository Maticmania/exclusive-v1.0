import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"
import { revalidatePath } from "next/cache";

// Get all addresses for the current user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findById(session.user.id).select("addresses")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user.addresses)
    
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a new address
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addressData = await req.json()

    await connectToDatabase()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If this is the first address or it's set as default, update all other addresses
    if (addressData.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((address) => {
        address.isDefault = false
      })

      // If it's the first address, set it as default regardless
      if (user.addresses.length === 0) {
        addressData.isDefault = true
      }
    }

    // Add the new address
    user.addresses.push(addressData)
    await user.save()

    // Return the newly added address
    const newAddress = user.addresses[user.addresses.length - 1]

    return NextResponse.json(newAddress, { status: 201 })
  } catch (error) {
    console.error("Error adding address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

