import { notFound, redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import CategoryForm from "@/components/admin/category-form"
import {connectToDatabase} from "@/lib/mongodb"
import Category from "@/models/category"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Edit Category | Admin Dashboard",
  description: "Edit category details",
}

async function getCategory(id) {
  await connectToDatabase()

  const category = await Category.findById(id).lean()

  if (!category) {
    return null
  }

  return {
    ...category,
    _id: category._id.toString(),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}

export default async function EditCategoryPage({ params }) {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const category = await getCategory(params.id)

  if (!category) {
    notFound()
  }

  return (
    <AdminLayout>
      <CategoryForm category={category} />
    </AdminLayout>
  )
}

