import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import StoreSettings from "@/components/admin/store-settings"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Store Settings | Admin",
  description: "Configure store settings",
}

export default async function SettingsPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <StoreSettings />
      </div>
    </AdminLayout>
  )
}
