import { transactionHandlers } from '@/lib/api-handlers'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return transactionHandlers.getById(request as any, { params })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return transactionHandlers.update(request as any, { params })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return transactionHandlers.delete(request as any, { params })
}
