import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

const createUserSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const result = createUserSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join(', ')
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user into Supabase database using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          hashed_password: hashedPassword,
        },
      ])
      .select('public_id')
      .single()

    if (error || !data) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    // Set cookie with public_id
    const cookieStore = await cookies()
    cookieStore.set('userId', data.public_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json(
      { success: true, message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
