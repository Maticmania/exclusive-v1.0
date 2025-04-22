import { NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    // Test database connection
    await connectToDatabase()

    return NextResponse.json({
      status: "ok",
      database: "connected",
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
