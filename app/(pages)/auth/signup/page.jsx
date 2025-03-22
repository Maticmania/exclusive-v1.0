import SignupForm from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign Up | E-commerce",
  description: "Create a new account",
}

export default function SignupPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="flex justify-center items-center min-h-[70vh]">
        <SignupForm />
      </div>
    </div>
  )
}

