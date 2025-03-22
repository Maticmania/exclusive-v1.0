import AccountSidebar from "@/components/profile/account-sidebar"
import PaymentManager from "@/components/profile/payment-manager"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

export const metadata = {
  title: "Payment Options | E-commerce",
  description: "Manage your payment methods",
}

// This function will be used to fetch payment options from the server
async function getPaymentOptions(userId) {
  await connectToDatabase()

  const user = await User.findById(userId).select("paymentOptions").lean()

  if (!user) {
    return []
  }

  // Mask card numbers before sending to client
  return user.paymentOptions.map((option) => ({
    ...option,
    _id: option._id.toString(),
    cardNumber: maskCardNumber(option.cardNumber),
  }))
}

// Helper function to mask card number
function maskCardNumber(cardNumber) {
  if (!cardNumber) return ""
  // Keep first 4 and last 4 digits visible, mask the rest
  const firstFour = cardNumber.slice(0, 4)
  const lastFour = cardNumber.slice(-4)
  const maskedPart = "*".repeat(cardNumber.length - 8)
  return `${firstFour}${maskedPart}${lastFour}`
}

export default async function PaymentPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/payment")
  }

  const paymentOptions = await getPaymentOptions(session.user.id)

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 md:hidden">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <AccountSidebar />
        </div>

        <div className="w-full md:w-3/4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <PaymentManager initialPaymentOptions={paymentOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

