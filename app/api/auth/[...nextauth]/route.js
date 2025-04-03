import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import {connectToDatabase} from "@/lib/mongodb"
import User from "@/models/user"

// Extend the authOptions to handle Google sign-in
const extendedAuthOptions = {
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user, account, profile }) {
      // Only handle Google sign-in
      if (account.provider === "google") {
        try {
          await connectToDatabase()

          // Check if user exists
          let dbUser = await User.findOne({ email: user.email })

          if (!dbUser) {
            // Create new user from Google data
            // Use the profile data that was properly mapped in the Google provider
            dbUser = new User({
              firstName: user.firstName || profile.given_name, // Use either from user or directly from profile
              lastName: user.lastName || profile.family_name,
              email: user.email,
              // Generate a random password since they're using Google
              password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
              role: await getInitialUserRole(), // Use a helper function to determine role
            })

            await dbUser.save()
          }

          // Add role to the user object
          user.role = dbUser.role
          user.id = dbUser._id.toString()

          return true
        } catch (error) {
          console.error("Error in Google sign-in:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
      }

      // If token doesn't have role yet, fetch it from the database
      if (!token.role && token.email) {
        try {
          await connectToDatabase()
          const dbUser = await User.findOne({ email: token.email })
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.role = dbUser.role
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      if (url.startsWith(baseUrl)) return url
      // Allows relative callback URLs
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString()
      return baseUrl
    },
  },
}

// Helper function to determine the initial role for a new user
async function getInitialUserRole() {
  try {
    // Check if this is the first user in the system
    const userCount = await User.countDocuments()
    return userCount === 0 ? "superadmin" : "user"
  } catch (error) {
    console.error("Error determining initial user role:", error)
    return "user" // Default to user role if there's an error
  }
}

const handler = NextAuth(extendedAuthOptions)

export { handler as GET, handler as POST, authOptions }

