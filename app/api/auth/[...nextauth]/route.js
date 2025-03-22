// import NextAuth from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { connectToDatabase } from "@/lib/mongodb"
// import User from "@/models/User"
// import bcrypt from "bcryptjs"

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       async authorize(credentials) {
//         await connectToDatabase()
//         const user = await User.findOne({ email: credentials.email }).select("+password role")

//         if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
//           throw new Error("Invalid credentials")
//         }

//         return { id: user.id, email: user.email, role: user.role } // Send role to session
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id
//         session.user.role = token.role
//       }
//       return session
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id
//         token.role = user.role
//       }
//       return token
//     },
//   },
// }

// export default NextAuth(authOptions)

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

