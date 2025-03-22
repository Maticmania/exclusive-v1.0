import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

// Get all users (admin and superadmin only)
export async function GET(req) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    await connectToDatabase()

    const users = await User.find().select("-password").sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

