import AccountSidebar from "@/components/profile/account-sidebar"
import AddressManager from "@/components/profile/address-manager"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

export const metadata = {
  title: "Address Book | E-commerce",
  description: "Manage your shipping addresses",
}

async function getAddresses(userId) {
  await connectToDatabase()

  const user = await User.findById(userId).select("addresses").lean()

  if (!user) {
    return []
  }

  return user.addresses.map((address) => ({
    ...address,
    _id: address._id.toString(),
  }))
}

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/addresses")
  }

  const addresses = await getAddresses(session.user.id)

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 md:hidden">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <AccountSidebar />
        </div>

        <div className="w-full md:w-3/4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <AddressManager initialAddresses={addresses} />
          </div>
        </div>
      </div>
    </div>
  )
}

