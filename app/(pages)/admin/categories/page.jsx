import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import CategoriesTable from "@/components/admin/categories-table"
import {connectToDatabase} from "@/lib/mongodb"
import Category from "@/models/category"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Categories | Admin Dashboard",
  description: "Manage your product categories",
}

async function getCategories() {
  await connectToDatabase()

  const categories = await Category.find().sort({ name: 1 }).lean()

  return categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }))
}

export default async function CategoriesPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const categories = await getCategories()

  return (
    <AdminLayout>
      <CategoriesTable categories={categories} />
    </AdminLayout>
  )
}

