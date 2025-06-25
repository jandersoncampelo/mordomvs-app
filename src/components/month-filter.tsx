"use client"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MonthFilterProps {
  selectedMonth: string
  selectedYear: string
  onMonthChange: (month: string, year: string) => void
  transactionDates: string[] // Array of all transaction dates to determine available months
}

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]

export default function MonthFilter({
  selectedMonth,
  selectedYear,
  onMonthChange,
  transactionDates,
}: MonthFilterProps) {
  // Get available years from transaction dates
  const availableYears = Array.from(
    new Set(
      transactionDates.map((date) => new Date(date).getFullYear().toString()).filter((year) => !isNaN(Number(year))),
    ),
  ).sort((a, b) => Number(b) - Number(a)) // Sort descending (newest first)

  // If no transactions exist, show current year
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear().toString())
  }

  const handlePreviousMonth = () => {
    let newMonth = String(Number(selectedMonth) - 1).padStart(2, "0")
    let newYear = selectedYear

    if (Number(newMonth) < 1) {
      newMonth = "12"
      newYear = String(Number(selectedYear) - 1)
    }

    onMonthChange(newMonth, newYear)
  }

  const handleNextMonth = () => {
    let newMonth = String(Number(selectedMonth) + 1).padStart(2, "0")
    let newYear = selectedYear

    if (Number(newMonth) > 12) {
      newMonth = "01"
      newYear = String(Number(selectedYear) + 1)
    }

    onMonthChange(newMonth, newYear)
  }

  const getCurrentMonthLabel = () => {
    const monthObj = months.find((m) => m.value === selectedMonth)
    return `${monthObj?.label || "Janeiro"} ${selectedYear}`
  }

  const isCurrentMonth = () => {
    const now = new Date()
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
    const currentYear = now.getFullYear().toString()
    return selectedMonth === currentMonth && selectedYear === currentYear
  }

  const goToCurrentMonth = () => {
    const now = new Date()
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
    const currentYear = now.getFullYear().toString()
    onMonthChange(currentMonth, currentYear)
  }

  // Get transaction count for selected month
  const getTransactionCount = () => {
    const monthStart = `${selectedYear}-${selectedMonth}`
    return transactionDates.filter((date) => date.startsWith(monthStart)).length
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-4">
          {/* Left Navigation */}
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Centered Month/Year Display */}
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold text-gray-900 text-base whitespace-nowrap">{getCurrentMonthLabel()}</span>
              <span className="text-xs text-gray-500">{getTransactionCount()} transação(ões)</span>
            </div>
          </div>

          {/* Right Navigation */}
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Today Button - Centered below if not current month */}
        {!isCurrentMonth() && (
          <div className="flex justify-center mt-3">
            <Button variant="ghost" size="sm" onClick={goToCurrentMonth} className="text-xs">
              Hoje
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
