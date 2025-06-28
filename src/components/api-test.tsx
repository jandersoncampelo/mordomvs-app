"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactionManager } from "@/hooks/use-transaction-manager"
import type { CreateTransactionDto } from "@/types/api"

export default function ApiTestComponent() {
  const [testResult, setTestResult] = useState<string>("")

  // Hook principal para gerenciar transações via API
  const {
    transactions,
    isLoading,
    error,
    summary,
    create,
    refresh,
    hasTransactions,
  } = useTransactionManager({
    initialFilters: { limit: 10 },
    autoRefresh: true,
  })

  // Função para testar criação de transação
  const testCreateTransaction = async () => {
    setTestResult("Criando transação de teste...")
    
    const testTransaction: CreateTransactionDto = {
      type: 'expense',
      amount: 25.50,
      category: 'Food & Dining',
      description: 'Teste de API - Lanche da tarde',
      date: new Date().toISOString().split('T')[0],
      paymentType: 'single',
    }

    try {
      const result = await create(testTransaction)
      if (result) {
        setTestResult(`✅ Transação criada com sucesso! ID: ${result.id}`)
      } else {
        setTestResult("❌ Falha ao criar transação")
      }
    } catch (error) {
      setTestResult(`❌ Erro: ${error}`)
    }
  }

  // Função para testar refresh dos dados
  const testRefresh = async () => {
    setTestResult("Atualizando dados...")
    try {
      await refresh()
      setTestResult("✅ Dados atualizados com sucesso!")
    } catch (error) {
      setTestResult(`❌ Erro ao atualizar: ${error}`)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste da API de Transações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da API */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Status</h3>
              <p className="text-blue-600">
                {isLoading ? "🔄 Carregando..." : "✅ Conectado"}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Transações</h3>
              <p className="text-green-600">{transactions.length} carregadas</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800">Saldo</h3>
              <p className="text-purple-600">
                R$ {summary?.netAmount?.toFixed(2) ?? "0,00"}
              </p>
            </div>
          </div>

          {/* Erro se houver */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800">Erro na API</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Controles de teste */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testCreateTransaction}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Testar Criação
            </Button>
            <Button 
              onClick={testRefresh}
              disabled={isLoading}
              variant="outline"
            >
              Atualizar Dados
            </Button>
          </div>

          {/* Resultado do teste */}
          {testResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800">Resultado do Teste</h3>
              <p className="text-gray-600">{testResult}</p>
            </div>
          )}

          {/* Lista resumida de transações */}
          {hasTransactions && (
            <div className="space-y-2">
              <h3 className="font-semibold">Últimas Transações</h3>              <div className="max-h-48 overflow-y-auto space-y-2">
                {transactions.slice(0, 5).map((transaction) => {
                  const getTransactionColor = (type: string) => {
                    if (type === 'income') return 'text-green-600'
                    if (type === 'expense') return 'text-red-600'
                    return 'text-blue-600'
                  }

                  const getTransactionSymbol = (type: string) => {
                    if (type === 'income') return '+'
                    if (type === 'expense') return '-'
                    return '↔'
                  }

                  return (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center p-2 bg-white rounded border"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.transactionDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {getTransactionSymbol(transaction.type)} R$ {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Resumo estatístico */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Receitas</p>
                <p className="font-semibold text-green-600">
                  R$ {summary.totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Despesas</p>
                <p className="font-semibold text-red-600">
                  R$ {summary.totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Transferências</p>
                <p className="font-semibold text-blue-600">
                  R$ {summary.totalTransfers.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold">
                  {summary.transactionCount} transações
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
