import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const newHabit = await request.json()

    // Read the current habits.json file
    const filePath = path.join(process.cwd(), 'src/data/habits.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    // Add the new habit
    data.habits.push(newHabit)

    // Write back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error adding habit:', error)
    return NextResponse.json({ success: false, error: 'Failed to add habit' }, { status: 500 })
  }
}
