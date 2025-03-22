import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

// Update user role (superadmin only)
export async function PUT(req) {
  try {
    const { authorized, session, error } = await hasRole("superadmin")

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const { userId, role } = await req.json()

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate role
    if (!["user", "admin", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await connectToDatabase()

    // Prevent superadmin from changing their own role
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
    }

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.role = role
    await user.save()

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

