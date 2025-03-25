import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

// Update a payment option
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentData, password } = await req.json()
    const {id} = await params
    const paymentId = id

    if (!paymentData || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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

    // Find the payment option to update
    const paymentIndex = user.paymentOptions.findIndex((option) => option._id.toString() === paymentId)

    if (paymentIndex === -1) {
      return NextResponse.json({ error: "Payment option not found" }, { status: 404 })
    }

    // If this payment option is being set as default, update all other options
    if (paymentData.isDefault && !user.paymentOptions[paymentIndex].isDefault) {
      user.paymentOptions.forEach((option) => {
        option.isDefault = false
      })
    }

    // Update the payment option
    const updatedOption = {
      ...user.paymentOptions[paymentIndex].toObject(),
      ...paymentData,
      lastUpdated: new Date(),
    }

    user.paymentOptions[paymentIndex] = updatedOption

    await user.save()

    // Mask card number before sending response
    updatedOption._id = updatedOption._id.toString()
    updatedOption.cardNumber = maskCardNumber(updatedOption.cardNumber)

    return NextResponse.json(updatedOption)
  } catch (error) {
    console.error("Error updating payment option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a payment option
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {id} = await params
    const paymentId = id
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

    // Find the payment option to delete
    const paymentIndex = user.paymentOptions.findIndex((option) => option._id.toString() === paymentId)

    if (paymentIndex === -1) {
      return NextResponse.json({ error: "Payment option not found" }, { status: 404 })
    }

    // Check if this is the default payment option
    const isDefault = user.paymentOptions[paymentIndex].isDefault

    // Remove the payment option
    user.paymentOptions.splice(paymentIndex, 1)

    // If the deleted option was the default and there are other options,
    // set the first one as default
    if (isDefault && user.paymentOptions.length > 0) {
      user.paymentOptions[0].isDefault = true
    }

    await user.save()

    return NextResponse.json({ message: "Payment option deleted successfully" })
  } catch (error) {
    console.error("Error deleting payment option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to mask card number
function maskCardNumber(cardNumber) {
  if (!cardNumber) return ""
  // Keep first 4 and last 4 digits visible, mask the rest
  const firstFour = cardNumber.slice(0, 4)
  const lastFour = cardNumber.slice(-4)
  const maskedPart = "*".repeat(cardNumber.length - 8)
  return `${firstFour}${maskedPart}${lastFour}`
}

