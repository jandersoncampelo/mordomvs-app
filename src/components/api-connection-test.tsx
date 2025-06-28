"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApiConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error' | 'idle'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [apiInfo, setApiInfo] = useState<any>(null)

  const testConnection = async () => {
    setConnectionStatus('testing')
    setErrorMessage('')
    setApiInfo(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/finance'
      
      // Teste básico de conectividade
      const response = await fetch(`${apiUrl}/transactions?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setConnectionStatus('connected')
      setApiInfo({
        url: `${apiUrl}/transactions`,
        status: response.status,
        responseTime: 'OK',
        dataReceived: data,
      })

    } catch (error) {
      setConnectionStatus('error')
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Erro desconhecido ao conectar com a API')
      }
    }
  }

  const testCreateTransaction = async () => {
    setConnectionStatus('testing')
    setErrorMessage('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/finance'
      
      const testTransaction = {
        type: 'expense',
        amount: 10.50,
        description: 'Teste de conexão com API',
        date: new Date().toISOString().split('T')[0],
        category: 'e2f1a9b3-1c7e-4b1e-933e-017e1a01a001',
        paymentType: 'single',
      }

      const response = await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testTransaction),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setConnectionStatus('connected')
      setApiInfo({
        url: `${apiUrl}/transactions`,
        method: 'POST',
        status: response.status,
        transactionCreated: data,
      })

    } catch (error) {
      setConnectionStatus('error')
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Erro desconhecido ao criar transação de teste')
      }
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'text-yellow-600 bg-yellow-50'
      case 'connected': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return '🔄'
      case 'connected': return '✅'
      case 'error': return '❌'
      default: return '⚪'
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão com API Externa</CardTitle>
        <p className="text-sm text-gray-600">
          Endpoint: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/finance'}/transactions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da conexão */}
        <div className={`p-4 rounded-lg ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <h3 className="font-semibold">
                Status da Conexão: {connectionStatus === 'idle' ? 'Não testado' : 
                                   connectionStatus === 'testing' ? 'Testando...' :
                                   connectionStatus === 'connected' ? 'Conectado' : 'Erro'}
              </h3>
              {errorMessage && (
                <p className="text-sm mt-1">{errorMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testConnection}
            disabled={connectionStatus === 'testing'}
            variant="outline"
          >
            {connectionStatus === 'testing' ? 'Testando...' : 'Testar GET'}
          </Button>
          
          <Button 
            onClick={testCreateTransaction}
            disabled={connectionStatus === 'testing'}
            variant="outline"
          >
            {connectionStatus === 'testing' ? 'Testando...' : 'Testar POST'}
          </Button>
        </div>

        {/* Informações da API */}
        {apiInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Informações da Resposta</h3>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-60">
              {JSON.stringify(apiInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Instruções */}
        <div className="text-sm text-gray-600 space-y-2">
          <h3 className="font-semibold">Instruções:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Certifique-se de que a API externa está rodando em <code>http://localhost:5000</code></li>
            <li>Verifique se o endpoint <code>/api/finance/transactions</code> está disponível</li>
            <li>Configure a variável de ambiente <code>NEXT_PUBLIC_API_URL</code> se necessário</li>
            <li>Teste primeiro o GET para verificar conectividade</li>
            <li>Teste o POST para verificar se é possível criar transações</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
