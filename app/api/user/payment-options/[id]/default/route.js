import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

// Set a payment option as default
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentId = params.id
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Find the payment option to set as default
    const paymentIndex = user.paymentOptions.findIndex((option) => option._id.toString() === paymentId)

    if (paymentIndex === -1) {
      return NextResponse.json({ error: "Payment option not found" }, { status: 404 })
    }

    // Update all payment options to not be default
    user.paymentOptions.forEach((option) => {
      option.isDefault = false
    })

    // Set the selected payment option as default
    user.paymentOptions[paymentIndex].isDefault = true

    await user.save()

    return NextResponse.json({
      message: "Default payment option updated successfully",
    })
  } catch (error) {
    console.error("Error setting default payment option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

