import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

// Get all payment options for the current user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findById(session.user.id).select("paymentOptions")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Mask card numbers before sending to client
    const maskedPaymentOptions = user.paymentOptions.map((option) => {
      const cardObj = option.toObject ? option.toObject() : option
      return {
        ...cardObj,
        _id: cardObj._id.toString(),
        cardNumber: maskCardNumber(cardObj.cardNumber),
        // Don't send the full card number to the client
        fullCardNumber: undefined,
      }
    })

    return NextResponse.json(maskedPaymentOptions)
  } catch (error) {
    console.error("Error fetching payment options:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a new payment option
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentData, password } = await req.json()

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

    // If this is the first payment option or it's set as default, update all other options
    if (paymentData.isDefault || user.paymentOptions.length === 0) {
      user.paymentOptions.forEach((option) => {
        option.isDefault = false
      })

      // If it's the first payment option, set it as default regardless
      if (user.paymentOptions.length === 0) {
        paymentData.isDefault = true
      }
    }

    // Add the new payment option
    user.paymentOptions.push({
      ...paymentData,
      lastUpdated: new Date(),
    })

    await user.save()

    // Return the newly added payment option (masked)
    const newOption = user.paymentOptions[user.paymentOptions.length - 1].toObject()
    newOption._id = newOption._id.toString()
    newOption.cardNumber = maskCardNumber(newOption.cardNumber)

    return NextResponse.json(newOption, { status: 201 })
  } catch (error) {
    console.error("Error adding payment option:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to mask card number
function maskCardNumber(cardNumber) {
  if (!cardNumber) return ""
  // Remove spaces
  const cleaned = cardNumber.replace(/\s/g, "")
  // Keep first 4 and last 4 digits visible, mask the rest
  const firstFour = cleaned.slice(0, 4)
  const lastFour = cleaned.slice(-4)
  const maskedPart = "*".repeat(cleaned.length - 8)
  return `${firstFour}${maskedPart}${lastFour}`
}

