"use client"

import { Calendar, Clock, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { RecurringPreview } from "../utils/recurring-calculator"

interface RecurringPreviewProps {
  previews: RecurringPreview[]
  frequency: "weekly" | "monthly" | "yearly"
  transactionType: "expense" | "income"
  totalAmount: number
}

export default function RecurringPreviewComponent({
  previews,
  frequency,
  transactionType,
  totalAmount,
}: RecurringPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getFrequencyColor = () => {
    switch (frequency) {
      case "weekly":
        return "bg-purple-100 text-purple-800"
      case "monthly":
        return "bg-blue-100 text-blue-800"
      case "yearly":
        return "bg-orange-100 text-orange-800"
    }
  }

  const getTransactionColor = () => {
    return transactionType === "income" ? "text-green-600" : "text-red-600"
  }

  if (previews.length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Upcoming Transactions Preview
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Badge variant="secondary" className={getFrequencyColor()}>
            {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
          </Badge>
          <span>•</span>
          <span>{previews.length} upcoming transactions</span>
          <span>•</span>
          <span className={getTransactionColor()}>Total: {formatCurrency(totalAmount)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {previews.map((preview, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(preview.date)}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{preview.description}</div>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className={`h-3 w-3 ${getTransactionColor()}`} />
                  <span className={`text-sm font-semibold ${getTransactionColor()}`}>
                    {formatCurrency(preview.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {previews.length >= 10 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Showing first 10 occurrences. More transactions will continue based on your settings.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
