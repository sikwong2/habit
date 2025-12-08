import { NextResponse } from 'next/server'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
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

    // TODO: Integrate with Supabase to create user account
    // For now, returning success response
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
