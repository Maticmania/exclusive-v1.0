import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import OrderDetail from "@/components/orders/order-detail"

export async function generateMetadata({ params }) {
  return {
    title: `Order Details | E-commerce`,
    description: `View details for order ${params.id}`,
  }
}

export default async function OrderDetailPage({ params }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/orders")
  }

  const { id } = await params

  if (!id) {
    redirect("/account/orders")
  }
  console.log();
  
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <OrderDetail orderId={id} />
    </div>
  )
    
}