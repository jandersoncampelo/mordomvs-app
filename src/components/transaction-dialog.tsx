"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DollarSign, CreditCard, ArrowRightLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  TransactionDialogProps,
  Transaction,
  ExpenseTransaction,
  IncomeTransaction,
  TransferTransaction,
  ExpensePaymentType,
  IncomePaymentType,
} from "../types/transaction"
import RecurringPreviewComponent from "./recurring-preview"
import { generateRecurringPreview } from "../utils/recurring-calculator"

const defaultCategories = {
  expense: [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Travel",
    "Other",
  ],
  income: ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"],
}

const defaultAccounts = ["Checking Account", "Savings Account", "Credit Card", "Cash"]

export default function TransactionDialog({
  isOpen,
  onClose,
  onSubmit,
  transactionType,
  initialData,
  accounts = defaultAccounts,
  categories = defaultCategories,
}: TransactionDialogProps) {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  })

  const [paymentType, setPaymentType] = useState<ExpensePaymentType | IncomePaymentType>("single")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPreview, setRecurringPreview] = useState<any[]>([])

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      if ("paymentType" in initialData) {
        setPaymentType(initialData.paymentType as ExpensePaymentType | IncomePaymentType)
      }
    } else {
      // Reset form when dialog opens
      setFormData({
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
      })
      setPaymentType("single")
      setIsRecurring(false)
    }
    setErrors({})
  }, [initialData, isOpen])

  useEffect(() => {
    // Calculate recurring preview when relevant fields change
    if (
      (transactionType === "expense" && paymentType === "recurring") ||
      (transactionType === "income" && paymentType === "fixed-recurring")
    ) {
      const frequency = (formData as any).recurringFrequency
      if (formData.amount && formData.description && formData.date && frequency) {
        const preview = generateRecurringPreview(
          formData.amount,
          formData.description,
          formData.date,
          frequency,
          formData.recurringEndDate,
        )
        setRecurringPreview(preview)
      } else {
        setRecurringPreview([])
      }
    } else if (transactionType === "expense" && paymentType === "installment") {
      // Handle installment preview
      const installments = (formData as any).installments
      if (formData.amount && formData.description && formData.date && installments) {
        const installmentAmount = formData.amount / installments
        const preview = generateRecurringPreview(
          installmentAmount,
          formData.description,
          formData.date,
          "monthly", // Default to monthly for installments
          undefined,
          installments - 1, // Subtract 1 because first installment is immediate
        )
        setRecurringPreview(preview)
      } else {
        setRecurringPreview([])
      }
    } else {
      setRecurringPreview([])
    }
  }, [
    formData.amount,
    formData.description,
    formData.date,
    formData.recurringEndDate,
    (formData as any).recurringFrequency,
    (formData as any).installments,
    paymentType,
    transactionType,
  ])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    if (transactionType !== "transfer" && !formData.category) {
      newErrors.category = "Category is required"
    }

    if (transactionType === "transfer") {
      const transferData = formData as Partial<TransferTransaction>
      if (!transferData.fromAccount) {
        newErrors.fromAccount = "From account is required"
      }
      if (!transferData.toAccount) {
        newErrors.toAccount = "To account is required"
      }
      if (transferData.fromAccount === transferData.toAccount) {
        newErrors.toAccount = "From and To accounts must be different"
      }
    }

    if (transactionType === "expense" && paymentType === "installment") {
      const expenseData = formData as Partial<ExpenseTransaction>
      if (!expenseData.installments || expenseData.installments < 2) {
        newErrors.installments = "Installments must be at least 2"
      }
    }

    if (isRecurring && !formData.recurringEndDate) {
      newErrors.recurringEndDate = "End date is required for recurring transactions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    let transaction: Transaction

    if (transactionType === "expense") {
      transaction = {
        ...formData,
        type: "expense",
        paymentType: paymentType as ExpensePaymentType,
        recurringFrequency: isRecurring ? (formData as ExpenseTransaction).recurringFrequency : undefined,
        recurringEndDate: isRecurring ? formData.recurringEndDate : undefined,
        installments: paymentType === "installment" ? (formData as ExpenseTransaction).installments : undefined,
        currentInstallment: paymentType === "installment" ? 1 : undefined,
      } as ExpenseTransaction
    } else if (transactionType === "income") {
      transaction = {
        ...formData,
        type: "income",
        paymentType: paymentType as IncomePaymentType,
        recurringFrequency: isRecurring ? (formData as IncomeTransaction).recurringFrequency : undefined,
        recurringEndDate: isRecurring ? formData.recurringEndDate : undefined,
      } as IncomeTransaction
    } else {
      transaction = {
        ...formData,
        type: "transfer",
      } as TransferTransaction
    }

    onSubmit(transaction)
    onClose()
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getDialogTitle = () => {
    const action = initialData ? "Edit" : "Add"
    const type = transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
    return `${action} ${type}`
  }

  const getDialogIcon = () => {
    switch (transactionType) {
      case "expense":
        return <CreditCard className="h-5 w-5 text-red-600" />
      case "income":
        return <DollarSign className="h-5 w-5 text-green-600" />
      case "transfer":
        return <ArrowRightLeft className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDialogIcon()}
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount || ""}
              onChange={(e) => updateFormData("amount", Number.parseFloat(e.target.value) || 0)}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={formData.description || ""}
              onChange={(e) => updateFormData("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ""}
              onChange={(e) => updateFormData("date", e.target.value)}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          {/* Category (for expense and income) */}
          {transactionType !== "transfer" && (
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category || ""} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[transactionType as "expense" | "income"].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>
          )}

          {/* Transfer Accounts */}
          {transactionType === "transfer" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">From Account *</Label>
                <Select
                  value={(formData as TransferTransaction).fromAccount || ""}
                  onValueChange={(value) => updateFormData("fromAccount", value)}
                >
                  <SelectTrigger className={errors.fromAccount ? "border-red-500" : ""}>
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fromAccount && <p className="text-sm text-red-500">{errors.fromAccount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccount">To Account *</Label>
                <Select
                  value={(formData as TransferTransaction).toAccount || ""}
                  onValueChange={(value) => updateFormData("toAccount", value)}
                >
                  <SelectTrigger className={errors.toAccount ? "border-red-500" : ""}>
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.toAccount && <p className="text-sm text-red-500">{errors.toAccount}</p>}
              </div>
            </div>
          )}

          {/* Payment Type Options */}
          {transactionType === "expense" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Type</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value) => setPaymentType(value as ExpensePaymentType)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="installment" id="installment" />
                    <Label htmlFor="installment">Installment Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="recurring" />
                    <Label htmlFor="recurring">Recurring Payment</Label>
                  </div>
                </RadioGroup>

                {/* Installment Options */}
                {paymentType === "installment" && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="installments">Number of Installments *</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      placeholder="12"
                      value={(formData as ExpenseTransaction).installments || ""}
                      onChange={(e) => updateFormData("installments", Number.parseInt(e.target.value) || 0)}
                      className={errors.installments ? "border-red-500" : ""}
                    />
                    {errors.installments && <p className="text-sm text-red-500">{errors.installments}</p>}
                  </div>
                )}

                {/* Installment Preview */}
                {paymentType === "installment" && recurringPreview.length > 0 && (
                  <RecurringPreviewComponent
                    previews={recurringPreview}
                    frequency="monthly"
                    transactionType="expense"
                    totalAmount={recurringPreview.reduce((sum, p) => sum + p.amount, 0)}
                  />
                )}

                {/* Recurring Options for Expenses */}
                {paymentType === "recurring" && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recurringFrequency">Frequency</Label>
                      <Select
                        value={(formData as ExpenseTransaction).recurringFrequency || ""}
                        onValueChange={(value) => updateFormData("recurringFrequency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurringEndDate">End Date</Label>
                      <Input
                        id="recurringEndDate"
                        type="date"
                        value={formData.recurringEndDate || ""}
                        onChange={(e) => updateFormData("recurringEndDate", e.target.value)}
                        className={errors.recurringEndDate ? "border-red-500" : ""}
                      />
                      {errors.recurringEndDate && <p className="text-sm text-red-500">{errors.recurringEndDate}</p>}
                    </div>
                  </div>
                )}

                {/* Recurring Preview for Expenses */}
                {paymentType === "recurring" && recurringPreview.length > 0 && (
                  <RecurringPreviewComponent
                    previews={recurringPreview}
                    frequency={(formData as ExpenseTransaction).recurringFrequency || "monthly"}
                    transactionType="expense"
                    totalAmount={recurringPreview.reduce((sum, p) => sum + p.amount, 0)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Income Type Options */}
          {transactionType === "income" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Income Type</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value) => setPaymentType(value as IncomePaymentType)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="income-single" />
                    <Label htmlFor="income-single">Single Income</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed-recurring" id="fixed-recurring" />
                    <Label htmlFor="fixed-recurring">Fixed Recurring Income</Label>
                  </div>
                </RadioGroup>

                {/* Recurring Options for Income */}
                {paymentType === "fixed-recurring" && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="incomeRecurringFrequency">Frequency</Label>
                      <Select
                        value={(formData as IncomeTransaction).recurringFrequency || ""}
                        onValueChange={(value) => updateFormData("recurringFrequency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incomeRecurringEndDate">End Date (Optional)</Label>
                      <Input
                        id="incomeRecurringEndDate"
                        type="date"
                        value={formData.recurringEndDate || ""}
                        onChange={(e) => updateFormData("recurringEndDate", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Recurring Preview for Income */}
                {paymentType === "fixed-recurring" && recurringPreview.length > 0 && (
                  <RecurringPreviewComponent
                    previews={recurringPreview}
                    frequency={(formData as IncomeTransaction).recurringFrequency || "monthly"}
                    transactionType="income"
                    totalAmount={recurringPreview.reduce((sum, p) => sum + p.amount, 0)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${
                transactionType === "expense"
                  ? "bg-red-600 hover:bg-red-700"
                  : transactionType === "income"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {initialData ? "Update" : "Create"} {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
