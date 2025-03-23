import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import SignupForm from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign Up | E-commerce",
  description: "Create a new account",
}

export default async function SignupPage({ searchParams }) {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions)

  // If authenticated, redirect to the callback URL or home
  if (session) {
    const callbackUrl = searchParams?.callbackUrl || "/"
    redirect(callbackUrl)
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="flex justify-center items-center min-h-[70vh]">
        <SignupForm />
      </div>
    </div>
  )
}

