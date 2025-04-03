import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Cart from "@/models/cart"
import Product from "@/models/product"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    let cart = await Cart.findOne({ user: session.user.id }).populate({
      path: "items.product",
      model: Product,
      select: "name price images stock variants",
    })

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] })
      await cart.save()
    }

    // Serialize the cart
    const serializedCart = cart.toJSON()

    return NextResponse.json(serializedCart)
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity, variantId } = await req.json()

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Get product details
    const product = await Product.findById(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if variant exists and get its price
    let price = product.price
    let stockToCheck = product.stock

    if (variantId) {
      const variant = product.variants && product.variants.id(variantId)
      if (variant) {
        price = variant.price
        stockToCheck = variant.stock
      } else {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 })
      }
    }

    // Check if product is in stock
    if (stockToCheck < quantity) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 400 })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: session.user.id })

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] })
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product &&
        item.product.toString() === productId &&
        ((!variantId && !item.variant) || (variantId && item.variant && item.variant.toString() === variantId)),
    )

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      const newItem = {
        product: productId,
        quantity,
        price,
      }

      if (variantId) {
        newItem.variant = variantId
      }

      cart.items.push(newItem)
    }

    await cart.save()

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      model: Product,
      select: "name price images stock variants",
    })

    // Serialize the cart
    const serializedCart = cart.toJSON()

    return NextResponse.json({
      message: "Product added to cart",
      cart: serializedCart,
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

