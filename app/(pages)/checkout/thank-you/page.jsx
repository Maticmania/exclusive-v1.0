"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/store/checkout-store";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  const router = useRouter();
  const { orderDetails, clearOrderDetails } = useCheckoutStore();

  console.log("Thank you", orderDetails);

  // Redirect to home if no order details
  useEffect(() => {
    if (!orderDetails) {
      // router.push("/")
    }

    // Clear order details when leaving the page
    // return () => {
    //   clearOrderDetails()
    // }
  }, [orderDetails, router, clearOrderDetails]);

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex flex-col items-center mb-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600 mt-2">
            Your order has been received and is now being processed.
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-sm">Order Number</p>
              <p className="font-semibold">{orderDetails.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total</p>
              <p className="font-semibold">
                {formatCurrency(orderDetails.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {orderDetails.items.map((item) => (
              <div key={item._id} className="flex items-center border-b pb-4">
                <div className="relative w-16 h-16 rounded bg-gray-100 overflow-hidden mr-4">
                  {item.product?.images?.length ? (
                    <Image
                      src={
                        item.product.images[item.product.images.length - 1] ||
                        "/placeholder.svg"
                      }
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      priority={false}
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
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">What happens next?</h3>
          <p className="text-gray-600 text-sm">
            We'll email you an order confirmation with details and tracking
            info.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/account/orders"
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 text-center"
          >
            View Order Status
          </Link>
          <Link
            href="/products"
            className="bg-white text-primary border border-primary py-2 px-6 rounded-md hover:bg-gray-50 text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
