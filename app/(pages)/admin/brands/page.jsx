import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import BrandsTable from "@/components/admin/brands-table"
import {connectToDatabase} from "@/lib/mongodb"
import Brand from "@/models/brand"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Brands | Admin Dashboard",
  description: "Manage your product brands",
}

async function getBrands() {
  await connectToDatabase()

  const brands = await Brand.find().sort({ name: 1 }).lean()

  return brands.map((brand) => ({
    ...brand,
    _id: brand._id.toString(),
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  }))
}

export default async function BrandsPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const brands = await getBrands()

  return (
    <AdminLayout>
      <BrandsTable brands={brands} />
    </AdminLayout>
  )
}

