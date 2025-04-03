"use client"
import { ShoppingBag } from "lucide-react"
import AddToCartButton from "./add-to-cart-button"

export default function BuyNowButton({ product, className, variant = null, quantity = 1 }) {
  return (
    <AddToCartButton
      product={product}
      variant={variant}
      quantity={quantity}
      buttonText="Buy Now"
      className={className}
      buyNow={true}
    >
      <ShoppingBag className="mr-2 h-4 w-4" />
      Buy Now
    </AddToCartButton>
  )
}

