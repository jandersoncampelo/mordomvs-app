export type TransactionType = "expense" | "income" | "transfer"

export type ExpensePaymentType = "single" | "installment" | "recurring"
export type IncomePaymentType = "single" | "fixed-recurring"

export interface BaseTransaction {
  id?: string
  amount: number
  description: string
  date: string
  category: string
}

export interface ExpenseTransaction extends BaseTransaction {
  type: "expense"
  paymentType: ExpensePaymentType
  installments?: number
  currentInstallment?: number
  recurringFrequency?: "weekly" | "monthly" | "yearly"
  recurringEndDate?: string
}

export interface IncomeTransaction extends BaseTransaction {
  type: "income"
  paymentType: IncomePaymentType
  recurringFrequency?: "weekly" | "monthly" | "yearly"
  recurringEndDate?: string
}

export interface TransferTransaction extends Omit<BaseTransaction, "category"> {
  type: "transfer"
  fromAccount: string
  toAccount: string
}

export type Transaction = ExpenseTransaction | IncomeTransaction | TransferTransaction

export interface TransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transaction: Transaction) => void
  transactionType: TransactionType
  initialData?: Partial<Transaction>
  accounts?: string[]
  categories?: {
    expense: string[]
    income: string[]
  }
}
