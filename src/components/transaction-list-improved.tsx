"use client"

import { useState } from "react"
import { MoreVertical, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Transaction } from "../types/transaction"

interface TransactionListImprovedProps {
  transactions: Transaction[]
  onEditTransaction: (transaction: Transaction) => void
}

const categoryIcons: Record<string, string> = {
  "Food & Dining": "🍽️",
  Transportation: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  "Bills & Utilities": "⚡",
  Healthcare: "🏥",
  Travel: "✈️",
  Salary: "💼",
  Freelance: "💻",
  Investment: "📈",
  Business: "🏢",
  Gift: "🎁",
  Other: "📝",
}

export default function TransactionListImproved({ transactions, onEditTransaction }: TransactionListImprovedProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    }
  }

  const getTransactionIcon = (transaction: Transaction) => {
    const category = transaction.type === "transfer" ? "Other" : transaction.category
    const emoji = categoryIcons[category] || "📝"

    let bgColor = "bg-gray-100"
    if (transaction.type === "income") bgColor = "bg-green-100"
    else if (transaction.type === "expense") bgColor = "bg-red-100"
    else if (transaction.type === "transfer") bgColor = "bg-blue-100"

    return <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-lg`}>{emoji}</div>
  }

  const getPaymentTypeLabel = (transaction: Transaction) => {
    if (transaction.type === "transfer") return null

    const paymentType = transaction.paymentType

    if (paymentType === "installment" && "installments" in transaction) {
      return `${transaction.currentInstallment}/${transaction.installments}x`
    }

    if (paymentType === "recurring" || paymentType === "fixed-recurring") {
      return "Recorrente"
    }

    return null
  }

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.type !== "transfer" && transaction.category.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = transaction.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    },
    {} as Record<string, Transaction[]>,
  )

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lançamentos</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 px-6">
            <p>Nenhuma transação encontrada.</p>
            {searchTerm && <p className="text-sm mt-2">Tente ajustar os termos de busca.</p>}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-0 bg-gray-50 px-6 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-600">{formatDate(date)}</p>
                </div>

                {/* Transactions for this date */}
                {groupedTransactions[date].map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                    onClick={() => onEditTransaction(transaction)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getTransactionIcon(transaction)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                          {getPaymentTypeLabel(transaction) && (
                            <Badge variant="outline" className="text-xs">
                              {getPaymentTypeLabel(transaction)}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {transaction.type !== "transfer" && (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                          )}
                          {transaction.type === "transfer" && (
                            <Badge variant="secondary" className="text-xs">
                              {(transaction as any).fromAccount} → {(transaction as any).toAccount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : transaction.type === "expense"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>

                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
