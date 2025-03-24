import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { checkServerRole } from "@/lib/server-auth"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import Order from "@/models/order"
import User from "@/models/user"
import { formatCurrency } from "@/lib/utils"
import {
  RevenueChart,
  RecentOrdersCard,
  TopProductsCard,
  InventoryStatusCard,
} from "@/components/admin/dashboard-charts"

export const metadata = {
  title: "Management Dashboard | Admin",
  description: "Admin management dashboard",
}

async function getDashboardStats() {
  await connectToDatabase()

  // Get counts
  const productsCount = await Product.countDocuments()
  const ordersCount = await Order.countDocuments()
  const usersCount = await User.countDocuments()

  // Get recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "firstName lastName email")
    .lean()

  // Get total revenue
  const totalRevenue = await Order.aggregate([
    { $match: { orderStatus: { $ne: "cancelled" } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ])

  // Get revenue by month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        orderStatus: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ])

  // Format data for charts
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const revenueChartData = revenueByMonth.map((item) => ({
    name: monthNames[item._id.month - 1],
    revenue: item.revenue,
    orders: item.orders,
  }))

  // Get top selling products
  const topProducts = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ])

  // Populate product details
  const populatedTopProducts = []
  for (const item of topProducts) {
    const product = await Product.findById(item._id).lean()
    if (product) {
      populatedTopProducts.push({
        ...item,
        product: {
          _id: product._id.toString(),
          name: product.name,
          price: product.price,
        },
      })
    }
  }

  return {
    counts: {
      products: productsCount,
      orders: ordersCount,
      users: usersCount,
      revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    },
    recentOrders: recentOrders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user
        ? {
            _id: order.user._id.toString(),
            name: `${order.user.firstName} ${order.user.lastName}`,
            email: order.user.email,
          }
        : null,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        _id: item._id.toString(),
        product: item.product.toString(),
      })),
    })),
    revenueChartData,
    topProducts: populatedTopProducts.map((item) => ({
      productId: item._id.toString(),
      name: item.product.name,
      totalSold: item.totalSold,
      revenue: item.revenue,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    })),
  }
}

export default async function ManagementPage() {
  // Check if user is admin or superadmin
  const isAdmin = await checkServerRole(["admin", "superadmin"])

  if (!isAdmin) {
    redirect("/unauthorized")
  }

  const stats = await getDashboardStats()

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Management Dashboard</h2>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.counts.revenue)}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.counts.orders}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.counts.products}</div>
                  <p className="text-xs text-muted-foreground">+12 new products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.counts.users}</div>
                  <p className="text-xs text-muted-foreground">+7% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <RevenueChart data={stats.revenueChartData} />
              <RecentOrdersCard orders={stats.recentOrders} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <TopProductsCard products={stats.topProducts} />
              <InventoryStatusCard stats={stats.counts} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Detailed analytics and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Analytics content will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generate and view reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Reports content will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

