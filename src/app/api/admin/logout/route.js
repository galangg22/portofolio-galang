import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    // Verify the user is actually logged in before logging out
    const session = req.cookies.get('admin_session')?.value
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    
    // Delete the session cookie
    cookieStore.delete('admin_session')
    
    return NextResponse.json({ ok: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}