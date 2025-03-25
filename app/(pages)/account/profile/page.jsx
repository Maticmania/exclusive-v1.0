import AccountSidebar from "@/components/profile/account-sidebar"
import ProfileForm from "@/components/profile/profile-form"
import PasswordForm from "@/components/profile/password-form"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "My Profile | E-commerce",
  description: "Manage your profile information",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/profile")
  }

  // Breadcrumb items
  const breadcrumbItems = [{ label: "Account", href: "/account/profile" }, { label: "Profile" }]

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <h1 className="text-2xl font-bold mb-6 md:hidden">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <AccountSidebar />
        </div>

        <div className="w-full md:w-3/4">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <ProfileForm />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6">Password Changes</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <PasswordForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

