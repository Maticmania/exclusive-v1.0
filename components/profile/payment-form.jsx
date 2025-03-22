"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Check, CreditCard } from "lucide-react"
import { toast } from "sonner"

export default function PaymentForm({
  paymentOption = null,
  onSave,
  onCancel,
  isNew = false,
  passwordConfirmed = false,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cardName: paymentOption?.cardName || "",
      cardNumber: paymentOption?.cardNumber || "",
      expiryMonth: paymentOption?.expiryMonth || "",
      expiryYear: paymentOption?.expiryYear || "",
      cvv: "",
      isDefault: paymentOption?.isDefault || false,
    },
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Extract CVV from data (we don't need to pass it to the server)
      const { cvv, ...paymentData } = data

      // Call the provided onSave function with the payment data
      // Password is already confirmed and stored in the parent component
      const result = await onSave(paymentData)

      if (result.success) {
        toast.success(isNew ? "Payment method added" : "Payment method updated", {
          description: isNew
            ? "Your payment method has been added successfully."
            : "Your payment method has been updated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to save payment method")
      }
    } catch (error) {
      console.error("Error saving payment method:", error)
      toast.error("Failed to save payment method", {
        description: error.message || "Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format card number with spaces
  const formatCardNumber = (value) => {
    if (!value) return value
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "")
    // Add a space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ")
    return formatted
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardName">Name on Card</Label>
        <Input
          id="cardName"
          {...register("cardName", { required: "Name on card is required" })}
          placeholder="John Doe"
        />
        {errors.cardName && <p className="text-sm text-red-500">{errors.cardName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            {...register("cardNumber", {
              required: "Card number is required",
              pattern: {
                value: /^[\d\s]{13,19}$/,
                message: "Please enter a valid card number",
              },
              onChange: (e) => {
                e.target.value = formatCardNumber(e.target.value)
              },
            })}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
          <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryMonth">Expiry Month</Label>
          <Input
            id="expiryMonth"
            {...register("expiryMonth", {
              required: "Expiry month is required",
              pattern: {
                value: /^(0[1-9]|1[0-2])$/,
                message: "Please enter a valid month (01-12)",
              },
            })}
            placeholder="MM"
            maxLength={2}
          />
          {errors.expiryMonth && <p className="text-sm text-red-500">{errors.expiryMonth.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryYear">Expiry Year</Label>
          <Input
            id="expiryYear"
            {...register("expiryYear", {
              required: "Expiry year is required",
              pattern: {
                value: /^(2[3-9]|[3-9][0-9])$/,
                message: "Please enter a valid year (YY)",
              },
            })}
            placeholder="YY"
            maxLength={2}
          />
          {errors.expiryYear && <p className="text-sm text-red-500">{errors.expiryYear.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cvv">CVV</Label>
        <Input
          id="cvv"
          type="password"
          {...register("cvv", {
            required: "CVV is required",
            pattern: {
              value: /^[0-9]{3,4}$/,
              message: "Please enter a valid CVV",
            },
          })}
          placeholder="123"
          maxLength={4}
        />
        {errors.cvv && <p className="text-sm text-red-500">{errors.cvv.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={watch("isDefault")}
          onCheckedChange={(checked) => {
            const event = {
              target: {
                name: "isDefault",
                value: checked,
              },
            }
            register("isDefault").onChange(event)
          }}
        />
        <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
          Set as default payment method
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-1">
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-1">
          <Check className="h-4 w-4" />
          <span>{isSubmitting ? "Saving..." : "Save Payment Method"}</span>
        </Button>
      </div>
    </form>
  )
}

