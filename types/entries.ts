export interface DayEntry {
  id?: string
  date: Date
  exercises: Record<string, boolean>
}

export interface WeeklyEntry {
  id: string
  userId: string
  startDate: Date
  endDate: Date
  charityActs?: string
  comments?: string
  difficulties?: string
  improvements?: string
  successes?: string
  days: DayEntry[]
}

