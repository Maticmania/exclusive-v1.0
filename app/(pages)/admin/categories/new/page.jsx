import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import CategoryForm from "@/components/admin/category-form"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Add Category | Admin Dashboard",
  description: "Add a new product category",
}

export default async function NewCategoryPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  return (
    <AdminLayout>
      <CategoryForm />
    </AdminLayout>
  )
}

