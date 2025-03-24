import AccountSidebar from "@/components/profile/account-sidebar"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "My Returns | E-commerce",
  description: "View your return requests",
}

export default async function ReturnsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/returns")
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 md:hidden">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <AccountSidebar />
        </div>

        <div className="w-full md:w-3/4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">My Returns</h2>

            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">You don't have any return requests.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

