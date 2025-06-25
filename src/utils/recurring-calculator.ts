export interface RecurringPreview {
  date: string
  amount: number
  description: string
}

export function calculateRecurringDates(
  startDate: string,
  frequency: "weekly" | "monthly" | "yearly",
  endDate?: string,
  maxOccurrences = 10,
): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  const currentDate = new Date(start)
  let occurrences = 0

  while (occurrences < maxOccurrences) {
    // Don't include the start date in the preview (it's the current transaction)
    if (occurrences > 0) {
      const dateString = currentDate.toISOString().split("T")[0]

      // Check if we've reached the end date
      if (end && currentDate > end) {
        break
      }

      dates.push(dateString)
    }

    // Calculate next occurrence
    switch (frequency) {
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
    }

    occurrences++
  }

  return dates
}

export function generateRecurringPreview(
  amount: number,
  description: string,
  startDate: string,
  frequency: "weekly" | "monthly" | "yearly",
  endDate?: string,
  installments?: number,
): RecurringPreview[] {
  const dates = calculateRecurringDates(startDate, frequency, endDate, installments || 10)

  return dates.map((date, index) => ({
    date,
    amount,
    description: installments ? `${description} (${index + 2}/${installments})` : description,
  }))
}

export function getFrequencyLabel(frequency: "weekly" | "monthly" | "yearly"): string {
  switch (frequency) {
    case "weekly":
      return "Every week"
    case "monthly":
      return "Every month"
    case "yearly":
      return "Every year"
  }
}
