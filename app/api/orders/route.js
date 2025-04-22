import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/order";
import Cart from "@/models/cart";
import Product from "@/models/product";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({ user: session.user.id }).sort({
      createdAt: -1,
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let data;
    try {
      data = await req.json();
    } catch (error) {
      console.error("Invalid JSON:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { shippingAddress, paymentMethod } = data;
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orderItems = [];
    for (const item of cart.items) {
      if (!item.product || !mongoose.isValidObjectId(item.product)) {
        return NextResponse.json(
          { error: `Invalid product ID: ${item.product || "null"}` },
          { status: 400 }
        );
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product}` },
          { status: 404 }
        );
      }
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images?.[product.images.length - 1] || "/placeholder.svg",
      })
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = new Order({
      orderNumber,
      user: session.user.id,
      items: orderItems,
      subtotal: orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      shipping: 0,
      total: orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      shippingAddress: {
        firstName: shippingAddress.firstName || "",
        lastName: shippingAddress.lastName || "",
        street: shippingAddress.street || "",
        apartment: shippingAddress.apartment || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        zipCode: shippingAddress.zipCode || "",
        country: shippingAddress.country || "",
        phoneNumber: shippingAddress.phoneNumber || "",
        emailAddress: shippingAddress.emailAddress || "",
      },
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "processing",
    });

    console.log("Creating order with data:", JSON.stringify(order, null, 2));

    await order.save();
    await Cart.findOneAndUpdate(
      { user: session.user.id },
      { items: [], total: 0 },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.deleteMany({ user: session.user.id });

    return NextResponse.json({
      success: true,
      message: "Order deleted succesfully",
    });
  } catch (error) {
    console.error("Unable to delete orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
