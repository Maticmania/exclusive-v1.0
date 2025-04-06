import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AccountSidebar from "@/components/profile/account-sidebar"

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/account/reviews")
  }

  return (
    <div className="container mx-auto py-8 px-[5%]">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-3/4">
          <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">You haven't written any reviews yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

