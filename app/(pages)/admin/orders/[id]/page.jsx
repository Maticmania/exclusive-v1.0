import { redirect } from "next/navigation"
import Link from "next/link"
import AdminLayout from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { checkServerRole } from "@/lib/server-auth"
import {connectToDatabase} from "@/lib/mongodb"
import Order from "@/models/order"
import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "Order Details | Admin",
  description: "View and manage order details",
}

async function getOrder(id) {
  await connectToDatabase()

  try {
    const order = await Order.findById(id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price images slug")
      .lean()

    if (!order) {
      return null
    }

    // Convert MongoDB _id to string
    order._id = order._id.toString()

    // Convert other ObjectIds to strings
    if (order.user) {
      order.user._id = order.user._id.toString()
    }

    order.items = order.items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      product: item.product
        ? {
            ...item.product,
            _id: item.product._id.toString(),
          }
        : null,
    }))

    return order
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

export default async function OrderDetailPage({ params }) {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const order = await getOrder(params.id)

  if (!order) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground">Order not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Package className="h-5 w-5 text-yellow-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      returned: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Order Details</h1>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                  <p>{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className='capitalize font-semibold'>{order.paymentMethod || "Credit Card"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                  <Badge className='capitalize' variant={order.paymentStatus ? "success" : "outline"}>{order.paymentStatus}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.user ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{order.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p>{order.phoneNumber}</p>
                  </div>
                </>
              ) : (
                <p>Guest Order</p>
              )}

              {order.shippingAddress && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shipping Address</p>
                  <p>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.product && (
                            <>
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={item.product.images?.[0] || "/placeholder.svg?height=40&width=40"}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                              <div className="ml-4">
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  className="text-sm font-medium text-gray-900 hover:text-primary"
                                >
                                  {item.product.name}
                                </Link>
                              </div>
                            </>
                          )}
                          {!item.product && (
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">Product not available</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-2 text-right">
              <div className="flex justify-end">
                <span className="text-sm font-medium text-muted-foreground w-24">Subtotal:</span>
                <span className="text-sm ml-2">${order.subtotal}</span>
              </div>
              <div className="flex justify-end">
                <span className="text-sm font-medium text-muted-foreground w-24">Shipping:</span>
                <span className="text-sm ml-2">${order.shipping}</span>
              </div>
              <div className="flex justify-end border-t pt-2 mt-2">
                <span className="font-medium w-24">Total:</span>
                <span className="font-bold ml-2">${order.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
