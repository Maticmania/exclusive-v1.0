"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export function RevenueChart({ data }) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function RecentOrdersCard({ orders }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>You have {orders.length} recent orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{order.user?.name || "Guest User"}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(order.total)} • {order.orderStatus}
                </p>
              </div>
              <div className="ml-auto font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TopProductsCard({ products }) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Your best performing products this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {products.map((product) => (
            <div key={product.productId} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.totalSold} units • {formatCurrency(product.revenue)}
                </p>
              </div>
              <div className="ml-auto font-medium">{((product.revenue / product.totalRevenue) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function InventoryStatusCard({ stats }) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
        <CardDescription>Monitor your inventory levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="flex-1">In Stock</span>
            <span className="font-medium">{Math.round(stats.products * 0.7)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="flex-1">Low Stock</span>
            <span className="font-medium">{Math.round(stats.products * 0.2)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="flex-1">Out of Stock</span>
            <span className="font-medium">{Math.round(stats.products * 0.1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

