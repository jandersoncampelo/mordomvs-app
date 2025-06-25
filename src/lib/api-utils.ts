/**
 * Utilitários para configuração e interceptadores da API
 */

import { apiClient } from './api'

// Configuração de autenticação
export const authUtils = {
  // Salvar token no localStorage
  saveToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      apiClient.setAuthToken(token)
    }
  },

  // Recuperar token do localStorage
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  },

  // Remover token e fazer logout
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      apiClient.removeAuthToken()
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: (): boolean => {
    return authUtils.getToken() !== null
  },

  // Inicializar autenticação (chamar no app startup)
  initialize: () => {
    const token = authUtils.getToken()
    if (token) {
      apiClient.setAuthToken(token)
    }
  },
}

// Configurações da API
export const apiConfig = {
  // URLs base para diferentes ambientes
  baseUrls: {
    development: 'http://localhost:3001/api',
    staging: 'https://api-staging.mordomvs.com',
    production: 'https://api.mordomvs.com',
  },

  // Configurações de timeout
  timeout: {
    default: 10000, // 10 segundos
    upload: 60000,  // 1 minuto para uploads
    download: 120000, // 2 minutos para downloads
  },

  // Configurações de retry
  retry: {
    attempts: 3,
    delay: 1000, // 1 segundo
    backoff: 2,  // Multiplicador exponencial
  },

  // Headers padrão
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// Interceptadores de request e response
export const interceptors = {
  // Interceptador de request para adicionar loading global
  request: {
    onFulfilled: (config: RequestInit) => {
      // Aqui você pode adicionar loading global, logs, etc.
      console.log('API Request:', config)
      return config
    },
    onRejected: (error: unknown) => {
      console.error('API Request Error:', error)
      return Promise.reject(error)
    },
  },

  // Interceptador de response para tratamento global de erros
  response: {
    onFulfilled: (response: Response) => {
      console.log('API Response:', response.status, response.url)
      return response
    },
    onRejected: (error: unknown) => {
      console.error('API Response Error:', error)
      
      // Tratamento específico para diferentes tipos de erro
      if (error instanceof Error) {
        // Erro de rede
        if (error.message.includes('fetch')) {
          console.error('Network error:', error.message)
          // Você pode mostrar uma notificação de erro de rede aqui
        }
        
        // Erro de timeout
        if (error.message.includes('timeout')) {
          console.error('Request timeout:', error.message)
          // Você pode mostrar uma notificação de timeout aqui
        }
      }
      
      return Promise.reject(error)
    },
  },
}

// Utilitários para tratamento de erros específicos
export const errorHandlers = {
  // Erro de autenticação (401)
  unauthorized: () => {
    console.log('Unauthorized access - redirecting to login')
    authUtils.removeToken()
    // Redirecionar para login ou mostrar modal de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  // Erro de permissão (403)
  forbidden: () => {
    console.log('Access forbidden')
    // Mostrar mensagem de erro de permissão
  },

  // Erro de recurso não encontrado (404)
  notFound: (resource?: string) => {
    console.log(`Resource not found: ${resource || 'Unknown'}`)
    // Mostrar mensagem de recurso não encontrado
  },

  // Erro do servidor (5xx)
  serverError: (status: number) => {
    console.log(`Server error: ${status}`)
    // Mostrar mensagem de erro do servidor
  },

  // Erro de validação (400)
  validation: (errors: string[]) => {
    console.log('Validation errors:', errors)
    // Mostrar erros de validação específicos
    return errors
  },
}

// Utilitários para cache e persistência
export const cacheUtils = {
  // Cache em memória simples
  memoryCache: new Map<string, { data: unknown; timestamp: number; ttl: number }>(),

  // Salvar no cache
  set: <T>(key: string, data: T, ttlMs: number = 300000) => { // 5 minutos por padrão
    cacheUtils.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  },

  // Recuperar do cache
  get: <T>(key: string): T | null => {
    const cached = cacheUtils.memoryCache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      cacheUtils.memoryCache.delete(key)
      return null
    }

    return cached.data as T
  },

  // Limpar cache específico
  delete: (key: string) => {
    cacheUtils.memoryCache.delete(key)
  },

  // Limpar todo o cache
  clear: () => {
    cacheUtils.memoryCache.clear()
  },

  // Limpar cache expirado
  cleanup: () => {
    const now = Date.now()
    for (const [key, value] of cacheUtils.memoryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        cacheUtils.memoryCache.delete(key)
      }
    }
  },
}

// Utilitários para formatação de dados
export const dataFormatters = {
  // Formatar valores monetários
  currency: (amount: number, currency: string = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  // Formatar datas
  date: (date: string | Date, format: 'short' | 'long' | 'numeric' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('pt-BR')
      case 'long':
        return dateObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      case 'numeric':
        return dateObj.toISOString().split('T')[0]
      default:
        return dateObj.toLocaleDateString('pt-BR')
    }
  },

  // Formatar números
  number: (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  },

  // Formatar percentuais
  percentage: (value: number, decimals: number = 1): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100)
  },
}

// Inicialização automática do sistema de autenticação
if (typeof window !== 'undefined') {
  authUtils.initialize()
  
  // Limpeza periódica do cache (a cada 10 minutos)
  setInterval(() => {
    cacheUtils.cleanup()
  }, 600000)
}
