import { Loader2 } from "lucide-react"
import AdminLayout from "@/components/admin/admin-layout"

export default function BrandsLoading() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
      </div>

      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading brands...</p>
      </div>
    </AdminLayout>
  )
}

