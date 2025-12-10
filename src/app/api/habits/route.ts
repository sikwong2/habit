import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// Helper to convert color names to hex codes
function colorNameToHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#eab308',
    purple: '#a855f7',
    pink: '#ec4899',
    orange: '#f97316',
    cyan: '#06b6d4',
  }
  return colorMap[colorName.toLowerCase()] || '#808080'
}

// Helper to convert hex codes back to color names
function hexToColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    '#ef4444': 'red',
    '#3b82f6': 'blue',
    '#10b981': 'green',
    '#eab308': 'yellow',
    '#a855f7': 'purple',
    '#ec4899': 'pink',
    '#f97316': 'orange',
    '#06b6d4': 'cyan',
  }
  return colorMap[hex] || 'blue'
}

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's habits from Supabase
    const { data: habits, error } = await supabaseAdmin
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch habits' },
        { status: 500 }
      )
    }

    // Transform database format to frontend format
    const transformedHabits = habits.map((habit) => ({
      name: habit.name,
      description: habit.description || '',
      color: hexToColorName(habit.color),
      createdDate: new Date(habit.created_at).getTime(),
      completedDates: [], // TODO: Fetch from completions table
    }))

    return NextResponse.json({ success: true, habits: transformedHabits }, { status: 200 })
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const newHabit = await request.json()

    // Check if user is authenticated
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (userId) {
      // User is authenticated - save to Supabase database
      const { data, error } = await supabaseAdmin
        .from('habits')
        .insert([
          {
            user_id: userId,
            name: newHabit.name,
            description: newHabit.description || null,
            color: colorNameToHex(newHabit.color),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { success: false, error: error.message || 'Failed to create habit' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data }, { status: 200 })
    } else {
      // User is not authenticated - save to JSON file (mock data)
      const filePath = path.join(process.cwd(), 'src/data/habits.json')
      const fileContents = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(fileContents)

      // Add the new habit
      data.habits.push(newHabit)

      // Write back to the file
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))

      return NextResponse.json({ success: true }, { status: 200 })
    }
  } catch (error) {
    console.error('Error adding habit:', error)
    return NextResponse.json({ success: false, error: 'Failed to add habit' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { habitName, date } = await request.json()

    // Read the current habits.json file
    const filePath = path.join(process.cwd(), 'src/data/habits.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    // Find the habit by name
    const habit = data.habits.find((h: any) => h.name === habitName)
    if (!habit) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 })
    }

    // Check if the date is already in completedDates
    const dateIndex = habit.completedDates.indexOf(date)
    if (dateIndex > -1) {
      // Remove the date
      habit.completedDates.splice(dateIndex, 1)
    } else {
      // Add the date
      habit.completedDates.push(date)
      // Sort the dates
      habit.completedDates.sort((a: number, b: number) => a - b)
    }

    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json({ success: false, error: 'Failed to update habit' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { habitName } = await request.json()

    // Read the current habits.json file
    const filePath = path.join(process.cwd(), 'src/data/habits.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    // Find the habit index by name
    const habitIndex = data.habits.findIndex((h: any) => h.name === habitName)
    if (habitIndex === -1) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 })
    }

    // Remove the habit
    data.habits.splice(habitIndex, 1)

    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete habit' }, { status: 500 })
  }
}
