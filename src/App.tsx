function App() {
  return (
    <div className="flex h-screen w-full">
      {/* Habit List - 1/3 width */}
      <div className="w-1/3 border-r border-gray-200 p-4">
        <h2 className="text-xl font-semibold mb-4">Habits</h2>
      </div>

      {/* Calendar - 2/3 width */}
      <div className="w-2/3 p-4">
        <h2 className="text-xl font-semibold mb-4">Calendar</h2>
      </div>
    </div>
  )
}

export default App
