import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="flex flex-col space-y-4">
        <Skeleton className="h-10 w-64 mb-4" />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>

          <div className="w-full md:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

