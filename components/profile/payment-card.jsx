"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, CreditCard } from "lucide-react"

export default function PaymentCard({ paymentOption, onEdit, onDelete, onSetDefault }) {
  // Get card type based on first digit
  const getCardType = (cardNumber) => {
    if (!cardNumber) return "Card"
    const firstDigit = cardNumber.replace(/\s/g, "").charAt(0)

    switch (firstDigit) {
      case "4":
        return "Visa"
      case "5":
        return "MasterCard"
      case "3":
        return "Amex"
      case "6":
        return "Discover"
      default:
        return "Card"
    }
  }

  const cardType = getCardType(paymentOption.cardNumber)

  return (
    <div className="border rounded-lg p-4 relative">
      {paymentOption.isDefault && (
        <Badge className="absolute top-2 right-2" variant="secondary">
          Default
        </Badge>
      )}

      <div className="flex items-start gap-3 mb-4">
        <CreditCard className="h-6 w-6 mt-1 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">
            {cardType} •••• {paymentOption.cardNumber.slice(-4)}
          </p>
          <p className="text-sm text-muted-foreground">{paymentOption.cardName}</p>
          <p className="text-sm text-muted-foreground">
            Expires: {paymentOption.expiryMonth}/{paymentOption.expiryYear}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(paymentOption)} className="flex items-center gap-1">
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>

        {!paymentOption.isDefault && (
          <Button variant="outline" size="sm" onClick={() => onSetDefault(paymentOption._id)}>
            Set as Default
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-1"
          onClick={() => onDelete(paymentOption._id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  )
}

