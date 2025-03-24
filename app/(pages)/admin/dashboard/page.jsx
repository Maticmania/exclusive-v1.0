import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tags, BadgePercent, ShoppingCart } from "lucide-react"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import Category from "@/models/category"
import Brand from "@/models/brand"
import Order from "@/models/order"
import { checkServerRole } from "@/lib/server-auth"

export const metadata = {
  title: "Dashboard | Admin",
  description: "Admin dashboard overview",
}

async function getDashboardStats() {
  await connectToDatabase()

  const productsCount = await Product.countDocuments()
  const categoriesCount = await Category.countDocuments()
  const brandsCount = await Brand.countDocuments()
  const ordersCount = await Order.countDocuments()

  return {
    productsCount,
    categoriesCount,
    brandsCount,
    ordersCount,
  }
}

export default async function DashboardPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const stats = await getDashboardStats()

  return (
    <AdminLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
            <p className="text-xs text-muted-foreground">Products in your store</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <BadgePercent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.brandsCount}</div>
            <p className="text-xs text-muted-foreground">Product brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersCount}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Welcome to your admin dashboard. From here, you can manage your products, categories, brands, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

