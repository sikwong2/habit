import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = loginSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join(', ')
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('public_id, email, hashed_password')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.hashed_password)

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Set cookie with public_id
    const cookieStore = await cookies()
    cookieStore.set('userId', user.public_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    )
  }
}
