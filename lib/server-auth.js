import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import {connectToDatabase} from "./mongodb"
import User from "@/models/user"

export async function getServerUser() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  // If role is missing, fetch it from the database
  if (!session.user.role) {
    await connectToDatabase()
    const user = await User.findById(session.user.id)

    if (user) {
      session.user.role = user.role
    }
  }

  return session.user
}

export async function checkServerRole(requiredRoles) {
  const user = await getServerUser()

  if (!user) {
    return false
  }

  // Convert to array if single role is provided
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  return roles.includes(user.role)
}

