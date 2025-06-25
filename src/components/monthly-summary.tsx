"use client"

import { TrendingUp, TrendingDown, ArrowRightLeft, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MonthlySummaryProps {
  stats: {
    income: number
    expenses: number
    transfers: number
    balance: number
    totalTransactions: number
  }
  selectedMonth: string
  selectedYear: string
}

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export default function MonthlySummary({ stats, selectedMonth, selectedYear }: MonthlySummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const getMonthName = () => {
    return months[Number(selectedMonth) - 1] || "Janeiro"
  }

  const isCurrentMonth = () => {
    const now = new Date()
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
    const currentYear = now.getFullYear().toString()
    return selectedMonth === currentMonth && selectedYear === currentYear
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">
              Resumo de {getMonthName()} {selectedYear}
            </CardTitle>
          </div>
          {isCurrentMonth() && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Mês Atual
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Balance */}
          <div className="col-span-2 md:col-span-1">
            <Card className={`${stats.balance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Saldo do Mês</p>
                  <p className={`text-xl font-bold ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(stats.balance)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Receitas</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(stats.income)}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Despesas</p>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(stats.expenses)}</p>
                </div>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Transfers */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Transferências</p>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(stats.transfers)}</p>
                </div>
                <ArrowRightLeft className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total de transações: {stats.totalTransactions}</span>
            {stats.expenses > 0 && (
              <span>Taxa de gastos: {((stats.expenses / (stats.income || 1)) * 100).toFixed(1)}%</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
