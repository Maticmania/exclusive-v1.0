"use client"

import { useState, useEffect } from "react"
import { BsCart3 } from "react-icons/bs"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/auth-store"
import CartSidebar from "./cart-sidebar"

export default function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const { items, syncWithServer } = useCartStore()

  // Sync with server when component mounts
  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  // Update item count when items change
  useEffect(() => {
    setItemCount(items.length)
  }, [items])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCartOpen(true)}
        className="relative p-0 bg-transparent hover:bg-transparent"
      >
        <BsCart3 className="h-5 w-5 text-black" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

