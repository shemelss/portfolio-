"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DollarSign, CheckCircle, XCircle, Clock, Search, Download, RefreshCw, Eye, AlertCircle } from "lucide-react" // Added missing icons
import { toast } from "@/hooks/use-toast"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import type { Transaction } from "@/contexts/payment-context"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: string
  name: string
  email: string
  balance: number
  totalDeposits: number
  totalWithdrawals: number
}

interface DepositRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  method: string
  status: "pending" | "approved" | "rejected" | "processing"
  timestamp: Date
  proofDocument?: string
  adminNotes?: string
  processedBy?: string
  processedAt?: Date
  requiresApproval: boolean
  isQuickDeposit: boolean
  bankDetails?: {
    accountNumber?: string
    routingNumber?: string
    bankName?: string
  }
  cryptoDetails?: {
    walletAddress?: string
    transactionHash?: string
    network?: string
  }
  cardDetails?: {
    lastFourFourDigits?: string
    cardType?: string
  }
}

interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  method: string
  accountDetails: string
  status: "pending" | "approved" | "rejected" | "processing" | "completed"
  timestamp: Date
  adminNotes?: string
  processedBy?: string
  processedAt?: Date
  estimatedCompletion?: Date
  fees: number
  netAmount: number
  verificationRequired: boolean
  riskScore: number
  requiresApproval: boolean
}

interface AdminTransactionManagementProps {
  userData: any // Current logged-in admin user data
}

export default function AdminTransactionManagement({ userData }: AdminTransactionManagementProps) {
  const [users, setUsers] = useState<User[]>([]) // Needed to get user names/emails for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])

  // Filters and search
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("")
  const [transactionStatusFilter, setTransactionStatusFilter] = useState("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all")
  const [depositStatusFilter, setDepositStatusFilter] = useState("all")
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("all")

  // Dialog states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [showTransactionDetailsDialog, setShowTransactionDetailsDialog] = useState(false)
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")

  const auditLogger = useAuditLogger()

  useEffect(() => {
    loadUsers() // Load users to resolve names/emails
    loadTransactions()
    loadDepositRequests()
    loadWithdrawalRequests()
  }, [])

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers))
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const loadTransactions = () => {
    try {
      const storedTransactions = localStorage.getItem("transactions")
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions)
        const formattedTransactions = parsedTransactions.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
          completedAt: tx.completedAt ? new Date(tx.completedAt) : undefined,
          userName: users.find((u) => u.id === tx.userId)?.name || "Unknown User", // Resolve name
          userEmail: users.find((u) => u.id === tx.userId)?.email || "unknown@example.com", // Resolve email
          requiresApproval: tx.requiresApproval || false,
        }))
        setTransactions(formattedTransactions)
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
    }
  }

  const loadDepositRequests = () => {
    try {
      const stored = localStorage.getItem("depositRequests")
      if (stored) {
        const parsed = JSON.parse(stored)
        const formatted = parsed.map((req: any) => ({
          ...req,
          timestamp: new Date(req.timestamp),
          processedAt: req.processedAt ? new Date(req.processedAt) : undefined,
          requiresApproval: req.requiresApproval !== false,
          isQuickDeposit: req.isQuickDeposit || false,
        }))
        setDepositRequests(formatted)
      } else {
        // Generate sample deposit requests if none exist
        const sampleRequests: DepositRequest[] = [
          {
            id: "dep_001",
            userId: "user_123",
            userName: "John Doe",
            userEmail: "john@example.com",
            amount: 500,
            method: "Bank Transfer",
            status: "pending",
            timestamp: new Date(),
            proofDocument: "bank_receipt_001.pdf",
            requiresApproval: true,
            isQuickDeposit: false,
            bankDetails: {
              accountNumber: "****1234",
              bankName: "Chase Bank",
            },
          },
          {
            id: "dep_002",
            userId: "user_456",
            userName: "Jane Smith",
            userEmail: "jane@example.com",
            amount: 50,
            method: "Quick Deposit",
            status: "pending",
            timestamp: new Date(Date.now() - 3600000),
            requiresApproval: true,
            isQuickDeposit: true,
          },
          {
            id: "dep_003",
            userId: "user_789",
            userName: "Mike Johnson",
            userEmail: "mike@example.com",
            amount: 1000,
            method: "Credit Card",
            status: "pending",
            timestamp: new Date(Date.now() - 7200000),
            requiresApproval: true,
            isQuickDeposit: false,
            cardDetails: {
              lastFourFourDigits: "4567",
              cardType: "Visa",
            },
          },
        ]
        setDepositRequests(sampleRequests)
        localStorage.setItem("depositRequests", JSON.stringify(sampleRequests))
      }
    } catch (error) {
      console.error("Error loading deposit requests:", error)
    }
  }

  const loadWithdrawalRequests = () => {
    try {
      const stored = localStorage.getItem("withdrawalRequests")
      if (stored) {
        const parsed = JSON.parse(stored)
        const formatted = parsed.map((req: any) => ({
          ...req,
          timestamp: new Date(req.timestamp),
          processedAt: req.processedAt ? new Date(req.processedAt) : undefined,
          estimatedCompletion: req.estimatedCompletion ? new Date(req.estimatedCompletion) : undefined,
          requiresApproval: req.requiresApproval !== false,
        }))
        setWithdrawalRequests(formatted)
      } else {
        // Generate sample withdrawal requests if none exist
        const sampleRequests: WithdrawalRequest[] = [
          {
            id: "with_001",
            userId: "user_789",
            userName: "Mike Johnson",
            userEmail: "mike@example.com",
            amount: 750,
            method: "Bank Transfer",
            accountDetails: "Account: ****1234, Bank: Chase",
            status: "pending",
            timestamp: new Date(),
            fees: 25,
            netAmount: 725,
            verificationRequired: true,
            riskScore: 2,
            requiresApproval: true,
          },
          {
            id: "with_002",
            userId: "user_101",
            userName: "Sarah Wilson",
            userEmail: "sarah@example.com",
            amount: 300,
            method: "PayPal",
            accountDetails: "sarah.wilson@email.com",
            status: "pending",
            timestamp: new Date(Date.now() - 7200000),
            fees: 10,
            netAmount: 290,
            verificationRequired: false,
            riskScore: 1,
            requiresApproval: true,
          },
        ]
        setWithdrawalRequests(sampleRequests)
        localStorage.setItem("withdrawalRequests", JSON.stringify(sampleRequests))
      }
    } catch (error) {
      console.error("Error loading withdrawal requests:", error)
    }
  }

  const saveUsers = (updatedUsers: User[]) => {
    try {
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      setUsers(updatedUsers)
    } catch (error) {
      console.error("Error saving users:", error)
    }
  }

  const saveDepositRequests = (requests: DepositRequest[]) => {
    try {
      localStorage.setItem("depositRequests", JSON.stringify(requests))
      setDepositRequests(requests)
    } catch (error) {
      console.error("Error saving deposit requests:", error)
    }
  }

  const saveWithdrawalRequests = (requests: WithdrawalRequest[]) => {
    try {
      localStorage.setItem("withdrawalRequests", JSON.stringify(requests))
      setWithdrawalRequests(requests)
    } catch (error) {
      console.error("Error saving withdrawal requests:", error)
    }
  }

  // Enhanced Deposit Management Functions
  const handleApproveDeposit = (depositId: string) => {
    const deposit = depositRequests.find((d) => d.id === depositId)
    if (!deposit) return

    // Update deposit status
    const updatedRequests = depositRequests.map((req) =>
      req.id === depositId
        ? {
            ...req,
            status: "approved" as const,
            adminNotes: approvalNotes,
            processedBy: userData.id,
            processedAt: new Date(),
          }
        : req,
    )
    saveDepositRequests(updatedRequests)

    // Update user balance
    const updatedUsers = users.map((user) => {
      if (user.id === deposit.userId) {
        return {
          ...user,
          balance: user.balance + deposit.amount,
          totalDeposits: user.totalDeposits + deposit.amount,
        }
      }
      return user
    })
    saveUsers(updatedUsers)

    // Create transaction record
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      userId: deposit.userId,
      userName: deposit.userName,
      userEmail: deposit.userEmail,
      type: "deposit",
      amount: deposit.amount,
      currency: "USD",
      status: "completed",
      method: deposit.method,
      timestamp: new Date(),
      completedAt: new Date(),
      adminNotes: approvalNotes,
      processedBy: userData.id,
      requiresApproval: false,
    }

    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    auditLogger.logFinancialAction("Deposit Approved", {
      adminId: userData.id,
      targetUserId: deposit.userId,
      amount: deposit.amount,
      depositId: depositId,
      notes: approvalNotes,
    })

    toast({
      title: "Deposit Approved",
      description: `Deposit of $${deposit.amount} has been approved for ${deposit.userName}.`,
    })

    setShowDepositDialog(false)
    setSelectedDeposit(null)
    setApprovalNotes("")
  }

  const handleRejectDeposit = (depositId: string) => {
    const deposit = depositRequests.find((d) => d.id === depositId)
    if (!deposit) return

    const updatedRequests = depositRequests.map((req) =>
      req.id === depositId
        ? {
            ...req,
            status: "rejected" as const,
            adminNotes: approvalNotes,
            processedBy: userData.id,
            processedAt: new Date(),
          }
        : req,
    )
    saveDepositRequests(updatedRequests)

    auditLogger.logFinancialAction("Deposit Rejected", {
      adminId: userData.id,
      targetUserId: deposit.userId,
      amount: deposit.amount,
      depositId: depositId,
      notes: approvalNotes,
    })

    toast({
      title: "Deposit Rejected",
      description: `Deposit of $${deposit.amount} has been rejected.`,
    })

    setShowDepositDialog(false)
    setSelectedDeposit(null)
    setApprovalNotes("")
  }

  // Enhanced Withdrawal Management Functions
  const handleApproveWithdrawal = (withdrawalId: string) => {
    const withdrawal = withdrawalRequests.find((w) => w.id === withdrawalId)
    if (!withdrawal) return

    const user = users.find((u) => u.id === withdrawal.userId)
    if (!user || user.balance < withdrawal.amount) {
      toast({
        title: "Insufficient Balance",
        description: "User does not have sufficient balance for this withdrawal.",
        variant: "destructive",
      })
      return
    }

    // Update withdrawal status
    const updatedRequests = withdrawalRequests.map((req) =>
      req.id === withdrawalId
        ? {
            ...req,
            status: "approved" as const,
            adminNotes: approvalNotes,
            processedBy: userData.id,
            processedAt: new Date(),
            estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          }
        : req,
    )
    saveWithdrawalRequests(updatedRequests)

    // Update user balance
    const updatedUsers = users.map((user) => {
      if (user.id === withdrawal.userId) {
        return {
          ...user,
          balance: user.balance - withdrawal.amount,
          totalWithdrawals: user.totalWithdrawals + withdrawal.amount,
        }
      }
      return user
    })
    saveUsers(updatedUsers)

    // Create transaction record
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      userId: withdrawal.userId,
      userName: withdrawal.userName,
      userEmail: withdrawal.userEmail,
      type: "withdrawal",
      amount: withdrawal.amount,
      currency: "USD",
      status: "processing",
      method: withdrawal.method,
      timestamp: new Date(),
      adminNotes: approvalNotes,
      processedBy: userData.id,
      fees: withdrawal.fees,
      requiresApproval: false,
    }

    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    auditLogger.logFinancialAction("Withdrawal Approved", {
      adminId: userData.id,
      targetUserId: withdrawal.userId,
      amount: withdrawal.amount,
      withdrawalId: withdrawalId,
      notes: approvalNotes,
    })

    toast({
      title: "Withdrawal Approved",
      description: `Withdrawal of $${withdrawal.amount} has been approved for ${withdrawal.userName}.`,
    })

    setShowWithdrawalDialog(false)
    setSelectedWithdrawal(null)
    setApprovalNotes("")
  }

  const handleRejectWithdrawal = (withdrawalId: string) => {
    const withdrawal = withdrawalRequests.find((w) => w.id === withdrawalId)
    if (!withdrawal) return

    const updatedRequests = withdrawalRequests.map((req) =>
      req.id === withdrawalId
        ? {
            ...req,
            status: "rejected" as const,
            adminNotes: approvalNotes,
            processedBy: userData.id,
            processedAt: new Date(),
          }
        : req,
    )
    saveWithdrawalRequests(updatedRequests)

    auditLogger.logFinancialAction("Withdrawal Rejected", {
      adminId: userData.id,
      targetUserId: withdrawal.userId,
      amount: withdrawal.amount,
      withdrawalId: withdrawalId,
      notes: approvalNotes,
    })

    toast({
      title: "Withdrawal Rejected",
      description: `Withdrawal of $${withdrawal.amount} has been rejected.`,
    })

    setShowWithdrawalDialog(false)
    setSelectedWithdrawal(null)
    setApprovalNotes("")
  }

  const filteredDeposits = depositRequests.filter((deposit) => {
    const matchesStatus = depositStatusFilter === "all" || deposit.status === depositStatusFilter
    return matchesStatus
  })

  const filteredWithdrawals = withdrawalRequests.filter((withdrawal) => {
    const matchesStatus = withdrawalStatusFilter === "all" || withdrawal.status === withdrawalStatusFilter
    return matchesStatus
  })

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      tx.userName.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      tx.userEmail.toLowerCase().includes(transactionSearchTerm.toLowerCase())
    const matchesStatus = transactionStatusFilter === "all" || tx.status === transactionStatusFilter
    const matchesType = transactionTypeFilter === "all" || tx.type === transactionTypeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const pendingDeposits = depositRequests.filter((req) => req.status === "pending")
  const pendingWithdrawals = withdrawalRequests.filter((req) => req.status === "pending")

  // Status badge helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate statistics
  const pendingCount = transactions.filter((tx) => tx.status === "pending").length
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  const depositAmount = filteredTransactions
    .filter((tx) => tx.type === "deposit" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const withdrawalAmount = filteredTransactions
    .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const handleExportTransactions = () => {
    const csvContent = [
      ["ID", "User ID", "Type", "Amount", "Currency", "Status", "Method", "Timestamp", "Details"].join(","),
      ...filteredTransactions.map((tx) =>
        [
          tx.id,
          tx.userId,
          tx.type,
          tx.amount,
          tx.currency,
          tx.status,
          tx.method,
          tx.timestamp.toISOString(),
          JSON.stringify(tx.details || {}),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    // Log export
    auditLogger.logAdminAction("Transactions Exported", {
      adminId: userData.id, // Use userData.id here
      exportedCount: filteredTransactions.length,
    })
  }

  const loadAllData = () => {
    loadUsers()
    loadTransactions()
    loadDepositRequests()
    loadWithdrawalRequests()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-600"
      case "withdrawal":
        return "text-red-600"
      case "bonus":
        return "text-blue-600"
      case "referral":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">${depositAmount.toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">${withdrawalAmount.toFixed(2)}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transaction Management
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExportTransactions} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={loadAllData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Review and manage all financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID or user ID..."
                  value={transactionSearchTerm}
                  onChange={(e) => setTransactionSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={transactionStatusFilter} onValueChange={setTransactionStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Transaction</TableHead>
                  <TableHead className="min-w-[150px]">User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.id}</div>
                          <div className="text-sm text-muted-foreground">{transaction.method}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.userId}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium capitalize ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">{transaction.currency}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{transaction.timestamp.toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.timestamp.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {transaction.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setSelectedTransaction(transaction)
                                  setShowApprovalDialog(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedTransaction(transaction)
                                  setShowApprovalDialog(true)
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <p className="font-mono">{selectedTransaction.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <p className="capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="font-medium">
                    ${selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Method</Label>
                  <p className="capitalize">{selectedTransaction.method.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p>{selectedTransaction.timestamp.toLocaleString()}</p>
                </div>
              </div>
              {selectedTransaction.details && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Additional Details</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedTransaction.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog (for notes, actual approval handled in parent) */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
            <DialogDescription>
              Review and approve this {selectedTransaction?.type} of ${selectedTransaction?.amount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any notes about this approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 bg-transparent"
              onClick={() => {
                if (selectedTransaction) {
                  handleRejectDeposit(selectedTransaction.id)
                }
                setShowApprovalDialog(false)
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedTransaction) {
                  handleApproveDeposit(selectedTransaction.id)
                }
                setShowApprovalDialog(false)
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Review Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Deposit Request</DialogTitle>
            <DialogDescription>
              Review and approve/reject deposit of ${selectedDeposit?.amount} from {selectedDeposit?.userName}
            </DialogDescription>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="font-medium">{selectedDeposit.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedDeposit.userEmail}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium text-green-600">${selectedDeposit.amount}</p>
                </div>
                <div>
                  <Label>Method</Label>
                  <p>{selectedDeposit.method}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p>{selectedDeposit.isQuickDeposit ? "Quick Deposit" : "Manual Deposit"}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p>{selectedDeposit.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Requires Approval</Label>
                  <p>{selectedDeposit.requiresApproval ? "Yes" : "No"}</p>
                </div>
              </div>

              {selectedDeposit.proofDocument && (
                <div>
                  <Label>Proof Document</Label>
                  <p className="text-blue-600">{selectedDeposit.proofDocument}</p>
                </div>
              )}

              {selectedDeposit.bankDetails && (
                <div>
                  <Label>Bank Details</Label>
                  <div className="bg-muted p-2 rounded text-sm">
                    <p>Account: {selectedDeposit.bankDetails.accountNumber}</p>
                    <p>Bank: {selectedDeposit.bankDetails.bankName}</p>
                  </div>
                </div>
              )}

              {selectedDeposit.cardDetails && (
                <div>
                  <Label>Card Details</Label>
                  <div className="bg-muted p-2 rounded text-sm">
                    <p>Card ending in: {selectedDeposit.cardDetails.lastFourFourDigits}</p>
                    <p>Type: {selectedDeposit.cardDetails.cardType}</p>
                  </div>
                </div>
              )}

              {selectedDeposit.cryptoDetails && (
                <div>
                  <Label>Crypto Details</Label>
                  <div className="bg-muted p-2 rounded text-sm">
                    <p>Network: {selectedDeposit.cryptoDetails.network}</p>
                    <p>Wallet: {selectedDeposit.cryptoDetails.walletAddress}</p>
                    {selectedDeposit.cryptoDetails.transactionHash && (
                      <p>TX Hash: {selectedDeposit.cryptoDetails.transactionHash}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add notes about this decision..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedDeposit && handleRejectDeposit(selectedDeposit.id)}>
              Reject
            </Button>
            <Button onClick={() => selectedDeposit && handleApproveDeposit(selectedDeposit.id)}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Review Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and approve/reject withdrawal of ${selectedWithdrawal?.amount} from {selectedWithdrawal?.userName}
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="font-medium">{selectedWithdrawal.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedWithdrawal.userEmail}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium text-red-600">${selectedWithdrawal.amount}</p>
                  <p className="text-sm text-muted-foreground">Net: ${selectedWithdrawal.netAmount}</p>
                </div>
                <div>
                  <Label>Method</Label>
                  <p>{selectedWithdrawal.method}</p>
                </div>
                <div>
                  <Label>Fees</Label>
                  <p>${selectedWithdrawal.fees}</p>
                </div>
                <div>
                  <Label>Risk Score</Label>
                  <Badge
                    variant={
                      selectedWithdrawal.riskScore >= 3
                        ? "destructive"
                        : selectedWithdrawal.riskScore >= 2
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedWithdrawal.riskScore >= 3 ? "High" : selectedWithdrawal.riskScore >= 2 ? "Medium" : "Low"}
                  </Badge>
                </div>
                <div>
                  <Label>Date</Label>
                  <p>{selectedWithdrawal.timestamp.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label>Account Details</Label>
                <div className="bg-muted p-2 rounded">{selectedWithdrawal.accountDetails}</div>
              </div>
              {selectedWithdrawal.verificationRequired && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Verification Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This withdrawal requires additional verification due to amount or risk factors.
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add notes about this decision..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedWithdrawal && handleRejectWithdrawal(selectedWithdrawal.id)}
            >
              Reject
            </Button>
            <Button onClick={() => selectedWithdrawal && handleApproveWithdrawal(selectedWithdrawal.id)}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
