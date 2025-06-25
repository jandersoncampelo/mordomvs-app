/**
 * Hooks personalizados para operações com transações via API
 */

import { useState, useEffect, useCallback } from 'react'
import { transactionService } from '@/services/transaction.service'
import { handleApiError } from '@/lib/api'
import type { Transaction } from '@/types/transaction'
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  PaginatedResponse,
  MonthlyStatsDto,
} from '@/types/api'

// Hook para gerenciar estado de loading e erro
interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiMutationState {
  loading: boolean
  error: string | null
}

// Hook para buscar transações com paginação e filtros
export function useTransactions(filters?: TransactionFilters) {
  const [state, setState] = useState<ApiState<PaginatedResponse<Transaction>>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchTransactions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const data = await transactionService.getAllTransactions(filters)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: handleApiError(error) })
    }
  }, [filters])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    ...state,
    refetch: fetchTransactions,
  }
}

// Hook para buscar uma transação específica
export function useTransaction(id: string | null) {
  const [state, setState] = useState<ApiState<Transaction>>({
    data: null,
    loading: !!id,
    error: null,
  })

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null })
      return
    }

    const fetchTransaction = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const data = await transactionService.getTransactionById(id)
        setState({ data, loading: false, error: null })
      } catch (error) {
        setState({ data: null, loading: false, error: handleApiError(error) })
      }
    }

    fetchTransaction()
  }, [id])

  return state
}

// Hook para criar transações
export function useCreateTransaction() {
  const [state, setState] = useState<ApiMutationState>({
    loading: false,
    error: null,
  })

  const createTransaction = useCallback(async (transaction: CreateTransactionDto): Promise<Transaction | null> => {
    try {
      setState({ loading: true, error: null })
      const result = await transactionService.createTransaction(transaction)
      setState({ loading: false, error: null })
      return result
    } catch (error) {
      setState({ loading: false, error: handleApiError(error) })
      return null
    }
  }, [])

  return {
    ...state,
    createTransaction,
  }
}

// Hook para atualizar transações
export function useUpdateTransaction() {
  const [state, setState] = useState<ApiMutationState>({
    loading: false,
    error: null,
  })

  const updateTransaction = useCallback(async (
    id: string,
    transaction: UpdateTransactionDto
  ): Promise<Transaction | null> => {
    try {
      setState({ loading: true, error: null })
      const result = await transactionService.updateTransaction(id, transaction)
      setState({ loading: false, error: null })
      return result
    } catch (error) {
      setState({ loading: false, error: handleApiError(error) })
      return null
    }
  }, [])

  return {
    ...state,
    updateTransaction,
  }
}

// Hook para deletar transações
export function useDeleteTransaction() {
  const [state, setState] = useState<ApiMutationState>({
    loading: false,
    error: null,
  })

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState({ loading: true, error: null })
      await transactionService.deleteTransaction(id)
      setState({ loading: false, error: null })
      return true
    } catch (error) {
      setState({ loading: false, error: handleApiError(error) })
      return false
    }
  }, [])

  return {
    ...state,
    deleteTransaction,
  }
}

// Hook para estatísticas mensais
export function useMonthlyStats(month: number, year: number) {
  const [state, setState] = useState<ApiState<MonthlyStatsDto>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const data = await transactionService.getMonthlyStats(month, year)
        setState({ data, loading: false, error: null })
      } catch (error) {
        setState({ data: null, loading: false, error: handleApiError(error) })
      }
    }

    fetchStats()
  }, [month, year])

  return state
}

// Hook para buscar categorias
export function useCategories() {
  const [state, setState] = useState<ApiState<string[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const data = await transactionService.getCategories()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: handleApiError(error) })
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    ...state,
    refetch: fetchCategories,
  }
}

// Hook para operações de busca
export function useTransactionSearch() {
  const [state, setState] = useState<ApiState<Transaction[]>>({
    data: null,
    loading: false,
    error: null,
  })

  const searchTransactions = useCallback(async (
    query: string,
    filters?: Omit<TransactionFilters, 'page' | 'limit'>
  ) => {
    if (!query.trim()) {
      setState({ data: null, loading: false, error: null })
      return
    }

    try {
      setState({ data: null, loading: true, error: null })
      const data = await transactionService.searchTransactions(query, filters)
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: handleApiError(error) })
    }
  }, [])

  const clearSearch = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    searchTransactions,
    clearSearch,
  }
}

// Hook para operações assíncronas genéricas
export function useAsyncOperation<T extends (...args: unknown[]) => Promise<unknown>>(
  operation: T
) {
  const [state, setState] = useState<ApiMutationState>({
    loading: false,
    error: null,
  })

  const execute = useCallback(async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
    try {
      setState({ loading: true, error: null })
      const result = await operation(...args)
      setState({ loading: false, error: null })
      return result as Awaited<ReturnType<T>>
    } catch (error) {
      setState({ loading: false, error: handleApiError(error) })
      return null
    }
  }, [operation])

  return {
    ...state,
    execute,
  }
}

// Hook para gerenciar cache simples de dados
export function useApiCache<T>(key: string, fetcher: () => Promise<T>, dependencies: unknown[] = []) {
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map())
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  const fetchData = useCallback(async () => {
    const cached = cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setState({ data: cached.data, loading: false, error: null })
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const data = await fetcher()
      setCache(prev => new Map(prev).set(key, { data, timestamp: now }))
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: handleApiError(error) })
    }
  }, [key, fetcher, cache, CACHE_DURATION])

  const invalidateCache = useCallback(() => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
  }, [key])

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...dependencies])

  return {
    ...state,
    refetch: fetchData,
    invalidateCache,
  }
}
