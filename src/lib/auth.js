import { cookies } from 'next/headers'

/**
 * Check if the admin is authenticated
 * Supports both legacy 'authenticated' string and new secure session tokens
 * @returns {Promise<boolean>}
 */
export async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')?.value
    
    if (!session) return false
    
    // Support legacy 'authenticated' for backward compatibility
    if (session === 'authenticated') return true
    
    // Validate secure token format (64 character hex string)
    return /^[a-f0-9]{64}$/i.test(session)
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}