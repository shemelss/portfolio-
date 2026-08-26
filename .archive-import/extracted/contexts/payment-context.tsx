"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import { toast } from "@/hooks/use-toast"

// Define payment method types
export type PaymentMethod = "credit_card" | "crypto" | "bank_transfer" | "e_wallet" | "casino_banking"

// Define transaction types
export type TransactionType = "deposit" | "withdrawal" | "bonus" | "referral" | "milestone" | "game_win" | "game_loss"

// Define transaction status
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled"

// Define transaction interface
export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  method: PaymentMethod
  amount: number
  currency: string
  status: TransactionStatus
  timestamp: Date
  details?: Record<string, any>
}

// Define payment provider interface
interface PaymentContextType {
  isPaymentModalOpen: boolean
  paymentModalActiveTab: string
  openPaymentModal: (tab?: string, cryptoType?: string) => void
  closePaymentModal: () => void
  userData: any // Consider defining a more specific UserData type
  balance: number | null
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
  processDeposit: (userId: string, amount: number, method?: PaymentMethod) => Promise<boolean>
  processWithdrawal: (userId: string, amount: number, method?: PaymentMethod) => Promise<boolean>
  getTransactionHistory: (userId: string) => Transaction[]
  getPendingTransactions: (userId: string) => Transaction[]
  addPaymentMethod: (userId: string, method: PaymentMethod, details: any) => Promise<boolean>
  removePaymentMethod: (userId: string, methodId: string) => Promise<boolean>
  getPaymentMethods: (userId: string) => any[]
}

// Create context
const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

// Create hook for using payment context
export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}

// Create payment provider component
export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentModalActiveTab, setPaymentModalActiveTab] = useState("deposit")
  const [userData, setUserData] = useState<any>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const auditLogger = useAuditLogger()

  // Load transactions and user data from localStorage on mount
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem("transactions")
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions)
        // Convert string dates back to Date objects
        const formattedTransactions = parsedTransactions.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
        }))
        setTransactions(formattedTransactions)
      }

      const storedPaymentMethods = localStorage.getItem("paymentMethods")
      if (storedPaymentMethods) {
        setPaymentMethods(JSON.parse(storedPaymentMethods))
      }

      const storedUserData = localStorage.getItem("currentUser")
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData)
        setUserData(parsedUserData)
        setBalance(parsedUserData.balance || 0)
      }
    } catch (error) {
      console.error("Error loading payment data:", error)
    }
  }, [])

  // Save transactions to localStorage when they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions))
    }
  }, [transactions])

  // Save payment methods to localStorage when they change
  useEffect(() => {
    if (paymentMethods.length > 0) {
      localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods))
    }
  }, [paymentMethods])

  // Generate unique transaction ID
  const generateTransactionId = () => {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate unique payment method ID
  const generatePaymentMethodId = () => {
    return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Process deposit
  const processDeposit = async (
    userId: string,
    amount: number,
    method: PaymentMethod = "casino_banking",
  ): Promise<boolean> => {
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create transaction record
      const transaction: Transaction = {
        id: generateTransactionId(),
        userId,
        type: "deposit",
        method,
        amount,
        currency: "USD",
        status: "completed",
        timestamp: new Date(),
        details: {
          processingTime: "1000ms",
          gateway: "casino_payment_gateway",
        },
      }

      // Add to transactions
      setTransactions((prev) => [transaction, ...prev])

      // Update user balance in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedUsers = users.map((user: any) => {
        if (user.id === userId) {
          return { ...user, balance: (user.balance || 0) + amount }
        }
        return user
      })
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Log the deposit
      auditLogger.logFinancialAction("Deposit", {
        userId,
        amount,
        method,
        transactionId: transaction.id,
        status: "completed",
      })

      return true
    } catch (error) {
      console.error("Deposit processing error:", error)

      // Log failed deposit
      auditLogger.logFinancialAction("Deposit", {
        userId,
        amount,
        method,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })

      return false
    }
  }

  // Process withdrawal
  const processWithdrawal = async (
    userId: string,
    amount: number,
    method: PaymentMethod = "bank_transfer",
  ): Promise<boolean> => {
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check user balance
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: any) => u.id === userId)

      if (!user || (user.balance || 0) < amount) {
        throw new Error("Insufficient balance")
      }

      // Create transaction record
      const transaction: Transaction = {
        id: generateTransactionId(),
        userId,
        type: "withdrawal",
        method,
        amount,
        currency: "USD",
        status: "pending", // Withdrawals start as pending
        timestamp: new Date(),
        details: {
          processingTime: "1-3 business days",
          gateway: "casino_payment_gateway",
        },
      }

      // Add to transactions
      setTransactions((prev) => [transaction, ...prev])

      // Update user balance in localStorage
      const updatedUsers = users.map((user: any) => {
        if (user.id === userId) {
          return { ...user, balance: (user.balance || 0) - amount }
        }
        return user
      })
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Log the withdrawal
      auditLogger.logFinancialAction("Withdrawal", {
        userId,
        amount,
        method,
        transactionId: transaction.id,
        status: "pending",
      })

      // Simulate completion after some time (for demo purposes)
      setTimeout(() => {
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === transaction.id ? { ...tx, status: "completed" as TransactionStatus } : tx)),
        )
      }, 5000)

      return true
    } catch (error) {
      console.error("Withdrawal processing error:", error)

      // Log failed withdrawal
      auditLogger.logFinancialAction("Withdrawal", {
        userId,
        amount,
        method,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })

      return false
    }
  }

  // Get transaction history for a user
  const getTransactionHistory = (userId: string): Transaction[] => {
    return transactions
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Get pending transactions for a user
  const getPendingTransactions = (userId: string): Transaction[] => {
    return transactions
      .filter((tx) => tx.userId === userId && tx.status === "pending")
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Add payment method
  const addPaymentMethod = async (userId: string, method: PaymentMethod, details: any): Promise<boolean> => {
    try {
      const paymentMethod = {
        id: generatePaymentMethodId(),
        userId,
        type: method,
        name: details.name || `${method.replace("_", " ")} Method`,
        details,
        createdAt: new Date(),
        isActive: true,
      }

      setPaymentMethods((prev) => [...prev, paymentMethod])

      // Log payment method addition
      auditLogger.logSecurityAction("Payment Method Added", {
        userId,
        methodType: method,
        methodId: paymentMethod.id,
      })

      return true
    } catch (error) {
      console.error("Add payment method error:", error)
      return false
    }
  }

  // Remove payment method
  const removePaymentMethod = async (userId: string, methodId: string): Promise<boolean> => {
    try {
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== methodId || pm.userId !== userId))

      // Log payment method removal
      auditLogger.logSecurityAction("Payment Method Removed", {
        userId,
        methodId,
      })

      return true
    } catch (error) {
      console.error("Remove payment method error:", error)
      return false
    }
  }

  // Get payment methods for a user
  const getPaymentMethods = (userId: string): any[] => {
    return paymentMethods
      .filter((pm) => pm.userId === userId && pm.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const openPaymentModal = useCallback((tab = "deposit", cryptoType?: string) => {
    setPaymentModalActiveTab(tab)
    setIsPaymentModalOpen(true)
  }, [])

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false)
  }, [])

  const handleDeposit = useCallback((amount: number) => {
    setBalance((prev) => (prev !== null ? prev + amount : amount))
    // In a real app, you'd trigger a server action or API call here
    toast({
      title: "Deposit Successful",
      description: `You have deposited $${amount.toFixed(2)}.`,
    })
  }, [])

  const handleWithdraw = useCallback((amount: number) => {
    setBalance((prev) => (prev !== null ? Math.max(0, prev - amount) : 0))
    // In a real app, you'd trigger a server action or API call here
    toast({
      title: "Withdrawal Initiated",
      description: `You have withdrawn $${amount.toFixed(2)}. Processing...`,
    })
  }, [])

  const value: PaymentContextType = {
    isPaymentModalOpen,
    paymentModalActiveTab,
    openPaymentModal,
    closePaymentModal,
    userData,
    balance,
    onDeposit: handleDeposit,
    onWithdraw: handleWithdraw,
    processDeposit,
    processWithdrawal,
    getTransactionHistory,
    getPendingTransactions,
    addPaymentMethod,
    removePaymentMethod,
    getPaymentMethods,
  }

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
}
