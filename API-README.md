# Estrutura de API - MordomVS

Esta documentação descreve a estrutura de código criada para gerenciar operações HTTP com a API REST do MordomVS.

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   ├── api.ts              # Cliente HTTP principal
│   └── api-utils.ts        # Utilitários e configurações
├── services/
│   └── transaction.service.ts # Serviço de transações
├── hooks/
│   ├── use-api.ts          # Hooks básicos de API
│   └── use-transaction-manager.ts # Hook principal de gerenciamento
├── types/
│   └── api.ts              # Tipos específicos da API
└── components/
    └── api-example.tsx     # Componente de exemplo
```

## 🚀 Componentes Principais

### 1. Cliente HTTP (`lib/api.ts`)

Cliente HTTP centralizado com:
- ✅ Configuração de base URL
- ✅ Tratamento de erros personalizado
- ✅ Suporte a autenticação com tokens
- ✅ Métodos HTTP padrão (GET, POST, PUT, PATCH, DELETE)
- ✅ Tipos TypeScript rigorosos

```typescript
import { apiClient } from '@/lib/api'

// Exemplo de uso direto
const response = await apiClient.get<Transaction[]>('/transactions')
```

### 2. Serviço de Transações (`services/transaction.service.ts`)

Serviço completo para operações com transações:
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Operações em lote
- ✅ Relatórios e estatísticas
- ✅ Busca e filtros
- ✅ Importação/Exportação
- ✅ Backup e sincronização

```typescript
import { transactionService } from '@/services/transaction.service'

// Criar transação
const newTransaction = await transactionService.createTransaction({
  type: 'expense',
  amount: 100.00,
  description: 'Compra supermercado',
  date: '2024-12-24',
  paymentType: 'single'
})
```

### 3. Hooks de API (`hooks/use-api.ts`)

Hooks React para integração fácil:
- ✅ `useTransactions` - Lista de transações com filtros
- ✅ `useTransaction` - Transação específica
- ✅ `useCreateTransaction` - Criar transação
- ✅ `useUpdateTransaction` - Atualizar transação
- ✅ `useDeleteTransaction` - Deletar transação
- ✅ `useMonthlyStats` - Estatísticas mensais
- ✅ `useCategories` - Categorias disponíveis

```typescript
import { useTransactions, useCreateTransaction } from '@/hooks/use-api'

function MyComponent() {
  const { data, loading, error } = useTransactions({ limit: 10 })
  const { createTransaction, loading: creating } = useCreateTransaction()
  
  // Usar os dados...
}
```

### 4. Hook de Gerenciamento (`hooks/use-transaction-manager.ts`)

Hook principal que combina todas as operações:
- ✅ Gerenciamento completo de estado
- ✅ Filtros e paginação
- ✅ Seleção múltipla
- ✅ Operações CRUD com auto-refresh
- ✅ Resumos e estatísticas
- ✅ Funções auxiliares

```typescript
import { useTransactionManager } from '@/hooks/use-transaction-manager'

function TransactionPage() {
  const {
    transactions,
    isLoading,
    create,
    update,
    delete: deleteTransaction,
    summary,
    selectedTransactions,
    toggleSelection,
  } = useTransactionManager()
  
  // Interface completa disponível...
}
```

### 5. Utilitários (`lib/api-utils.ts`)

Utilitários para configuração e formatação:
- ✅ `authUtils` - Gerenciamento de autenticação
- ✅ `apiConfig` - Configurações da API
- ✅ `cacheUtils` - Cache em memória
- ✅ `dataFormatters` - Formatação de dados
- ✅ `errorHandlers` - Tratamento de erros

```typescript
import { authUtils, dataFormatters } from '@/lib/api-utils'

// Autenticação
authUtils.saveToken('jwt-token')
authUtils.isAuthenticated() // true/false

// Formatação
dataFormatters.currency(100.50) // "R$ 100,50"
dataFormatters.date('2024-12-24') // "24/12/2024"
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Inicialização

A autenticação é inicializada automaticamente. Para configurar manualmente:

```typescript
import { authUtils } from '@/lib/api-utils'

// No início da aplicação
authUtils.initialize()
```

## 📚 Tipos de Dados

### Principais Interfaces

```typescript
// Transação para criação
interface CreateTransactionDto {
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category?: string
  description: string
  date: string
  paymentType: 'single' | 'installment' | 'recurring' | 'fixed-recurring'
  // ... outros campos
}

// Filtros de busca
interface TransactionFilters {
  type?: TransactionType
  category?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
}

// Resposta paginada
interface PaginatedResponse<T> {
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
```

## 🎯 Próximos Passos

Para implementar as chamadas à API:

1. **Configure o backend** - Certifique-se de que a API REST está funcionando
2. **Atualize a URL base** - Configure `NEXT_PUBLIC_API_URL` no `.env.local`
3. **Implemente autenticação** - Se necessário, adicione login/logout
4. **Teste as operações** - Use o componente `ApiExampleComponent` para testar
5. **Integre com componentes existentes** - Substitua dados mock pelos hooks de API

## 🔍 Exemplo de Uso Completo

```typescript
"use client"

import { useTransactionManager } from '@/hooks/use-transaction-manager'
import { dataFormatters } from '@/lib/api-utils'

export default function TransactionsPage() {
  const {
    transactions,
    isLoading,
    error,
    create,
    summary,
    setDateFilter,
  } = useTransactionManager({
    initialFilters: { limit: 20 },
    autoRefresh: true,
  })

  if (error) {
    return <div>Erro: {error}</div>
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <h1>Transações</h1>
      
      <div>
        <h2>Resumo</h2>
        <p>Receitas: {dataFormatters.currency(summary.totalIncome)}</p>
        <p>Despesas: {dataFormatters.currency(summary.totalExpenses)}</p>
        <p>Saldo: {dataFormatters.currency(summary.netAmount)}</p>
      </div>

      <div>
        <h2>Lista de Transações</h2>
        {transactions.map(transaction => (
          <div key={transaction.id}>
            <p>{transaction.description}</p>
            <p>{dataFormatters.currency(transaction.amount)}</p>
            <p>{dataFormatters.date(transaction.date)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 📖 Recursos Adicionais

- **Tratamento de Erros**: Todos os hooks incluem tratamento de erro automático
- **Loading States**: Estados de carregamento para melhor UX
- **Cache**: Cache automático para otimizar performance
- **TypeScript**: Tipagem completa para maior segurança
- **Extensibilidade**: Fácil de estender com novos endpoints

---

Esta estrutura fornece uma base sólida para todas as operações de API da aplicação MordomVS! 🚀
