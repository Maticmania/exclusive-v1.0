import AccountSidebar from "@/components/profile/account-sidebar"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {connectToDatabase} from "@/lib/mongodb"
import Order from "@/models/order"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "My Orders | E-commerce",
  description: "View your order history",
};

async function getOrders(userId) {
  await connectToDatabase()

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean()

  return orders.map((order) => ({
    ...order,
    _id: order._id.toString(),
    user: order.user.toString(),
    items: order.items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      product: item.product.toString(),
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }))
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/orders")
  }

  const orders = await getOrders(session.user.id)

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 md:hidden">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <AccountSidebar />
        </div>

        <div className="w-full md:w-3/4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>

            {orders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
                <Link href="/products" className="text-primary hover:underline">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                      <div>
                        <p className="font-medium">Order #{order._id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted">
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="font-medium">Items: {order.items.length}</p>
                      <p className="font-medium">Total: ${order.total.toFixed(2)}</p>
                    </div>

                    <div className="mt-4">
                      <Link href={`/account/orders/${order._id}`} className="text-primary hover:underline text-sm">
                        View order details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

