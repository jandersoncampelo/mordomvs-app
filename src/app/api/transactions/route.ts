import { transactionHandlers } from '@/lib/api-handlers'

export async function GET(request: Request) {
  return transactionHandlers.getAll(request as any)
}

export async function POST(request: Request) {
  return transactionHandlers.create(request as any)
}
