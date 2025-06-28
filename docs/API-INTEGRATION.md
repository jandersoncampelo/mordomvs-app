# API de Transações - Integração com Hooks

Este documento explica como a aplicação foi migrada para usar hooks personalizados para integração com a API de transações.

## 🏗️ Estrutura da API

### Hooks Principais

#### `useTransactionManager`
Hook principal que centraliza todas as operações com transações:

```typescript
const {
  transactions,        // Lista de transações
  isLoading,          // Estado de carregamento
  error,              // Erros da API
  summary,            // Resumo estatístico
  create,             // Criar transação
  update,             // Atualizar transação
  delete,             // Deletar transação
  refresh,            // Recarregar dados
  filters,            // Filtros ativos
  updateFilters,      // Atualizar filtros
  selectedTransactions, // Transações selecionadas
  // ... outros métodos
} = useTransactionManager({
  initialFilters: { limit: 10 },
  autoRefresh: true,
})
```

#### `useTransactions`
Hook para buscar transações com filtros e paginação:

```typescript
const { data, loading, error, refetch } = useTransactions({
  type: 'expense',
  category: 'Food',
  startDate: '2025-06-01',
  endDate: '2025-06-30',
  page: 1,
  limit: 10
})
```

#### `useCreateTransaction`
Hook para criar novas transações:

```typescript
const { createTransaction, loading, error } = useCreateTransaction()

const newTransaction = await createTransaction({
  type: 'expense',
  amount: 50.00,
  description: 'Almoço',
  category: 'Food & Dining',
  date: '2025-06-25',
  paymentType: 'single'
})
```

### Tipos de Dados

#### `CreateTransactionDto`
```typescript
interface CreateTransactionDto {
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  date: string
  category?: string
  paymentType: 'single' | 'installment' | 'recurring' | 'fixed-recurring'
  installments?: number
  currentInstallment?: number
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  fromAccount?: string
  toAccount?: string
}
```

#### `TransactionFilters`
```typescript
interface TransactionFilters {
  type?: 'income' | 'expense' | 'transfer'
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
```

## 🚀 Uso Prático

### 1. Componente Básico
```tsx
export default function TransactionsPage() {
  const {
    transactions,
    isLoading,
    error,
    create,
    update,
    delete: deleteTransaction,
  } = useTransactionManager()

  const handleCreateTransaction = async () => {
    const result = await create({
      type: 'expense',
      amount: 100.00,
      description: 'Nova despesa',
      date: new Date().toISOString().split('T')[0],
      paymentType: 'single'
    })
    
    if (result) {
      console.log('Transação criada:', result)
    }
  }

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      <button onClick={handleCreateTransaction}>
        Criar Transação
      </button>
      
      {transactions.map(transaction => (
        <div key={transaction.id}>
          {transaction.description} - R$ {transaction.amount}
        </div>
      ))}
    </div>
  )
}
```

### 2. Filtros Avançados
```tsx
const {
  transactions,
  updateFilters,
  filters,
} = useTransactionManager({
  initialFilters: {
    type: 'expense',
    limit: 20
  }
})

// Filtrar por categoria
const filterByCategory = (category: string) => {
  updateFilters({ category })
}

// Filtrar por período
const filterByPeriod = (startDate: string, endDate: string) => {
  updateFilters({ startDate, endDate })
}

// Paginação
const goToPage = (page: number) => {
  updateFilters({ page })
}
```

### 3. Operações em Lote
```tsx
const {
  selectedTransactions,
  toggleSelection,
  selectAll,
  clearSelection,
  deleteSelected,
} = useTransactionManager()

// Selecionar todas as transações
const handleSelectAll = () => {
  selectAll()
}

// Deletar transações selecionadas
const handleDeleteSelected = async () => {
  const results = await deleteSelected()
  console.log('Transações deletadas:', results)
}
```

## 🌐 API Externa

A aplicação agora se conecta a uma API externa rodando em:
```
http://localhost:5000/api/finance/transactions
```

### Endpoints da API Externa
- `GET /api/finance/transactions` - Listar transações com filtros
- `POST /api/finance/transactions` - Criar nova transação
- `GET /api/finance/transactions/[id]` - Buscar transação específica
- `PUT /api/finance/transactions/[id]` - Atualizar transação
- `DELETE /api/finance/transactions/[id]` - Deletar transação

### Parâmetros de Query (GET /api/finance/transactions)
- `type` - Tipo da transação (income, expense, transfer)
- `category` - Categoria
- `startDate` - Data inicial (YYYY-MM-DD)
- `endDate` - Data final (YYYY-MM-DD)
- `page` - Página (padrão: 1)
- `limit` - Itens por página (padrão: 10)
- `sortBy` - Campo para ordenação
- `sortOrder` - Direção da ordenação (asc, desc)

## 🔧 Configuração

### Variáveis de Ambiente
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/finance  # URL base da API externa
```

### Estrutura de Arquivos
```
src/
├── hooks/
│   ├── use-api.ts                 # Hooks básicos da API
│   └── use-transaction-manager.ts # Hook principal
├── services/
│   └── transaction.service.ts     # Serviço da API
├── types/
│   ├── api.ts                     # Tipos da API
│   └── transaction.ts             # Tipos de transação
└── lib/
    ├── api.ts                     # Cliente HTTP
    └── utils.ts                   # Utilitários
```

## 🧪 Testes

O componente `ApiTestComponent` está disponível para testar as funcionalidades:

1. Teste de criação de transações
2. Teste de atualização de dados
3. Visualização do status da conexão
4. Resumo estatístico em tempo real

## 🛠️ Funcionalidades

### ✅ Implementadas
- [x] CRUD completo de transações
- [x] Filtros e paginação
- [x] Seleção múltipla
- [x] Operações em lote
- [x] Cache automático
- [x] Estados de loading e erro
- [x] Auto-refresh opcional
- [x] Tratamento de erros

### 🚧 Planejadas
- [ ] Sincronização offline
- [ ] Otimistic updates
- [ ] Validação de schema
- [ ] Websockets para updates em tempo real
- [ ] Backup e restauração
- [ ] Importação/exportação de dados

## 📝 Notas Importantes

1. **Auto-refresh**: Por padrão, os dados são recarregados automaticamente após operações CRUD
2. **Error Handling**: Todos os erros são capturados e tratados de forma consistente
3. **Paginação**: A API retorna dados paginados para melhor performance
4. **Cache**: Os dados são cacheados localmente para reduzir requisições desnecessárias
5. **TypeScript**: Toda a estrutura é fortemente tipada para melhor DX
