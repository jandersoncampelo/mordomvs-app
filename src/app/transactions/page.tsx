"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import TransactionDialog from "@/components/transaction-dialog"
import type { Transaction, TransactionType } from "@/types/transaction"
import type { CreateTransactionDto, UpdateTransactionDto } from "@/types/api"
import MonthFilter from "@/components/month-filter"
import MonthlySummary from "@/components/monthly-summary"
import { useTransactionManager } from "@/hooks/use-transaction-manager"
import TransactionListImproved from "@/components/transaction-list-improved"
import ImprovedHeader from "@/components/improved-header"
import ApiTestComponent from "@/components/api-test"
import ApiConnectionTest from "@/components/api-connection-test"

export default function Component() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTransactionType, setCurrentTransactionType] = useState<TransactionType>("expense")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  // Filtros de mês e ano
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, "0"))
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString())
  // Hook principal para gerenciar transações via API
  const {
    transactions,
    isLoading,
    error,
    create,
    update,
    refresh,
  } = useTransactionManager({
    autoRefresh: true,
  })

  // Função para alterar mês/ano
  const handleMonthChange = (month: string, year: string) => {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  // Filtrar transações por mês/ano selecionado
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transactionDate)
      const transactionMonth = String(transactionDate.getMonth() + 1).padStart(2, "0")
      const transactionYear = transactionDate.getFullYear().toString()

      return transactionMonth === selectedMonth && transactionYear === selectedYear
    })
  }, [transactions, selectedMonth, selectedYear])

  // Estatísticas mensais baseadas nas transações filtradas
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

  // Datas das transações para o filtro de mês
  const transactionDates = useMemo(() => {
    return transactions.map((t) => t.transactionDate)
  }, [transactions])
  const handleCreateTransaction = (type: TransactionType) => {
    setCurrentTransactionType(type)
    setEditingTransaction(null)
    setIsDialogOpen(true)
  }
  const handleEditTransaction = (transaction: Transaction) => {
    setCurrentTransactionType(transaction.type)
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleSubmitTransaction = async (transaction: Transaction) => {
    try {
      if (editingTransaction) {
        await handleUpdateTransaction(transaction)
      } else {
        await handleCreateNewTransaction(transaction)
      }
      setIsDialogOpen(false)
      setEditingTransaction(null)
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  }

  const handleUpdateTransaction = async (transaction: Transaction) => {
    const paymentType = getPaymentType(transaction)
    
    const updateData: UpdateTransactionDto = {
      id: editingTransaction!.id!,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.transactionDate,
      category: transaction.type !== 'transfer' ? transaction.category : undefined,
      paymentType,
      installments: transaction.type === 'expense' ? transaction.installments : undefined,
      currentInstallment: transaction.type === 'expense' ? transaction.currentInstallment : undefined,
      recurringFrequency: (transaction.type === 'expense' || transaction.type === 'income') ? 
                          transaction.recurringFrequency : undefined,
      fromAccount: transaction.type === 'transfer' ? transaction.fromAccount : undefined,
      toAccount: transaction.type === 'transfer' ? transaction.toAccount : undefined,
    }
    await update(editingTransaction!.id!, updateData)
  }

  const handleCreateNewTransaction = async (transaction: Transaction) => {
    const paymentType = getPaymentType(transaction)
    
    const createData: CreateTransactionDto = {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.transactionDate,
      category: transaction.type !== 'transfer' ? transaction.category : undefined,
      paymentType,
      installments: transaction.type === 'expense' ? transaction.installments : undefined,
      currentInstallment: transaction.type === 'expense' ? transaction.currentInstallment : undefined,
      recurringFrequency: (transaction.type === 'expense' || transaction.type === 'income') ? 
                          transaction.recurringFrequency : undefined,
      fromAccount: transaction.type === 'transfer' ? transaction.fromAccount : undefined,
      toAccount: transaction.type === 'transfer' ? transaction.toAccount : undefined,
    }
    await create(createData)
  }

  const getPaymentType = (transaction: Transaction) => {
    if (transaction.type === 'expense') {
      return transaction.paymentType
    }
    if (transaction.type === 'income') {
      return transaction.paymentType
    }
    return 'single'
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Improved Header */}
      <ImprovedHeader />

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando transações...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Erro ao carregar dados</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <Button onClick={refresh} variant="outline" size="sm">
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}

        {/* Month Filter */}
        <MonthFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
          transactionDates={transactionDates}
        />

        {/* Monthly Summary */}
        <MonthlySummary stats={monthlyStats} selectedMonth={selectedMonth} selectedYear={selectedYear} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            onClick={() => handleCreateTransaction("expense")} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Despesa
          </Button>
          <Button 
            onClick={() => handleCreateTransaction("income")} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Receita
          </Button>
          <Button 
            onClick={() => handleCreateTransaction("transfer")} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Transferência
          </Button>
        </div>        {/* API Connection Test */}
        <ApiConnectionTest />

        {/* API Test Component */}
        <ApiTestComponent />

        {/* Improved Transactions List */}
        <TransactionListImproved 
          transactions={filteredTransactions} 
          onEditTransaction={handleEditTransaction}
        />

        {/* Transaction Dialog */}
        <TransactionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleSubmitTransaction}
          transactionType={currentTransactionType}
          initialData={editingTransaction || undefined}
        />
      </div>
    </div>
  )
}
