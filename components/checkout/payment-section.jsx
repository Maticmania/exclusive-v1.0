"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCard, Building, Check } from "lucide-react"

export default function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  selectedPaymentOption,
  setSelectedPaymentOption,
}) {
  const { data: session } = useSession()
  const [savedPaymentOptions, setSavedPaymentOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user's saved payment options if logged in
  useEffect(() => {
    async function fetchPaymentOptions() {
      if (session?.user) {
        setIsLoading(true)
        try {
          const response = await fetch("/api/user/payment-options")
          const data = await response.json()
          if (data.success) {
            setSavedPaymentOptions(data.paymentOptions || [])
            // Set default payment option if available
            const defaultOption = data.paymentOptions?.find((option) => option.isDefault)
            if (defaultOption) {
              setSelectedPaymentOption(defaultOption)
            }
          }
        } catch (error) {
          console.error("Error fetching payment options:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchPaymentOptions()
  }, [session, setSelectedPaymentOption])

  // Format card number for display (e.g., **** **** **** 1234)
  const formatCardNumber = (number) => {
    if (!number) return ""
    const last4 = number.slice(-4)
    return `•••• •••• •••• ${last4}`
  }

  // Get card type icon based on card number
  const getCardTypeIcon = (number) => {
    if (!number) return null
    // Simple detection based on first digit
    const firstDigit = number.charAt(0)
    if (firstDigit === "4") return "/images/payment/visa.svg" // Visa
    if (firstDigit === "5") return "/images/payment/mastercard.svg" // Mastercard
    if (firstDigit === "3") return "/images/payment/amex.svg" // Amex
    if (firstDigit === "6") return "/images/payment/discover.svg" // Discover
    return null
  }

  return (
    <div className="space-y-6">
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
        <div className="space-y-3">
          <div
            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
              paymentMethod === "card" ? "border-primary bg-primary/5" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="card" id="card" className="mt-1" />
            <div className="flex w-full items-center justify-between ml-3">
              <div className="flex items-center">
                <div className="text-sm">
                  <Label
                    htmlFor="card"
                    className={`font-medium ${paymentMethod === "card" ? "text-primary" : "text-gray-900"}`}
                  >
                    Credit / Debit Card
                  </Label>
                  <p className="text-gray-500 text-xs">Pay with your card</p>
                </div>
              </div>
              <CreditCard
                className={`h-6 w-6 ${paymentMethod === "card" ? "text-primary" : "text-gray-400"}`}
              />
            </div>
          </div>

          <div
            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
              paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="bank" id="bank" className="mt-1" />
            <div className="flex w-full items-center justify-between ml-3">
              <div className="flex items-center">
                <div className="text-sm">
                  <Label
                    htmlFor="bank"
                    className={`font-medium ${paymentMethod === "bank" ? "text-primary" : "text-gray-900"}`}
                  >
                    Bank Transfer
                  </Label>
                  <p className="text-gray-500 text-xs">Pay directly from your bank account</p>
                </div>
              </div>
              <Building
                className={`h-6 w-6 ${paymentMethod === "bank" ? "text-primary" : "text-gray-400"}`}
              />
            </div>
          </div>
        </div>
      </RadioGroup>

      {/* Saved Payment Options */}
      {paymentMethod === "card" && session?.user && savedPaymentOptions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Your Cards</h4>
          <div className="space-y-2">
            {savedPaymentOptions.map((option) => (
              <div
                key={option._id}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedPaymentOption?._id === option._id ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
                onClick={() => setSelectedPaymentOption(option)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {option.cardNumber && getCardTypeIcon(option.cardNumber) && (
                      <img
                        src={getCardTypeIcon(option.cardNumber) || "/placeholder.svg"}
                        alt="Card type"
                        className="h-8 w-8 object-contain"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{formatCardNumber(option.cardNumber)}</p>
                      <p className="text-xs text-gray-500">
                        Expires {option.expiryMonth}/{option.expiryYear}
                      </p>
                    </div>
                  </div>
                  {selectedPaymentOption?._id === option._id && <Check className="h-5 w-5 text-primary" />}
                </div>
                {option.isDefault && (
                  <div className="mt-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Card Form */}
      {paymentMethod === "card" && (!session?.user || savedPaymentOptions.length === 0) && (
        <div className="mt-4 border rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-2">
            {session?.user
              ? "You don't have any saved payment methods. Add a card to continue."
              : "Please enter your card details to continue."}
          </p>
          <div className="space-y-3">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiry"
                  placeholder="MM/YY"
                  className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  id="cvc"
                  placeholder="123"
                  className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Instructions */}
      {paymentMethod === "bank" && (
        <div className="mt-4 border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-sm mb-2">Bank Transfer Instructions</h4>
          <p className="text-sm text-gray-600 mb-2">Please use the following details to make your bank transfer:</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Account Name:</span> Your Store Name
            </p>
            <p>
              <span className="font-medium">Account Number:</span> 1234567890
            </p>
            <p>
              <span className="font-medium">Bank:</span> Example Bank
            </p>
            <p>
              <span className="font-medium">Sort Code:</span> 12-34-56
            </p>
            <p>
              <span className="font-medium">Reference:</span> Your Order Number
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Your order will be processed once we receive your payment. This typically takes 1-2 business days.
          </p>
        </div>
      )}
    </div>
  )
}