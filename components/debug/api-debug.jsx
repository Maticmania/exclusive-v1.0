"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApiDebug() {
  const [apiStatus, setApiStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testApi = async (endpoint) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setApiStatus({
        status: response.status,
        statusText: response.statusText,
        data,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => testApi("/api/health")} disabled={loading}>
              Test Health
            </Button>
            <Button variant="outline" onClick={() => testApi("/api/products?limit=1")} disabled={loading}>
              Test Products
            </Button>
            <Button variant="outline" onClick={() => testApi("/api/cart")} disabled={loading}>
              Test Cart
            </Button>
          </div>

          {loading && <p>Loading...</p>}
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          {apiStatus && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p>
                Status: {apiStatus.status} {apiStatus.statusText}
              </p>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-60">
                {JSON.stringify(apiStatus.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
