export default function ProductDetailSkeleton() {
  return (
    <div className="w-full px-[5%] grid gap-10 min-h-[500px] py-10 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images skeleton */}
        <div className="space-y-4 md:flex lg:flex-col md:space-y-0 xl:space-y-0 xl:flex xl:flex-row-reverse flex-row-reverse gap-4">
          <div className="aspect-square md:w-[85%] lg:w-full bg-gray-200 rounded-lg"></div>
          <div className="grid md:grid-cols-1 lg:grid-cols-4 grid-cols-4 xl:grid-cols-1 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Product Details skeleton */}
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>

          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-5 h-5 bg-gray-200 rounded-full mr-1"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>

          <div className="h-8 bg-gray-200 rounded w-1/3"></div>

          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-gray-200 rounded-full"></div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded w-10"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-10"></div>
          </div>

          <div className="mt-4 rounded border">
            <div className="flex items-center gap-3 p-4">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border-t">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-36 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-72"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

