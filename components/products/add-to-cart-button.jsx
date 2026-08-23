"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useAuthStore } from "@/store/auth-store";
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
  const { isAuthenticated } = useAuthStore();

  // Check if product is already in cart
  useEffect(() => {
    if (!product || !product._id) {
      console.warn("AddToCartButton: Product is invalid or missing _id", product);
      setIsInCart(false);
      return;
    }

    const productInCart = items.find((item) => {
      if (!item.product || !item.product._id) return false;
      return (
        item.product._id === product._id &&
        ((!variant && !item.variant) ||
          (variant && item.variant && item.variant === (variant._id || variant)))
      );
    });
    setIsInCart(!!productInCart);
  }, [items, product, variant]);

  const handleAddToCart = async () => {
    if (isInCart && !buyNow) return;
    if (!product || !product._id) {
      toast.error("Invalid product");
      return;
    }

    setIsAddingToCart(true);

    try {
      const variantId = variant && variant._id ? variant._id : null;

      // Always add to local store immediately — works for guests too
      addItem(product, quantity, variantId);

      if (isAuthenticated) {
        // Only call the server when the user is logged in
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id, quantity, variantId }),
        });

        if (!response.ok) {
          // Item is already in local store; server sync failed but it's non-fatal
          console.warn("Server cart sync failed — item kept in local cart");
        }
      }

      setIsInCart(true);

      if (!buyNow) {
        toast.success("Added to cart", {
          description: isAuthenticated
            ? `${product.name} has been added to your cart.`
            : `${product.name} added. Sign in to save your cart.`,
        });
      } else {
        router.push("/checkout");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Item is already in local store — don't show a hard error
      toast.success("Added to cart", {
        description: `${product.name} has been added to your cart.`,
      });
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