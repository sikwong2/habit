import HabitCard from './components/HabitCard'
import CalendarView from './components/CalendarView'
import habitsData from '../data/habits.json'

interface Habit {
  name: string
  description: string
  createdDate: number
  completedDates: number[]
}

function App() {
  const habits: Habit[] = habitsData.habits

  return (
    <div className="flex h-screen w-full">
      {/* Habit List - 1/3 width */}
      <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Habits</h2>
        <div className="max-w-md mx-auto">
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
        <CalendarView />
      </div>
    </div>
  )
}

export default App
