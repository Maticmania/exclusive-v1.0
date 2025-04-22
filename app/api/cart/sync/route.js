import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Cart from "@/models/cart"
import Product from "@/models/product"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items } = await req.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 })
    }

    await connectToDatabase()

    // Find or create the user's cart
    let cart = await Cart.findOne({ user: session.user.id })
    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] })
    }

    // Process each item from the local storage cart
    for (const item of items) {
      // Validate required fields
      if (!item.productId || !item.quantity) {
        continue // Skip invalid items
      }

      // Get product details from database
      const product = await Product.findById(item.productId)
      if (!product) {
        continue // Skip if product not found
      }

      // Determine price (variant or product price)
      let price = product.price
      let variantId = item.variantId

      // If variant specified, validate and get its price
      if (variantId) {
        const variant = product.variants && product.variants.id(variantId)
        if (variant) {
          price = variant.price || price
        } else {
          variantId = undefined // Reset if variant not found
        }
      }

      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        (cartItem) =>
          cartItem.product.toString() === item.productId &&
          ((!variantId && !cartItem.variant) ||
            (variantId && cartItem.variant && cartItem.variant.toString() === variantId)),
      )

      if (existingItemIndex > -1) {
        // Update quantity if product already in cart
        cart.items[existingItemIndex].quantity = item.quantity
        cart.items[existingItemIndex].price = price
      } else {
        // Add new item to cart
        const newItem = {
          product: item.productId,
          quantity: item.quantity,
          price,
        }

        if (variantId) {
          newItem.variant = variantId
        }

        cart.items.push(newItem)
      }
    }

    // Save updated cart
    await cart.save()

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      model: Product,
      select: "name price images stock variants slug",
    })

    // Serialize the cart
    const serializedCart = cart.toJSON ? cart.toJSON() : JSON.parse(JSON.stringify(cart))

    return NextResponse.json({
      message: "Cart synced successfully",
      cart: serializedCart,
    })
  } catch (error) {
    console.error("Cart sync error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
