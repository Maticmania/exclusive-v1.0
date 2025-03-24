import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import BrandForm from "@/components/admin/brand-form"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Add Brand | Admin Dashboard",
  description: "Add a new product brand",
}

export default async function NewBrandPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  return (
    <AdminLayout>
      <BrandForm />
    </AdminLayout>
  )
}

