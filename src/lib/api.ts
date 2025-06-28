/**
 * Configuração do cliente HTTP para a API
 */

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/finance'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

// Classe personalizada para erros da API
export class ApiException extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.code = code
  }
}

// Configuração do cliente HTTP
class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Método para adicionar headers de autenticação
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    }
  }

  // Método para remover token de autenticação
  removeAuthToken() {
    const headers = { ...this.defaultHeaders } as Record<string, string>
    delete headers.Authorization
    this.defaultHeaders = headers
  }

  // Método privado para fazer requisições
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      // Verifica se a resposta é JSON
      const contentType = response.headers.get('content-type')
      const isJson = contentType && contentType.includes('application/json')
      
      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`
        let errorCode = response.status.toString()
        
        if (isJson) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
            errorCode = errorData.code || errorCode
          } catch {
            // Se não conseguir fazer parse do JSON de erro, usa a mensagem padrão
          }
        }
        
        throw new ApiException(errorMessage, response.status, errorCode)
      }

      if (isJson) {
        return await response.json()
      }

      // Para respostas que não são JSON
      return {
        data: await response.text() as T,
        success: true,
      }
    } catch (error) {
      if (error instanceof ApiException) {
        throw error
      }
      
      // Erro de rede ou outros erros
      throw new ApiException(
        error instanceof Error ? error.message : 'Erro desconhecido',
        0,
        'NETWORK_ERROR'
      )
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = endpoint
    
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }
    
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient(API_BASE_URL)

// Função utilitária para tratamento de erros
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiException) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Erro desconhecido'
}
