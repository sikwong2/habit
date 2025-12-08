'use client'

import { useState, useEffect } from 'react'
import HabitCard from '@/components/HabitCard'
import CalendarView from '@/components/CalendarView'
import TopBar from '@/components/TopBar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import habitsData from '@/data/habits.json'

interface Habit {
  name: string
  description: string
  createdDate: number
  completedDates: number[]
}

export default function Home() {
  const habits: Habit[] = habitsData.habits
  // Initialize with null, then set to current date after mount to avoid hydration issues
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    // Set the current date only on the client after hydration
    const now = new Date()
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))
  }, [])

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return

    const newHabit = {
      name: newHabitName,
      description: newHabitDescription,
      createdDate: Date.now(),
      completedDates: []
    }

    // Update the habits.json file
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHabit)
    })

    if (response.ok) {
      // Reset form and close popover
      setNewHabitName('')
      setNewHabitDescription('')
      setIsPopoverOpen(false)
      // Reload the page to show the new habit
      window.location.reload()
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      if (!prevDate) return null
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      if (!prevDate) return null
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Habit List - 1/3 width */}
        <div className="w-1/3 border-r border-border p-4 overflow-y-auto bg-muted/30 relative z-0">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Habits</h2>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 relative z-10">
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" side="right" align="start" sideOffset={10}>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Create New Habit</h4>
                    <p className="text-sm text-muted-foreground">
                      Add a new habit to track.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Morning Exercise"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="e.g., 30 minutes of exercise each morning"
                        value={newHabitDescription}
                        onChange={(e) => setNewHabitDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateHabit} className="mt-2">
                      Create Habit
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="max-w-md mx-auto relative z-0">
            {habits.map((habit, index) => (
              <HabitCard
                key={index}
                name={habit.name}
                description={habit.description}
                completedDatesCount={habit.completedDates.length}
              />
            ))}
          </div>
        </div>

        {/* Calendar - 2/3 width */}
        <div className="w-2/3 p-8">
          {currentDate && (
            <CalendarView
              habits={habits}
              currentDate={currentDate}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
            />
          )}
        </div>
      </div>
    </div>
  )
}
