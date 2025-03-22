import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectToDatabase(); // Ensure DB connection

    // Handle invalid JSON body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Check for missing fields
    const missingFields = [];
    if (!name) missingFields.push("name is required");
    if (!email) missingFields.push("email is required");
    if (!password) missingFields.push("password is required");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: missingFields.join(", ") },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    // Check if this is the first user in the system
    const userCount = await User.countDocuments()
    const role = userCount === 0 ? "superadmin" : "user"

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password : hashedPassword,
      role,
    })

    await newUser.save()

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
