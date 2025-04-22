import { Suspense } from "react"
import CheckoutForm from "@/components/checkout/checkout-form"
import CheckoutLoading from "./loading"

export const metadata = {
  title: "Checkout",
  description: "Complete your purchase",
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-[5%] py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutForm />
      </Suspense>
    </div>
  )
}
