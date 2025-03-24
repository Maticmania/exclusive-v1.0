"use client"
import DataTable from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export default function BrandsTable({ brands }) {
  const columns = [
    {
      accessorKey: "name",
      header: "Brand Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description")
        return description ? description.substring(0, 50) + (description.length > 50 ? "..." : "") : "—"
      },
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => {
        const featured = row.getValue("featured")
        return featured ? <Badge variant="default">Featured</Badge> : <Badge variant="outline">No</Badge>
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
      data={brands}
      columnDefs={columns}
      searchColumn="name"
      createLink="/admin/brands"
      createLabel="Add Brand"
    />
  )
}

