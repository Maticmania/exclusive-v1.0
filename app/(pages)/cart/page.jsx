import CartPage from "@/components/cart/cart-page"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import Cart from "@/models/cart"
import Product from "@/models/product"

export const metadata = {
  title: "Shopping Cart | Exclusive",
  description: "View and manage your shopping cart",
}

async function getCartItems(userId) {
  try {
    await connectToDatabase()

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      model: Product,
    })

    if (!cart) {
      return []
    }

    return cart.items.map((item) => ({
      id: item._id.toString(),
      product: {
        _id: item.product._id.toString(),
        name: item.product.name,
        price: item.price,
        images: item.product.images || [],
      },
      quantity: item.quantity,
      price: item.price,
    }))
  } catch (error) {
    console.error("Error fetching cart:", error)
    return []
  }
}

export default async function CartPageWrapper() {
  const session = await getServerSession(authOptions)
  const cartItems = session?.user ? await getCartItems(session.user.id) : []

  // Breadcrumb items
  const breadcrumbItems = [{ label: "Cart" }]

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <CartPage initialCartItems={cartItems} />
    </div>
  )
}

