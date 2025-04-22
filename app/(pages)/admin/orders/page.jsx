import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import OrdersTable from "@/components/admin/orders-table"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Orders Management | Admin",
  description: "Manage all customer orders",
}

export default async function OrdersPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <OrdersTable />
      </div>
    </AdminLayout>
  )
}
