'use client'

interface Habit {
  name: string
  description: string
  createdDate: number
  completedDates: number[]
}

interface CalendarViewProps {
  currentDate: Date
  habits: Habit[]
  onPreviousMonth: () => void
  onNextMonth: () => void
}

function CalendarView({ currentDate, habits, onPreviousMonth, onNextMonth }: CalendarViewProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of the month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Create array of days to display
  const days = []

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  // Helper function to get habits completed on a specific day
  const getHabitsForDay = (day: number) => {
    const dayDate = new Date(year, month, day)
    // Set to start of day for comparison
    dayDate.setHours(0, 0, 0, 0)
    const dayTimestamp = dayDate.getTime()

    // Check each habit to see if it was completed on this day
    return habits.filter(habit => {
      return habit.completedDates.some(timestamp => {
        const completedDate = new Date(timestamp)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === dayTimestamp
      })
    })
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-evenly gap-4 mb-6">
        <button
          onClick={onPreviousMonth}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          ← Previous
        </button>
        <h2 className="text-2xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={onNextMonth}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const completedHabits = day ? getHabitsForDay(day) : []

          return (
            <div
              key={index}
              className={`
                aspect-square flex flex-col p-2 rounded-lg border
                ${day ? 'border-gray-200 hover:border-gray-400 cursor-pointer' : 'border-transparent'}
              `}
            >
              {day && (
                <>
                  <span className="text-sm font-semibold mb-1">{day}</span>
                  <div className="flex flex-col gap-0.5 text-xs overflow-hidden">
                    {completedHabits.map((habit, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                        title={habit.name}
                      >
                        {habit.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarView
