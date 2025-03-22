import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Update an address
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addressData = await req.json()
    const addressId = params.id

    await connectToDatabase()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the address to update
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // If this address is being set as default, update all other addresses
    if (addressData.isDefault && !user.addresses[addressIndex].isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false
      })
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...addressData,
    }

    await user.save()

    return NextResponse.json(user.addresses[addressIndex])
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete an address
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addressId = params.id

    await connectToDatabase()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the address to delete
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Check if this is the default address
    const isDefault = user.addresses[addressIndex].isDefault

    // Remove the address
    user.addresses.splice(addressIndex, 1)

    // If the deleted address was the default and there are other addresses,
    // set the first one as default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    await user.save()

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

