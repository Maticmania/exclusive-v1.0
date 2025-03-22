import SigninForm from "@/components/auth/signin-form"

export const metadata = {
  title: "Sign In | E-commerce",
  description: "Sign in to your account",
}

export default function SigninPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="flex justify-center items-center min-h-[70vh]">
        <SigninForm />
      </div>
    </div>
  )
}

