import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import UserManagement from "@/components/admin/user-management"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "User Management | Admin",
  description: "Manage users and their roles",
}

export default async function UsersPage() {
  // Check if user is superadmin
  const isSuperAdmin = await checkServerRole(["superadmin"])

  if (!isSuperAdmin) {
    redirect("/unauthorized")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <UserManagement />
      </div>
    </AdminLayout>
  )
}
