/**
 * Configuração das rotas da API
 */

import { NextRequest, NextResponse } from 'next/server'
import type { Transaction } from '@/types/transaction'
import type { CreateTransactionDto, UpdateTransactionDto, PaginatedResponse } from '@/types/api'

// Mock data para testes (em produção, isso viria do banco de dados)
let mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 50.00,
    description: 'Almoço executivo',
    category: 'Food & Dining',
    transactionDate: '2025-06-25',
    paymentDate: '2025-06-25',
    paymentType: 'single',
  },
  {
    id: '2',
    type: 'income',
    amount: 3000.00,
    description: 'Salário junho',
    category: 'Salary',
    transactionDate: '2025-06-01',
    paymentDate: '2025-06-01',
    paymentType: 'single',
  },
  {
    id: '3',
    type: 'transfer',
    amount: 500.00,
    description: 'Transferência para poupança',
    transactionDate: '2025-06-20',
    paymentDate: '2025-06-20',
    fromAccount: 'Conta Corrente',
    toAccount: 'Poupança',
  },
]

// Handlers para as rotas da API
export const transactionHandlers = {
  // GET /api/transactions
  async getAll(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const type = searchParams.get('type')
      const category = searchParams.get('category')
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')

      let filteredTransactions = [...mockTransactions]

      // Aplicar filtros
      if (type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === type)
      }
      if (category) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.type !== 'transfer' && (t as any).category === category
        )
      }
      if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.transactionDate) >= new Date(startDate)
        )
      }
      if (endDate) {
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.transactionDate) <= new Date(endDate)
        )
      }

      // Paginação
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

      const response: PaginatedResponse<Transaction> = {
        data: paginatedTransactions,
        pagination: {
          total: filteredTransactions.length,
          page,
          limit,
          totalPages: Math.ceil(filteredTransactions.length / limit),
          hasNext: endIndex < filteredTransactions.length,
          hasPrev: page > 1,
        },
      }

      return NextResponse.json(response)
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  },

  // GET /api/transactions/[id]
  async getById(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const transaction = mockTransactions.find(t => t.id === params.id)
      
      if (!transaction) {
        return NextResponse.json(
          { error: 'Transação não encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json(transaction)
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  },

  // POST /api/transactions
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const body: CreateTransactionDto = await request.json()

      // Validação básica
      if (!body.type || !body.amount || !body.description || !body.date) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: type, amount, description, date' },
          { status: 400 }
        )
      }

      // Criar nova transação
      const newTransaction: Transaction = {
        id: (mockTransactions.length + 1).toString(),
        type: body.type,
        amount: body.amount,
        description: body.description,
        transactionDate: body.date,
        paymentDate: body.date,
        ...(body.type !== 'transfer' && { category: body.category || 'Outros' }),
        ...(body.type === 'expense' && {
          paymentType: body.paymentType || 'single',
          installments: body.installments,
          currentInstallment: body.currentInstallment,
          recurringFrequency: body.recurringFrequency,
        }),
        ...(body.type === 'income' && {
          paymentType: body.paymentType || 'single',
          recurringFrequency: body.recurringFrequency,
        }),
        ...(body.type === 'transfer' && {
          fromAccount: body.fromAccount || 'Conta Principal',
          toAccount: body.toAccount || 'Conta Destino',
        }),
      }

      mockTransactions.unshift(newTransaction)

      return NextResponse.json(newTransaction, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  },

  // PUT /api/transactions/[id]
  async update(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const body: UpdateTransactionDto = await request.json()
      const transactionIndex = mockTransactions.findIndex(t => t.id === params.id)

      if (transactionIndex === -1) {
        return NextResponse.json(
          { error: 'Transação não encontrada' },
          { status: 404 }
        )
      }

      // Atualizar transação
      const existingTransaction = mockTransactions[transactionIndex]
      const updatedTransaction: Transaction = {
        ...existingTransaction,
        ...(body.type && { type: body.type }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.description && { description: body.description }),
        ...(body.date && { 
          transactionDate: body.date,
          paymentDate: body.date,
        }),
        ...(body.category && existingTransaction.type !== 'transfer' && { 
          category: body.category 
        }),
      }

      mockTransactions[transactionIndex] = updatedTransaction

      return NextResponse.json(updatedTransaction)
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  },

  // DELETE /api/transactions/[id]
  async delete(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const transactionIndex = mockTransactions.findIndex(t => t.id === params.id)

      if (transactionIndex === -1) {
        return NextResponse.json(
          { error: 'Transação não encontrada' },
          { status: 404 }
        )
      }

      mockTransactions.splice(transactionIndex, 1)

      return NextResponse.json({ message: 'Transação deletada com sucesso' })
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  },
}
