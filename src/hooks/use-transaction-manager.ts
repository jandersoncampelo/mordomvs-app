/**
 * Hook principal para gerenciar todas as operações de transações
 */

import { useState, useCallback, useMemo } from 'react'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from './use-api'
import type { Transaction } from '@/types/transaction'
import type { CreateTransactionDto, UpdateTransactionDto, TransactionFilters } from '@/types/api'

interface UseTransactionManagerOptions {
  initialFilters?: TransactionFilters
  autoRefresh?: boolean
}

export function useTransactionManager(options: UseTransactionManagerOptions = {}) {
  const { initialFilters, autoRefresh = true } = options
  
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters || {})
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())

  // API hooks
  const { data: transactionsData, loading: loadingTransactions, error: transactionsError, refetch } = useTransactions(filters)
  const { createTransaction, loading: creating, error: createError } = useCreateTransaction()
  const { updateTransaction, loading: updating, error: updateError } = useUpdateTransaction()
  const { deleteTransaction, loading: deleting, error: deleteError } = useDeleteTransaction()

  // Computed values
  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData?.data])
  const pagination = useMemo(() => transactionsData?.pagination, [transactionsData?.pagination])
  const hasTransactions = transactions.length > 0
  const selectedCount = selectedTransactions.size
  const isLoading = loadingTransactions || creating || updating || deleting

  // Error handling
  const currentError = transactionsError || createError || updateError || deleteError

  // Filter operations
  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const setDateFilter = useCallback((startDate?: string, endDate?: string) => {
    updateFilters({ startDate, endDate })
  }, [updateFilters])

  const setCategoryFilter = useCallback((category?: string) => {
    updateFilters({ category })
  }, [updateFilters])

  const setTypeFilter = useCallback((type?: 'income' | 'expense' | 'transfer') => {
    updateFilters({ type })
  }, [updateFilters])

  const setPagination = useCallback((page: number, limit?: number) => {
    updateFilters({ page, limit })
  }, [updateFilters])

  // Selection operations
  const toggleSelection = useCallback((transactionId: string) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId)
      } else {
        newSet.add(transactionId)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedTransactions(new Set(transactions.map(t => t.id).filter((id): id is string => id !== undefined)))
  }, [transactions])

  const clearSelection = useCallback(() => {
    setSelectedTransactions(new Set())
  }, [])

  const isSelected = useCallback((transactionId: string) => {
    return selectedTransactions.has(transactionId)
  }, [selectedTransactions])

  // CRUD operations with auto-refresh
  const handleCreate = useCallback(async (transactionData: CreateTransactionDto): Promise<Transaction | null> => {
    const result = await createTransaction(transactionData)
    if (result && autoRefresh) {
      await refetch()
    }
    return result
  }, [createTransaction, autoRefresh, refetch])

  const handleUpdate = useCallback(async (
    id: string,
    transactionData: UpdateTransactionDto
  ): Promise<Transaction | null> => {
    const result = await updateTransaction(id, transactionData)
    if (result && autoRefresh) {
      await refetch()
    }
    return result
  }, [updateTransaction, autoRefresh, refetch])

  const handleDelete = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteTransaction(id)
    if (result && autoRefresh) {
      await refetch()
      setSelectedTransactions(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
    return result
  }, [deleteTransaction, autoRefresh, refetch])

  const handleBulkDelete = useCallback(async (ids: string[]): Promise<boolean[]> => {
    const results = await Promise.all(ids.map(id => deleteTransaction(id)))
    if (results.some(r => r) && autoRefresh) {
      await refetch()
      setSelectedTransactions(prev => {
        const newSet = new Set(prev)
        ids.forEach(id => newSet.delete(id))
        return newSet
      })
    }
    return results
  }, [deleteTransaction, autoRefresh, refetch])

  const deleteSelected = useCallback(async (): Promise<boolean[]> => {
    const selectedIds = Array.from(selectedTransactions)
    return handleBulkDelete(selectedIds)
  }, [selectedTransactions, handleBulkDelete])

  // Statistics and summaries
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalTransfers = transactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0)

    const netAmount = totalIncome - totalExpenses

    return {
      totalIncome,
      totalExpenses,
      totalTransfers,
      netAmount,
      transactionCount: transactions.length,
    }
  }, [transactions])

  // Helper functions
  const getTransactionById = useCallback((id: string): Transaction | undefined => {
    return transactions.find(t => t.id === id)
  }, [transactions])

  const getTransactionsByCategory = useCallback((category: string): Transaction[] => {
    return transactions.filter(t => t.type !== 'transfer' && t.category === category)
  }, [transactions])

  const getTransactionsByType = useCallback((type: 'income' | 'expense' | 'transfer'): Transaction[] => {
    return transactions.filter(t => t.type === type)
  }, [transactions])

  const getUniqueCategories = useCallback((): string[] => {
    const categories = new Set(
      transactions
        .filter((t): t is Exclude<Transaction, { type: 'transfer' }> => t.type !== 'transfer')
        .map(t => t.category)
        .filter(Boolean)
    )
    return Array.from(categories).sort()
  }, [transactions])

  // Refresh function
  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    // Data
    transactions,
    pagination,
    hasTransactions,
    summary,
    
    // Loading and error states
    isLoading,
    loadingTransactions,
    creating,
    updating,
    deleting,
    error: currentError,
    
    // Filters
    filters,
    updateFilters,
    clearFilters,
    setDateFilter,
    setCategoryFilter,
    setTypeFilter,
    setPagination,
    
    // Selection
    selectedTransactions: Array.from(selectedTransactions),
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    
    // CRUD operations
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    bulkDelete: handleBulkDelete,
    deleteSelected,
    
    // Helper functions
    getTransactionById,
    getTransactionsByCategory,
    getTransactionsByType,
    getUniqueCategories,
    
    // Refresh
    refresh,
  }
}
