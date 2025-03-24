"use client"
import DataTable from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ProductsTable({ products }) {
  const columns = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category
        return category ? category.name : "—"
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatCurrency(row.getValue("price")),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stock")
        return (
          <Badge variant={stock > 0 ? "outline" : "destructive"}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.getValue("isPublished")
        return <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Published" : "Draft"}</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
  ]

  return (
    <DataTable
      data={products}
      columnDefs={columns}
      searchColumn="name"
      createLink="/admin/products"
      createLabel="Add Product"
    />
  )
}

