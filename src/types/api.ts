/**
 * Tipos específicos para a API de transações
 */

import type { TransactionType } from './transaction'

// DTOs (Data Transfer Objects) para a API
export interface CreateTransactionDto {
  type: TransactionType
  amount: number
  category?: string
  description: string
  date: string
  paymentType: 'single' | 'installment' | 'recurring' | 'fixed-recurring'
  installments?: number
  currentInstallment?: number
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  fromAccount?: string
  toAccount?: string
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {
  id: string
}

export interface TransactionFilters {
  type?: TransactionType
  category?: string
  startDate?: string
  endDate?: string
  paymentType?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
  sortBy?: 'date' | 'amount' | 'category' | 'description'
  sortOrder?: 'asc' | 'desc'
}

// Resposta da API para lista paginada
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Estatísticas mensais da API
export interface MonthlyStatsDto {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  categoryBreakdown: {
    category: string
    total: number
    count: number
    percentage: number
  }[]
  recurringExpenses: number
  recurringIncome: number
}

// Resumo por período
export interface PeriodSummaryDto {
  startDate: string
  endDate: string
  totalIncome: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  averageDailyExpense: number
  topCategories: {
    category: string
    total: number
    transactionCount: number
  }[]
}

// Relatório de gastos por categoria
export interface CategoryReportDto {
  category: string
  totalAmount: number
  transactionCount: number
  percentage: number
  averageAmount: number
  lastTransactionDate: string
  trend: 'up' | 'down' | 'stable'
  monthlyBreakdown: {
    month: number
    year: number
    amount: number
    count: number
  }[]
}

// Previsão de gastos recorrentes
export interface RecurringForecastDto {
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextOccurrence: string
  estimatedMonthlyImpact: number
}

// Análise de tendências
export interface TrendAnalysisDto {
  period: 'monthly' | 'quarterly' | 'yearly'
  data: {
    period: string
    income: number
    expenses: number
    netAmount: number
    transactionCount: number
  }[]
  trends: {
    incomeGrowth: number
    expenseGrowth: number
    savingsRate: number
    topGrowingCategories: string[]
    topDecliningCategories: string[]
  }
}

// Configurações de exportação
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf'
  startDate?: string
  endDate?: string
  categories?: string[]
  includeRecurring?: boolean
  groupByCategory?: boolean
}

// Backup/Sync
export interface BackupDto {
  id: string
  createdAt: string
  size: number
  transactionCount: number
  checksum: string
}

export interface SyncStatus {
  lastSync: string
  status: 'success' | 'error' | 'pending'
  conflictCount: number
  pendingChanges: number
}

// Configurações do usuário
export interface UserPreferencesDto {
  currency: string
  dateFormat: string
  numberFormat: string
  defaultCategories: string[]
  budgetLimits: {
    category: string
    monthlyLimit: number
    alertThreshold: number
  }[]
  notifications: {
    recurringReminders: boolean
    budgetAlerts: boolean
    weeklyReports: boolean
    monthlyReports: boolean
  }
}
