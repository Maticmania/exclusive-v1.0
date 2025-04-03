import CartPage from "@/components/cart/cart-page"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Shopping Cart | Exclusive",
  description: "View and manage your shopping cart",
}

export default function CartPageWrapper() {
  // Breadcrumb items
  const breadcrumbItems = [{ label: "Cart" }]

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <CartPage />
    </div>
  )
}

