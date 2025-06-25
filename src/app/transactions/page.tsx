"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import TransactionDialog from "@/components/transaction-dialog"
import type { Transaction, TransactionType } from "@/types/transaction"
import MonthFilter from "@/components/month-filter"
import MonthlySummary from "@/components/monthly-summary"
import { useMonthFilter } from "@/hooks/use-month-filter"
import TransactionListImproved from "@/components/transaction-list-improved"
import ImprovedHeader from "@/components/improved-header"

export default function Component() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    // Dezembro 2024 - Transações recentes
    {
      id: "1",
      type: "income",
      amount: 4500,
      category: "Salary",
      description: "Salário mensal - Empresa XYZ",
      date: "2024-12-25",
      paymentType: "single",
    },
    {
      id: "2",
      type: "expense",
      amount: 89.9,
      category: "Food & Dining",
      description: "Ceia de Natal - Supermercado",
      date: "2024-12-24",
      paymentType: "single",
    },
    {
      id: "3",
      type: "expense",
      amount: 250.0,
      category: "Shopping",
      description: "Presentes de Natal",
      date: "2024-12-23",
      paymentType: "single",
    },
    {
      id: "4",
      type: "expense",
      amount: 45.5,
      category: "Transportation",
      description: "Uber para shopping",
      date: "2024-12-23",
      paymentType: "single",
    },
    {
      id: "5",
      type: "income",
      amount: 800,
      category: "Freelance",
      description: "Projeto desenvolvimento website",
      date: "2024-12-22",
      paymentType: "single",
    },
    {
      id: "6",
      type: "expense",
      amount: 120.0,
      category: "Bills & Utilities",
      description: "Conta de luz - CEMIG",
      date: "2024-12-20",
      paymentType: "single",
    },
    {
      id: "7",
      type: "expense",
      amount: 85.3,
      category: "Bills & Utilities",
      description: "Conta de água - COPASA",
      date: "2024-12-20",
      paymentType: "single",
    },
    {
      id: "8",
      type: "expense",
      amount: 199.9,
      category: "Bills & Utilities",
      description: "Internet fibra - Vivo",
      date: "2024-12-19",
      paymentType: "single",
    },
    {
      id: "9",
      type: "expense",
      amount: 2400,
      category: "Shopping",
      description: "iPhone 15 Pro",
      date: "2024-12-18",
      paymentType: "installment",
      installments: 12,
      currentInstallment: 1,
    },
    {
      id: "10",
      type: "transfer",
      amount: 1000,
      description: "Transferência para poupança",
      date: "2024-12-18",
      fromAccount: "Conta Corrente",
      toAccount: "Poupança",
    },
    {
      id: "11",
      type: "expense",
      amount: 65.8,
      category: "Food & Dining",
      description: "Jantar no restaurante japonês",
      date: "2024-12-17",
      paymentType: "single",
    },
    {
      id: "12",
      type: "expense",
      amount: 180.0,
      category: "Transportation",
      description: "Combustível - Posto Shell",
      date: "2024-12-16",
      paymentType: "single",
    },
    {
      id: "13",
      type: "expense",
      amount: 35.9,
      category: "Food & Dining",
      description: "Almoço executivo",
      date: "2024-12-16",
      paymentType: "single",
    },
    {
      id: "14",
      type: "income",
      amount: 150,
      category: "Other",
      description: "Cashback cartão de crédito",
      date: "2024-12-15",
      paymentType: "single",
    },
    {
      id: "15",
      type: "expense",
      amount: 450.0,
      category: "Food & Dining",
      description: "Compras do mês - Supermercado Extra",
      date: "2024-12-15",
      paymentType: "single",
    },
    {
      id: "16",
      type: "expense",
      amount: 89.9,
      category: "Entertainment",
      description: "Netflix + Spotify Premium",
      date: "2024-12-14",
      paymentType: "recurring",
      recurringFrequency: "monthly",
    },
    {
      id: "17",
      type: "expense",
      amount: 25.5,
      category: "Food & Dining",
      description: "Café da manhã - padaria",
      date: "2024-12-14",
      paymentType: "single",
    },
    {
      id: "18",
      type: "expense",
      amount: 320.0,
      category: "Healthcare",
      description: "Consulta médica particular",
      date: "2024-12-13",
      paymentType: "single",
    },
    {
      id: "19",
      type: "expense",
      amount: 78.9,
      category: "Shopping",
      description: "Produtos de limpeza",
      date: "2024-12-12",
      paymentType: "single",
    },
    {
      id: "20",
      type: "transfer",
      amount: 500,
      description: "PIX para mãe",
      date: "2024-12-12",
      fromAccount: "Conta Corrente",
      toAccount: "Conta Externa",
    },

    // Novembro 2024
    {
      id: "21",
      type: "income",
      amount: 4500,
      category: "Salary",
      description: "Salário mensal - Empresa XYZ",
      date: "2024-11-25",
      paymentType: "single",
    },
    {
      id: "22",
      type: "expense",
      amount: 1200,
      category: "Shopping",
      description: "Black Friday - Eletrodomésticos",
      date: "2024-11-29",
      paymentType: "single",
    },
    {
      id: "23",
      type: "expense",
      amount: 380.0,
      category: "Food & Dining",
      description: "Compras supermercado",
      date: "2024-11-28",
      paymentType: "single",
    },
    {
      id: "24",
      type: "income",
      amount: 600,
      category: "Freelance",
      description: "Consultoria em TI",
      date: "2024-11-27",
      paymentType: "single",
    },
    {
      id: "25",
      type: "expense",
      amount: 150.0,
      category: "Transportation",
      description: "Combustível",
      date: "2024-11-26",
      paymentType: "single",
    },

    // Janeiro 2024
    {
      id: "26",
      type: "income",
      amount: 4200,
      category: "Salary",
      description: "Salário mensal - Empresa XYZ",
      date: "2024-01-25",
      paymentType: "single",
    },
    {
      id: "27",
      type: "expense",
      amount: 800.0,
      category: "Travel",
      description: "Passagem aérea - Férias",
      date: "2024-01-20",
      paymentType: "single",
    },
    {
      id: "28",
      type: "expense",
      amount: 1500.0,
      category: "Shopping",
      description: "Notebook para trabalho",
      date: "2024-01-18",
      paymentType: "installment",
      installments: 10,
      currentInstallment: 10,
    },
    {
      id: "29",
      type: "income",
      amount: 300,
      category: "Investment",
      description: "Dividendos ações",
      date: "2024-01-15",
      paymentType: "single",
    },
    {
      id: "30",
      type: "expense",
      amount: 420.0,
      category: "Food & Dining",
      description: "Compras supermercado",
      date: "2024-01-14",
      paymentType: "single",
    },

    // Junho 2025 (futuro - para demonstrar filtro)
    {
      id: "31",
      type: "income",
      amount: 5000,
      category: "Salary",
      description: "Salário com aumento",
      date: "2025-06-25",
      paymentType: "single",
    },
    {
      id: "32",
      type: "expense",
      amount: 200,
      category: "Entertainment",
      description: "Cinema + pipoca",
      date: "2025-06-24",
      paymentType: "single",
    },
    {
      id: "33",
      type: "expense",
      amount: 350.0,
      category: "Food & Dining",
      description: "Jantar de aniversário",
      date: "2025-06-23",
      paymentType: "single",
    },

    // Transações recorrentes simuladas
    {
      id: "34",
      type: "expense",
      amount: 1200,
      category: "Bills & Utilities",
      description: "Aluguel apartamento",
      date: "2024-12-05",
      paymentType: "recurring",
      recurringFrequency: "monthly",
    },
    {
      id: "35",
      type: "expense",
      amount: 280.0,
      category: "Transportation",
      description: "Mensalidade estacionamento",
      date: "2024-12-03",
      paymentType: "recurring",
      recurringFrequency: "monthly",
    },
    {
      id: "36",
      type: "income",
      amount: 200,
      category: "Investment",
      description: "Rendimento poupança",
      date: "2024-12-01",
      paymentType: "fixed-recurring",
      recurringFrequency: "monthly",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTransactionType, setCurrentTransactionType] = useState<TransactionType>("expense")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const { selectedMonth, selectedYear, handleMonthChange, filteredTransactions, monthlyStats, transactionDates } =
    useMonthFilter(transactions)

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

  const handleSubmitTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? { ...transaction, id: editingTransaction.id } : t)),
      )
    } else {
      const newTransaction = { ...transaction, id: Date.now().toString() }
      setTransactions((prev) => [newTransaction, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Improved Header */}
      <ImprovedHeader />

      <div className="max-w-4xl mx-auto px-4 space-y-6">
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
          <Button onClick={() => handleCreateTransaction("expense")} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Despesa
          </Button>
          <Button onClick={() => handleCreateTransaction("income")} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Receita
          </Button>
          <Button onClick={() => handleCreateTransaction("transfer")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Transferência
          </Button>
        </div>

        {/* Improved Transactions List */}
        <TransactionListImproved transactions={filteredTransactions} onEditTransaction={handleEditTransaction} />

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
