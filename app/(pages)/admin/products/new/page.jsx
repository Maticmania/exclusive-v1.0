import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import ProductForm from "@/components/admin/product-form"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Add Product | Admin Dashboard",
  description: "Add a new product to your store",
}

export default async function NewProductPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  return (
    <AdminLayout>
      <ProductForm />
    </AdminLayout>
  )
}

