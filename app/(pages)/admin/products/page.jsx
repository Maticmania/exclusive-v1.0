import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import ProductsTable from "@/components/admin/products-table"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Products | Admin Dashboard",
  description: "Manage your products",
}

async function getProducts() {
  await connectToDatabase()

  const products = await Product.find()
    .populate("category", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 })
    .lean()

  return products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    category: product.category
      ? {
          _id: product.category._id.toString(),
          name: product.category.name,
        }
      : null,
    brand: product.brand
      ? {
          _id: product.brand._id.toString(),
          name: product.brand.name,
        }
      : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }))
}

export default async function ProductsPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const products = await getProducts()

  return (
    <AdminLayout>
      <ProductsTable products={products} />
    </AdminLayout>
  )
}

