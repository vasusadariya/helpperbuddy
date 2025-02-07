import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Checks if the incoming request is authenticated.
 * For Next.js App Router, simply calling getServerSession(authOptions) is sufficient.
 *
 * @param req - The NextRequest object.
 * @returns A Promise that resolves to true if the session exists and the user is authenticated.
 */
export const isAuthenticated = async (req: NextRequest): Promise<boolean> => {
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
 *
 * @param req - The NextRequest object.
 * @returns A Promise that resolves to true if the authenticated user has a role of "ADMIN".
 */
export const isAdmin = async (req: NextRequest): Promise<boolean> => {
  try {
    const session = await getServerSession(authOptions)
    return !!(session && session.user && session.user.role === 'ADMIN')
  } catch (error) {
    console.error('Error in isAdmin:', error)
    return false
  }
}