"use client"

import { useState, useMemo } from "react"
import type { Transaction } from "../types/transaction"

export function useMonthFilter(transactions: Transaction[]) {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, "0"))
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString())

  const handleMonthChange = (month: string, year: string) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const transactionMonth = String(transactionDate.getMonth() + 1).padStart(2, "0")
      const transactionYear = transactionDate.getFullYear().toString()

      return transactionMonth === selectedMonth && transactionYear === selectedYear
    })
  }, [transactions, selectedMonth, selectedYear])

  const monthlyStats = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const transfers = filteredTransactions.filter((t) => t.type === "transfer").reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      transfers,
      balance: income - expenses,
      totalTransactions: filteredTransactions.length,
    }
  }, [filteredTransactions])

  const transactionDates = useMemo(() => {
    return transactions.map((t) => t.date)
  }, [transactions])

  return {
    selectedMonth,
    selectedYear,
    handleMonthChange,
    filteredTransactions,
    monthlyStats,
    transactionDates,
  }
}
