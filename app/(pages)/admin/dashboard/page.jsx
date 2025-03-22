import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import UserManagement from "@/components/admin/user-management"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

export const metadata = {
  title: "Admin Dashboard | E-commerce",
  description: "Manage your e-commerce platform",
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/admin/dashboard")
  }

  // Check if user has admin role
  await connectToDatabase()
  const user = await User.findById(session.user.id)

  if (!user || !["admin", "superadmin"].includes(user.role)) {
    redirect("/unauthorized")
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <UserManagement />
          </div>
        </div>
      </div>
    </div>
  )
}

