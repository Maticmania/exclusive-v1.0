// orders-content.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AccountSidebar from "@/components/profile/account-sidebar";
import { formatDate, formatCurrency } from "@/lib/utils";
import { fetchOrders } from "@/lib/api/orders";
import { Loader2 } from "lucide-react";

export default function OrdersContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/account/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      const loadOrders = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error } = await fetchOrders();
        if (data) {
          setOrders(data || []);
        } else {
          setError(error);
        }
        setIsLoading(false);
      };
      loadOrders();
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            You haven't placed any orders yet.
          </p>
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
                  <p className="font-medium">
                    Order #{order.orderNumber || order._id.slice(-8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.createdAt)} 
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted">
                    {order.orderStatus.charAt(0).toUpperCase() +
                      order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="font-medium">Items: {order.items.length}</p>
                <p className="font-medium">{formatCurrency(order.total)}</p>
              </div>
              <div className="mt-4">
                <Link
                  href={`/account/orders/${order._id}`}
                  className="text-primary hover:underline text-sm"
                >
                  View order details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
