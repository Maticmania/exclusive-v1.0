import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ApiDebug from "@/components/debug/api-debug"
import SessionDebug from "@/components/debug/session-debug"
import StoreDebug from "@/components/debug/store-debug"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Debug Tools</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <SessionDebug />
        <ApiDebug />
      </div>

      <StoreDebug />

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>NODE_ENV: {process.env.NODE_ENV}</li>
            <li>MONGODB_URI: {process.env.MONGODB_URI ? "Set" : "Not set"}</li>
            <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || "Not set"}</li>
            <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? "Set" : "Not set"}</li>
            <li>GOOGLE_CLIENT_ID: {process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set"}</li>
            <li>GOOGLE_CLIENT_SECRET: {process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"}</li>
            <li>NEXT_PUBLIC_BASE_URL: {process.env.NEXT_PUBLIC_BASE_URL || "Not set"}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
