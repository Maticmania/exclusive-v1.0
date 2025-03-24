import { notFound, redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import ProductForm from "@/components/admin/product-form"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Edit Product | Admin Dashboard",
  description: "Edit product details",
}

async function getProduct(id) {
  await connectToDatabase()

  const product = await Product.findById(id).populate("category", "name").populate("brand", "name").lean()

  if (!product) {
    return null
  }

  return {
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
  }
}

export default async function EditProductPage({ params }) {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <AdminLayout>
      <ProductForm product={product} />
    </AdminLayout>
  )
}

