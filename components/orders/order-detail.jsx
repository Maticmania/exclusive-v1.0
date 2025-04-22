"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Loader2, AlertCircle } from "lucide-react"

export default function OrderDetail({ orderId }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/account/orders")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && orderId) {
      const fetchOrder = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const response = await axios.get(`/api/orders/${orderId}`)
          console.log("Order detail response:", response.data)
          setOrder(response.data)
        } catch (err) {
          console.error("Error fetching order:", err)
          setError(err.response?.data?.error || "Failed to load order details")
        } finally {
          setIsLoading(false)
        }
      }
      fetchOrder()
    }
  }, [status, orderId])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/account/orders" className="text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link href="/account/orders" className="text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Order #{order.orderNumber || order._id.slice(-8)}
          </h2>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-muted">
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="border-t pt-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded bg-gray-100 overflow-hidden">
                {item.product?.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.name || "Product"}
                    fill
                    sizes="64px"
                    className="object-cover"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhPPQAI9gMhT5/UAQAAAABJRU5ErkJggg=="
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.product?.name || "Unknown Product"}</h4>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.apartment && `${order.shippingAddress.apartment}, `}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            <br />
            {order.shippingAddress.country}
            <br />
            {order.shippingAddress.phoneNumber}
            <br />
            {order.shippingAddress.emailAddress}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-medium text-foreground">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Link href="/account/orders" className="text-primary hover:underline">
          Back to orders
        </Link>
        <Link
          href="/products"
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}