/**
 * Componente de exemplo mostrando como usar a nova estrutura de API
 */

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTransactionManager } from '@/hooks/use-transaction-manager'
import { useMonthlyStats } from '@/hooks/use-api'
import { dataFormatters } from '@/lib/api-utils'
import type { CreateTransactionDto } from '@/types/api'

export default function ApiExampleComponent() {
  const [showStats, setShowStats] = useState(false)
  
  // Hook principal para gerenciar transações
  const {
    transactions,
    isLoading,
    error,
    summary,
    filters,
    create,
    update,
    delete: deleteTransaction,
    refresh,
    selectedTransactions,
    toggleSelection,
    deleteSelected,
    getUniqueCategories,
  } = useTransactionManager({
    initialFilters: { limit: 10 },
    autoRefresh: true,
  })

  // Hook para estatísticas mensais
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const { data: monthlyStats, loading: statsLoading } = useMonthlyStats(currentMonth, currentYear)

  // Função para criar uma transação de exemplo
  const handleCreateExample = async () => {
    const exampleTransaction: CreateTransactionDto = {
      type: 'expense',
      amount: 50.00,
      category: 'Food & Dining',
      description: 'Almoço executivo - Teste API',
      date: new Date().toISOString().split('T')[0],
      paymentType: 'single',
    }

    const result = await create(exampleTransaction)
    if (result) {
      console.log('Transação criada com sucesso:', result)
    }
  }

  // Função para atualizar uma transação
  const handleUpdateExample = async (transactionId: string) => {
    const result = await update(transactionId, {
      id: transactionId,
      description: 'Descrição atualizada via API',
      amount: 75.00,
    })
    
    if (result) {
      console.log('Transação atualizada com sucesso:', result)
    }
  }

  // Função para deletar uma transação
  const handleDeleteExample = async (transactionId: string) => {
    const result = await deleteTransaction(transactionId)
    if (result) {
      console.log('Transação deletada com sucesso')
    }
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Erro na API</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button onClick={refresh} className="mt-4">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles da API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateExample} disabled={isLoading}>
              Criar Transação Exemplo
            </Button>
            <Button onClick={refresh} disabled={isLoading}>
              Atualizar Lista
            </Button>
            <Button 
              onClick={() => setShowStats(!showStats)} 
              variant={showStats ? 'secondary' : 'outline'}
            >
              {showStats ? 'Ocultar' : 'Mostrar'} Estatísticas
            </Button>
            {selectedTransactions.length > 0 && (
              <Button onClick={deleteSelected} variant="destructive" disabled={isLoading}>
                Deletar Selecionadas ({selectedTransactions.length})
              </Button>
            )}
          </div>
          
          {isLoading && (
            <div className="text-blue-600">
              Carregando dados da API...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total de Transações</p>
              <p className="text-2xl font-bold">{summary.transactionCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {dataFormatters.currency(summary.totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {dataFormatters.currency(summary.totalExpenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dataFormatters.currency(summary.netAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Mensais */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Mensais (API)</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading && <p>Carregando estatísticas...</p>}
            {!statsLoading && !monthlyStats && <p>Nenhuma estatística disponível.</p>}
            {!statsLoading && monthlyStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Receitas do Mês</p>
                    <p className="text-xl font-bold text-green-600">
                      {dataFormatters.currency(monthlyStats.totalIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Despesas do Mês</p>
                    <p className="text-xl font-bold text-red-600">
                      {dataFormatters.currency(monthlyStats.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transações</p>
                    <p className="text-xl font-bold">{monthlyStats.transactionCount}</p>
                  </div>
                </div>
                
                {monthlyStats.categoryBreakdown && monthlyStats.categoryBreakdown.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Gastos por Categoria</h4>
                    <div className="space-y-2">
                      {monthlyStats.categoryBreakdown.map((cat) => (
                        <div key={cat.category} className="flex justify-between items-center">
                          <span>{cat.category}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {dataFormatters.percentage(cat.percentage)}
                            </Badge>
                            <span className="font-semibold">
                              {dataFormatters.currency(cat.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações (Via API)</CardTitle>
          <p className="text-sm text-gray-600">
            Filtros ativos: {Object.keys(filters).length > 0 ? JSON.stringify(filters) : 'Nenhum'}
          </p>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma transação encontrada.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 border rounded-lg flex justify-between items-center ${
                    selectedTransactions.includes(transaction.id!) ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id!)}
                      onChange={() => transaction.id && toggleSelection(transaction.id)}
                      className="rounded"
                    />
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.type !== 'transfer' && transaction.category} • {' '}
                        {dataFormatters.date(transaction.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(() => {
                      let badgeVariant: 'default' | 'destructive' | 'secondary'
                      if (transaction.type === 'income') {
                        badgeVariant = 'default'
                      } else if (transaction.type === 'expense') {
                        badgeVariant = 'destructive'
                      } else {
                        badgeVariant = 'secondary'
                      }
                      return <Badge variant={badgeVariant}>{transaction.type}</Badge>
                    })()}
                    
                    {(() => {
                      let colorClass: string
                      if (transaction.type === 'income') {
                        colorClass = 'text-green-600'
                      } else if (transaction.type === 'expense') {
                        colorClass = 'text-red-600'
                      } else {
                        colorClass = 'text-blue-600'
                      }
                      return <span className={`font-bold ${colorClass}`}>
                        {dataFormatters.currency(transaction.amount)}
                      </span>
                    })()}
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => transaction.id && handleUpdateExample(transaction.id)}
                        disabled={isLoading}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => transaction.id && handleDeleteExample(transaction.id)}
                        disabled={isLoading}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getUniqueCategories().map((category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
