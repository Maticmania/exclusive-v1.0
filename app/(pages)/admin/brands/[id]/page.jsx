import { notFound, redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import BrandForm from "@/components/admin/brand-form"
import {connectToDatabase} from "@/lib/mongodb"
import Brand from "@/models/brand"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Edit Brand | Admin Dashboard",
  description: "Edit brand details",
}

async function getBrand(id) {
  await connectToDatabase()

  const brand = await Brand.findById(id).lean()

  if (!brand) {
    return null
  }

  return {
    ...brand,
    _id: brand._id.toString(),
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  }
}

export default async function EditBrandPage({ params }) {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }
  const {id} = await params

  const brand = await getBrand(id)

  if (!brand) {
    notFound()
  }

  return (
    <AdminLayout>
      <BrandForm brand={brand} />
    </AdminLayout>
  )
}

