import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'

interface UserWithRole {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}


/**
 * Checks if the incoming request is authenticated.
 * For Next.js App Router, simply calling getServerSession(authOptions) is sufficient.
 *
 * @param req - The NextRequest object.
 * @returns A Promise that resolves to true if the session exists and the user is authenticated.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // For App Router, there is no need to pass the request object to getServerSession.
    const session = await getServerSession(authOptions)
    return !!(session && session.user)
  } catch (error) {
    console.error('Error in isAuthenticated:', error)
    return false
  }
}

/**
 * Checks if the current request's session belongs to an admin user.
    const user = session?.user as UserWithRole
    return !!(user && user.role === 'ADMIN')
 * @param req - The NextRequest object.
 * @returns A Promise that resolves to true if the authenticated user has a role of "ADMIN".
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as UserWithRole
    return !!(user && user.role === 'ADMIN')
  } catch (error) {
    console.error('Error in isAdmin:', error)
    return false
  }
}