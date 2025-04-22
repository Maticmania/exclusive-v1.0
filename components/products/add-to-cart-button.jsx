"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

export default function AddToCartButton({
  product,
  className,
  buttonText = "Add To Cart",
  variant = null,
  quantity = 1,
  buyNow = false,
}) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const { addItem, items } = useCartStore();

  // Check if product is already in cart
  useEffect(() => {
    if (!product || !product._id) {
      console.warn("AddToCartButton: Product is invalid or missing _id", product);
      setIsInCart(false);
      return;
    }

    const productInCart = items.find((item) => {
      if (!item.product || !item.product._id) return false; // Safeguard for cart items
      return (
        item.product._id === product._id &&
        ((!variant && !item.variant) || 
         (variant && item.variant && item.variant === (variant._id || variant)))
      );
    });
    setIsInCart(!!productInCart);
  }, [items, product, variant]); // Removed product._id, variant from deps since we check product directly

  const handleAddToCart = async () => {
    if (isInCart && !buyNow) return;
    if (!product || !product._id) {
      toast.error("Invalid product");
      return;
    }

    setIsAddingToCart(true);

    try {
      // Get the variant ID if a variant is selected
      const variantId = variant && variant._id ? variant._id : null;

      // Add to local store first for immediate feedback
      addItem(product, quantity, variantId);

      // Then sync with server
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          variantId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      setIsInCart(true);
      
      if (!buyNow) {
        toast.success("Added to cart", {
          description: `${product.name} has been added to your cart.`,
        });
      } else {
        router.push("/checkout");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Early return if product is invalid
  if (!product || !product._id) {
    return <Button disabled className={className}>Invalid Product</Button>;
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAddingToCart || product.stock <= 0 || (isInCart && !buyNow)}
      className={className}
    >
      {isAddingToCart ? (
        "Adding..."
      ) : product.stock <= 0 ? (
        "Out of Stock"
      ) : isInCart && !buyNow ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}