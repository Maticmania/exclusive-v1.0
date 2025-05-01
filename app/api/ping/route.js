// pages/api/ping.ts
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const total = await Product.countDocuments();
    return  NextResponse.json({ message: "Ping successful", total });
  } catch (error) {
    console.error("Ping failed:", error);
    return NextResponse.json({ message: "Ping failed" });
  }
}
