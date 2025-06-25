/**
 * Serviço para gerenciar transações via API
 */

import { apiClient } from '@/lib/api'
import type { Transaction } from '@/types/transaction'
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  PaginatedResponse,
  MonthlyStatsDto,
  PeriodSummaryDto,
  CategoryReportDto,
  RecurringForecastDto,
  TrendAnalysisDto,
  ExportOptions,
  BackupDto,
  SyncStatus,
  UserPreferencesDto,
} from '@/types/api'

export class TransactionService {
  private readonly basePath = '/transactions'

  // CRUD Operations
  async getAllTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params: Record<string, string> = {}
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value.toString()
        }
      })
    }

    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      this.basePath,
      Object.keys(params).length > 0 ? params : undefined
    )
    
    return response.data
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`${this.basePath}/${id}`)
    return response.data
  }

  async createTransaction(transaction: CreateTransactionDto): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(this.basePath, transaction)
    return response.data
  }

  async updateTransaction(id: string, transaction: UpdateTransactionDto): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(`${this.basePath}/${id}`, transaction)
    return response.data
  }

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  async bulkDeleteTransactions(ids: string[]): Promise<void> {
    await apiClient.post(`${this.basePath}/bulk-delete`, { ids })
  }

  // Relatórios e Estatísticas
  async getMonthlyStats(month: number, year: number): Promise<MonthlyStatsDto> {
    const response = await apiClient.get<MonthlyStatsDto>(
      `${this.basePath}/stats/monthly`,
      { month: month.toString(), year: year.toString() }
    )
    return response.data
  }

  async getPeriodSummary(startDate: string, endDate: string): Promise<PeriodSummaryDto> {
    const response = await apiClient.get<PeriodSummaryDto>(
      `${this.basePath}/stats/period`,
      { startDate, endDate }
    )
    return response.data
  }

  async getCategoryReport(
    category?: string,
    startDate?: string,
    endDate?: string
  ): Promise<CategoryReportDto[]> {
    const params: Record<string, string> = {}
    if (category) params.category = category
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await apiClient.get<CategoryReportDto[]>(
      `${this.basePath}/reports/categories`,
      Object.keys(params).length > 0 ? params : undefined
    )
    return response.data
  }

  async getRecurringForecast(): Promise<RecurringForecastDto[]> {
    const response = await apiClient.get<RecurringForecastDto[]>(
      `${this.basePath}/forecast/recurring`
    )
    return response.data
  }

  async getTrendAnalysis(
    period: 'monthly' | 'quarterly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<TrendAnalysisDto> {
    const params: Record<string, string> = { period }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await apiClient.get<TrendAnalysisDto>(
      `${this.basePath}/analysis/trends`,
      params
    )
    return response.data
  }

  // Importação e Exportação
  async exportTransactions(options: ExportOptions): Promise<Blob> {
    const response = await fetch('/api/transactions/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error('Erro ao exportar transações')
    }

    return response.blob()
  }

  async importTransactions(file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/transactions/import', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Erro ao importar transações')
    }

    return response.json()
  }

  // Backup e Sincronização
  async createBackup(): Promise<BackupDto> {
    const response = await apiClient.post<BackupDto>(`${this.basePath}/backup`)
    return response.data
  }

  async getBackups(): Promise<BackupDto[]> {
    const response = await apiClient.get<BackupDto[]>(`${this.basePath}/backups`)
    return response.data
  }

  async restoreBackup(backupId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/backup/${backupId}/restore`)
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const response = await apiClient.get<SyncStatus>(`${this.basePath}/sync/status`)
    return response.data
  }

  async syncTransactions(): Promise<SyncStatus> {
    const response = await apiClient.post<SyncStatus>(`${this.basePath}/sync`)
    return response.data
  }

  // Configurações
  async getUserPreferences(): Promise<UserPreferencesDto> {
    const response = await apiClient.get<UserPreferencesDto>('/user/preferences')
    return response.data
  }

  async updateUserPreferences(preferences: Partial<UserPreferencesDto>): Promise<UserPreferencesDto> {
    const response = await apiClient.put<UserPreferencesDto>('/user/preferences', preferences)
    return response.data
  }

  // Categorias
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.basePath}/categories`)
    return response.data
  }

  async createCategory(category: string): Promise<string> {
    const response = await apiClient.post<{ category: string }>(`${this.basePath}/categories`, {
      category,
    })
    return response.data.category
  }

  async deleteCategory(category: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/categories/${encodeURIComponent(category)}`)
  }

  // Busca e Filtros
  async searchTransactions(
    query: string,
    filters?: Omit<TransactionFilters, 'page' | 'limit'>
  ): Promise<Transaction[]> {
    const params: Record<string, string> = { q: query }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value.toString()
        }
      })
    }

    const response = await apiClient.get<Transaction[]>(`${this.basePath}/search`, params)
    return response.data
  }

  // Duplicatas
  async findDuplicates(): Promise<Transaction[][]> {
    const response = await apiClient.get<Transaction[][]>(`${this.basePath}/duplicates`)
    return response.data
  }

  async mergeDuplicates(keepId: string, mergeIds: string[]): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(`${this.basePath}/merge`, {
      keepId,
      mergeIds,
    })
    return response.data
  }

  // Validação
  async validateTransaction(transaction: CreateTransactionDto): Promise<{ valid: boolean; errors: string[] }> {
    const response = await apiClient.post<{ valid: boolean; errors: string[] }>(
      `${this.basePath}/validate`,
      transaction
    )
    return response.data
  }
}

// Instância singleton do serviço
export const transactionService = new TransactionService()
