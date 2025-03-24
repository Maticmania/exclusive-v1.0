import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export const metadata = {
  title: "Unauthorized | Exclusive",
  description: "You don't have permission to access this page",
}

export default function UnauthorizedPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-20">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-red-100 p-6 mb-6">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You don't have permission to access this page. Please contact an administrator if you believe this is an
          error.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

