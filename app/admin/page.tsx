"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  DollarSign,
  Settings,
  LogOut,
  Shield,
  AlertTriangle,
  Activity,
  UserCheck,
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  UserPlus,
  CreditCard,
  Banknote,
  History,
  Wallet,
  Clock,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import LiveNotificationCenter from "@/components/live-notification-center"
import { useAdminActivity } from "@/contexts/admin-activity-context"
import { useSecurityMonitoring } from "@/contexts/security-monitoring-context"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  role: string
  balance: number
  status: "active" | "suspended" | "banned"
  registeredAt: string
  lastLogin?: string
  referralCode: string
  kycStatus: "unverified" | "pending" | "verified" | "rejected"
  totalDeposits: number
  totalWithdrawals: number
  gamesPlayed: number
  winnings: number
  losses: number
  profileImage?: string
  dateOfBirth?: string
  country?: string
  preferredCurrency: string
  twoFactorEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  lastActivity?: string
  ipAddress?: string
  deviceInfo?: string
  depositLimit?: number
  withdrawalLimit?: number
  sessionTimeLimit?: number
  autoApproveDeposits?: boolean
  autoApproveWithdrawals?: boolean
}

interface Transaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: "deposit" | "withdrawal" | "bonus" | "referral" | "game_win" | "game_loss"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled" | "processing"
  method: string
  timestamp: Date
  completedAt?: Date
  details?: Record<string, any>
  adminNotes?: string
  processedBy?: string
  fees?: number
  exchangeRate?: number
  requiresApproval: boolean
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
    lastFourDigits?: string
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

interface PlatformSettings {
  minDeposit: number
  maxDeposit: number
  minWithdrawal: number
  maxWithdrawal: number
  autoApproveDepositThreshold: number
  autoApproveWithdrawalThreshold: number
  withdrawalFeePercentage: number
  dailyWithdrawalLimit: number
  kycRequiredForWithdrawal: number
  maintenanceMode: boolean
  registrationEnabled: boolean
  depositMethods: string[]
  withdrawalMethods: string[]
  supportedCurrencies: string[]
  maxSessionTime: number
  inactivityTimeout: number
}

function AdminPageContent() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    minDeposit: 10,
    maxDeposit: 10000,
    minWithdrawal: 50,
    maxWithdrawal: 5000,
    autoApproveDepositThreshold: 100,
    autoApproveWithdrawalThreshold: 500,
    withdrawalFeePercentage: 2.5,
    dailyWithdrawalLimit: 2000,
    kycRequiredForWithdrawal: 1000,
    maintenanceMode: false,
    registrationEnabled: true,
    depositMethods: ["Credit Card", "Bank Transfer", "Cryptocurrency", "E-Wallet"],
    withdrawalMethods: ["Bank Transfer", "Cryptocurrency", "E-Wallet"],
    supportedCurrencies: ["USD", "EUR", "BTC", "ETH"],
    maxSessionTime: 480, // 8 hours
    inactivityTimeout: 30, // 30 minutes
  })

  // Filters and search
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("")
  const [transactionStatusFilter, setTransactionStatusFilter] = useState("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all")
  const [depositStatusFilter, setDepositStatusFilter] = useState("all")
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("all")

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false)
  const [showTransactionDetailsDialog, setShowTransactionDetailsDialog] = useState(false)
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false)
  const [showBalanceAdjustDialog, setShowBalanceAdjustDialog] = useState(false)
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Form states
  const [adminNotes, setAdminNotes] = useState("")
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: "",
    type: "add" as "add" | "subtract" | "set",
    reason: "",
  })
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState("")

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { logAction } = useAdminActivity()
  const { getCriticalAnomalies } = useSecurityMonitoring()
  const auditLogger = useAuditLogger()

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAllData()
        setLastUpdate(new Date())
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Load data on mount
  useEffect(() => {
    checkAuthentication()
    loadAllData()
    loadPlatformSettings()
  }, [])

  const checkAuthentication = () => {
    const userDataStr = localStorage.getItem("currentUser")
    if (!userDataStr) {
      window.location.href = "/"
      return
    }

    try {
      const userData = JSON.parse(userDataStr)
      if (userData.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        })
        setTimeout(() => {
          window.location.href = "/game"
        }, 2000)
        return
      }

      setUserData(userData)
      setIsAuthenticated(true)
      setIsAdmin(true)

      logAction({
        type: "login",
        description: `Admin ${userData.name} accessed the admin dashboard`,
        adminId: userData.id,
        adminName: userData.name,
        severity: "low",
        details: { timestamp: new Date().toISOString() },
      })
    } catch (error) {
      console.error("Error parsing user data:", error)
      window.location.href = "/"
    }
  }

  const loadAllData = () => {
    loadUsers()
    loadTransactions()
    loadDepositRequests()
    loadWithdrawalRequests()
  }

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        const enhancedUsers = parsedUsers.map((user: any) => ({
          ...user,
          status: user.status || "active",
          kycStatus: user.kycStatus || "unverified",
          totalDeposits: user.totalDeposits || 0,
          totalWithdrawals: user.totalWithdrawals || 0,
          gamesPlayed: user.gamesPlayed || 0,
          winnings: user.winnings || 0,
          losses: user.losses || 0,
          preferredCurrency: user.preferredCurrency || "USD",
          twoFactorEnabled: user.twoFactorEnabled || false,
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false,
          lastLogin: user.lastLogin || null,
          lastActivity: user.lastActivity || null,
          depositLimit: user.depositLimit || platformSettings.maxDeposit,
          withdrawalLimit: user.withdrawalLimit || platformSettings.maxWithdrawal,
          autoApproveDeposits: user.autoApproveDeposits || false,
          autoApproveWithdrawals: user.autoApproveWithdrawals || false,
        }))
        setUsers(enhancedUsers)
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
          userName: getUserName(tx.userId),
          userEmail: getUserEmail(tx.userId),
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
        // Generate sample deposit requests
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
              lastFourDigits: "4567",
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
        // Generate sample withdrawal requests
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

  const loadPlatformSettings = () => {
    try {
      const stored = localStorage.getItem("platformSettings")
      if (stored) {
        const parsed = JSON.parse(stored)
        setPlatformSettings({ ...platformSettings, ...parsed })
      }
    } catch (error) {
      console.error("Error loading platform settings:", error)
    }
  }

  const savePlatformSettings = (settings: PlatformSettings) => {
    try {
      localStorage.setItem("platformSettings", JSON.stringify(settings))
      setPlatformSettings(settings)

      auditLogger.logAdminAction("Platform Settings Updated", {
        adminId: userData.id,
        changes: settings,
      })

      toast({
        title: "Settings Updated",
        description: "Platform settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving platform settings:", error)
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : "Unknown User"
  }

  const getUserEmail = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.email : "unknown@example.com"
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

  // Enhanced User Management Functions
  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
      role: userData.role || "user",
      balance: userData.balance || 0,
      status: "active",
      registeredAt: new Date().toISOString(),
      referralCode: `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      kycStatus: "unverified",
      totalDeposits: 0,
      totalWithdrawals: 0,
      gamesPlayed: 0,
      winnings: 0,
      losses: 0,
      preferredCurrency: userData.preferredCurrency || "USD",
      twoFactorEnabled: false,
      emailVerified: false,
      phoneVerified: false,
      country: userData.country || "",
      dateOfBirth: userData.dateOfBirth || "",
      depositLimit: userData.depositLimit || platformSettings.maxDeposit,
      withdrawalLimit: userData.withdrawalLimit || platformSettings.maxWithdrawal,
      autoApproveDeposits: userData.autoApproveDeposits || false,
      autoApproveWithdrawals: userData.autoApproveWithdrawals || false,
    }

    const updatedUsers = [...users, newUser]
    saveUsers(updatedUsers)

    auditLogger.logAdminAction("User Created", {
      adminId: userData.id,
      targetUserId: newUser.id,
      targetUserEmail: newUser.email,
      userRole: newUser.role,
    })

    toast({
      title: "User Created",
      description: `User ${newUser.name} has been created successfully.`,
    })

    setShowCreateUserDialog(false)
  }

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map((user) => (user.id === userId ? { ...user, ...updates } : user))
    saveUsers(updatedUsers)

    auditLogger.logAdminAction("User Updated", {
      adminId: userData.id,
      targetUserId: userId,
      updates: Object.keys(updates),
      changes: updates,
    })

    toast({
      title: "User Updated",
      description: "User information has been updated successfully.",
    })

    setShowEditUserDialog(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId)
    if (!userToDelete) return

    const updatedUsers = users.filter((user) => user.id !== userId)
    saveUsers(updatedUsers)

    auditLogger.logAdminAction("User Deleted", {
      adminId: userData.id,
      targetUserId: userId,
      targetUserEmail: userToDelete.email,
      targetUserName: userToDelete.name,
    })

    toast({
      title: "User Deleted",
      description: `User ${userToDelete.name} has been deleted.`,
    })
  }

  const handleBalanceAdjustment = () => {
    if (!selectedUser) return

    const amount = Number.parseFloat(balanceAdjustment.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    let newBalance = selectedUser.balance

    switch (balanceAdjustment.type) {
      case "add":
        newBalance += amount
        break
      case "subtract":
        newBalance = Math.max(0, newBalance - amount)
        break
      case "set":
        newBalance = amount
        break
    }

    handleUpdateUser(selectedUser.id, { balance: newBalance })

    auditLogger.logFinancialAction("Admin Balance Adjustment", {
      adminId: userData.id,
      targetUserId: selectedUser.id,
      action: balanceAdjustment.type,
      amount: amount,
      previousBalance: selectedUser.balance,
      newBalance: newBalance,
      reason: balanceAdjustment.reason,
    })

    setShowBalanceAdjustDialog(false)
    setBalanceAdjustment({ amount: "", type: "add", reason: "" })
    setSelectedUser(null)
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
            adminNotes: adminNotes,
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
      adminNotes: adminNotes,
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
      notes: adminNotes,
    })

    toast({
      title: "Deposit Approved",
      description: `Deposit of $${deposit.amount} has been approved for ${deposit.userName}.`,
    })

    setShowDepositDialog(false)
    setSelectedDeposit(null)
    setAdminNotes("")
  }

  const handleRejectDeposit = (depositId: string) => {
    const deposit = depositRequests.find((d) => d.id === depositId)
    if (!deposit) return

    const updatedRequests = depositRequests.map((req) =>
      req.id === depositId
        ? {
            ...req,
            status: "rejected" as const,
            adminNotes: adminNotes,
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
      notes: adminNotes,
    })

    toast({
      title: "Deposit Rejected",
      description: `Deposit of $${deposit.amount} has been rejected.`,
    })

    setShowDepositDialog(false)
    setSelectedDeposit(null)
    setAdminNotes("")
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
            adminNotes: adminNotes,
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
      adminNotes: adminNotes,
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
      notes: adminNotes,
    })

    toast({
      title: "Withdrawal Approved",
      description: `Withdrawal of $${withdrawal.amount} has been approved for ${withdrawal.userName}.`,
    })

    setShowWithdrawalDialog(false)
    setSelectedWithdrawal(null)
    setAdminNotes("")
  }

  const handleRejectWithdrawal = (withdrawalId: string) => {
    const withdrawal = withdrawalRequests.find((w) => w.id === withdrawalId)
    if (!withdrawal) return

    const updatedRequests = withdrawalRequests.map((req) =>
      req.id === withdrawalId
        ? {
            ...req,
            status: "rejected" as const,
            adminNotes: adminNotes,
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
      notes: adminNotes,
    })

    toast({
      title: "Withdrawal Rejected",
      description: `Withdrawal of $${withdrawal.amount} has been rejected.`,
    })

    setShowWithdrawalDialog(false)
    setSelectedWithdrawal(null)
    setAdminNotes("")
  }

  const handleLogout = () => {
    try {
      if (userData) {
        logAction({
          type: "logout",
          description: `Admin ${userData.name} logged out`,
          adminId: userData.id,
          adminName: userData.name,
          severity: "low",
          details: { timestamp: new Date().toISOString() },
        })
      }

      document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
      localStorage.removeItem("currentUser")

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })

      window.location.href = "/"
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  // Filter functions
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(userSearchTerm.toLowerCase())
    const matchesStatus = userStatusFilter === "all" || user.status === userStatusFilter
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter
    return matchesSearch && matchesStatus && matchesRole
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

  const filteredDeposits = depositRequests.filter((deposit) => {
    const matchesStatus = depositStatusFilter === "all" || deposit.status === depositStatusFilter
    return matchesStatus
  })

  const filteredWithdrawals = withdrawalRequests.filter((withdrawal) => {
    const matchesStatus = withdrawalStatusFilter === "all" || withdrawal.status === withdrawalStatusFilter
    return matchesStatus
  })

  const pendingDeposits = depositRequests.filter((req) => req.status === "pending")
  const pendingWithdrawals = withdrawalRequests.filter((req) => req.status === "pending")
  const criticalAnomalies = getCriticalAnomalies()

  // Statistics
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "active").length
  const newUsersToday = users.filter((u) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(u.registeredAt) >= today
  }).length
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0)
  const totalDeposits = users.reduce((sum, user) => sum + user.totalDeposits, 0)
  const totalWithdrawals = users.reduce((sum, user) => sum + user.totalWithdrawals, 0)

  // Status badge helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "suspended":
        return <Badge className="bg-yellow-500">Suspended</Badge>
      case "banned":
        return <Badge className="bg-red-500">Banned</Badge>
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

  const getKYCBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500">Verified</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge variant="outline">Unverified</Badge>
    }
  }

  if (isAuthenticated === null || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-xl">Verifying admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges to access this page.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => (window.location.href = "/game")} className="w-full">
              Return to Game
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold">Casino Admin Dashboard</h1>
            {criticalAnomalies.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {criticalAnomalies.length} Critical Alert{criticalAnomalies.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Welcome, {userData?.name} | Role: <span className="font-semibold text-blue-600">Administrator</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()} |{" "}
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto-refresh: {autoRefresh ? "ON" : "OFF"}
            </Button>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAllData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <LiveNotificationCenter />
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-green-600">+{newUsersToday} today</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-xs text-muted-foreground">{((activeUsers / totalUsers) * 100).toFixed(1)}% active</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Platform liquidity</p>
              </div>
              <Wallet className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Deposits</p>
                <p className="text-2xl font-bold text-orange-600">{pendingDeposits.length}</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">{pendingWithdrawals.length}</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                <p className="text-2xl font-bold text-green-600">${(totalDeposits - totalWithdrawals).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Deposits - Withdrawals</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users ({totalUsers})
          </TabsTrigger>
          <TabsTrigger value="deposits" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Deposits
            {pendingDeposits.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                {pendingDeposits.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Withdrawals
            {pendingWithdrawals.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                {pendingWithdrawals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Registrations</CardTitle>
                <CardDescription>Latest users who joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users
                    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserPlus className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${user.balance.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .slice(0, 5)
                    .map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === "deposit" ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {tx.type === "deposit" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.userName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {tx.type} via {tx.method}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                            {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                          </p>
                          <p className="text-xs">{getStatusBadge(tx.status)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-transparent"
                  onClick={() => setActiveTab("deposits")}
                  disabled={pendingDeposits.length === 0}
                >
                  <CreditCard className="h-6 w-6" />
                  Review Deposits
                  {pendingDeposits.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pendingDeposits.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-transparent"
                  onClick={() => setActiveTab("withdrawals")}
                  disabled={pendingWithdrawals.length === 0}
                >
                  <Banknote className="h-6 w-6" />
                  Review Withdrawals
                  {pendingWithdrawals.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pendingWithdrawals.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-transparent"
                  onClick={() => setShowCreateUserDialog(true)}
                >
                  <UserPlus className="h-6 w-6" />
                  Add New User
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 bg-transparent"
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <Settings className="h-6 w-6" />
                  Platform Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management ({filteredUsers.length})
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to the system</DialogDescription>
                      </DialogHeader>
                      <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setShowCreateUserDialog(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
              <CardDescription>Manage all users, their roles, balances, and account status</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Enhanced Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or referral code..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="min-w-[150px]">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead className="min-w-[150px]">Activity</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">${user.balance.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              D: ${user.totalDeposits.toFixed(0)} | W: ${user.totalWithdrawals.toFixed(0)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{getKYCBadge(user.kycStatus)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Games: {user.gamesPlayed}</div>
                              <div className="text-xs text-muted-foreground">
                                Last: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowUserDetailsDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowEditUserDialog(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowBalanceAdjustDialog(true)
                                  }}
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Adjust Balance
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Deposit Requests ({filteredDeposits.length})
                {pendingDeposits.length > 0 && <Badge variant="destructive">{pendingDeposits.length} Pending</Badge>}
              </CardTitle>
              <CardDescription>Review and approve user deposit requests including quick deposits</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Deposit Filters */}
              <div className="flex gap-4 mb-6">
                <Select value={depositStatusFilter} onValueChange={setDepositStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeposits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No deposit requests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>
                            <div className="font-medium">{deposit.userName}</div>
                            <div className="text-sm text-muted-foreground">{deposit.userEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">${deposit.amount.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>{deposit.method}</TableCell>
                          <TableCell>
                            {deposit.isQuickDeposit ? (
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Quick
                              </Badge>
                            ) : (
                              <Badge variant="outline">Manual</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                          <TableCell>{deposit.timestamp.toLocaleDateString()}</TableCell>
                          <TableCell>
                            {deposit.status === "pending" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDeposit(deposit)
                                    setShowDepositDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Withdrawal Requests ({filteredWithdrawals.length})
                {pendingWithdrawals.length > 0 && (
                  <Badge variant="destructive">{pendingWithdrawals.length} Pending</Badge>
                )}
              </CardTitle>
              <CardDescription>Review and approve user withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Withdrawal Filters */}
              <div className="flex gap-4 mb-6">
                <Select value={withdrawalStatusFilter} onValueChange={setWithdrawalStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="min-w-[150px]">Account Details</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWithdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No withdrawal requests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWithdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            <div className="font-medium">{withdrawal.userName}</div>
                            <div className="text-sm text-muted-foreground">{withdrawal.userEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-red-600">${withdrawal.amount.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Net: ${withdrawal.netAmount.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>{withdrawal.method}</TableCell>
                          <TableCell>
                            <div className="text-sm max-w-32 truncate">{withdrawal.accountDetails}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                withdrawal.riskScore >= 3
                                  ? "destructive"
                                  : withdrawal.riskScore >= 2
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {withdrawal.riskScore >= 3 ? "High" : withdrawal.riskScore >= 2 ? "Medium" : "Low"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                          <TableCell>{withdrawal.timestamp.toLocaleDateString()}</TableCell>
                          <TableCell>
                            {withdrawal.status === "pending" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal)
                                    setShowWithdrawalDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                All Transactions ({filteredTransactions.length})
              </CardTitle>
              <CardDescription>Complete transaction history and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Transaction Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by transaction ID, user name, or email..."
                      value={transactionSearchTerm}
                      onChange={(e) => setTransactionSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={transactionStatusFilter} onValueChange={setTransactionStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="game_win">Game Win</SelectItem>
                    <SelectItem value="game_loss">Game Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Transaction ID</TableHead>
                      <TableHead className="min-w-[150px]">User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-[120px]">Date</TableHead>
                      <TableHead className="min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No transactions found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.slice(0, 50).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="font-mono text-sm">{transaction.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{transaction.userName}</div>
                            <div className="text-sm text-muted-foreground">{transaction.userEmail}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {transaction.type.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`font-medium ${
                                transaction.type === "deposit" ||
                                transaction.type === "game_win" ||
                                transaction.type === "bonus"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "deposit" ||
                              transaction.type === "game_win" ||
                              transaction.type === "bonus"
                                ? "+"
                                : "-"}
                              ${transaction.amount.toFixed(2)}
                            </div>
                            {transaction.fees && (
                              <div className="text-xs text-muted-foreground">Fee: ${transaction.fees.toFixed(2)}</div>
                            )}
                          </TableCell>
                          <TableCell>{transaction.method}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{transaction.timestamp.toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.timestamp.toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setShowTransactionDetailsDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <CardDescription>Configure deposit and withdrawal limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minDeposit">Minimum Deposit</Label>
                    <Input
                      id="minDeposit"
                      type="number"
                      value={platformSettings.minDeposit}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          minDeposit: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDeposit">Maximum Deposit</Label>
                    <Input
                      id="maxDeposit"
                      type="number"
                      value={platformSettings.maxDeposit}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          maxDeposit: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minWithdrawal">Minimum Withdrawal</Label>
                    <Input
                      id="minWithdrawal"
                      type="number"
                      value={platformSettings.minWithdrawal}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          minWithdrawal: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxWithdrawal">Maximum Withdrawal</Label>
                    <Input
                      id="maxWithdrawal"
                      type="number"
                      value={platformSettings.maxWithdrawal}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          maxWithdrawal: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawalFee">Withdrawal Fee (%)</Label>
                  <Input
                    id="withdrawalFee"
                    type="number"
                    step="0.1"
                    value={platformSettings.withdrawalFeePercentage}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        withdrawalFeePercentage: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button onClick={() => savePlatformSettings(platformSettings)} className="w-full">
                  Save Financial Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-Approval Settings</CardTitle>
                <CardDescription>Configure automatic approval thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="autoDepositThreshold">Auto-Approve Deposits Under</Label>
                  <Input
                    id="autoDepositThreshold"
                    type="number"
                    value={platformSettings.autoApproveDepositThreshold}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        autoApproveDepositThreshold: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoWithdrawalThreshold">Auto-Approve Withdrawals Under</Label>
                  <Input
                    id="autoWithdrawalThreshold"
                    type="number"
                    value={platformSettings.autoApproveWithdrawalThreshold}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        autoApproveWithdrawalThreshold: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kycThreshold">KYC Required for Withdrawals Over</Label>
                  <Input
                    id="kycThreshold"
                    type="number"
                    value={platformSettings.kycRequiredForWithdrawal}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        kycRequiredForWithdrawal: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button onClick={() => savePlatformSettings(platformSettings)} className="w-full">
                  Save Auto-Approval Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Controls</CardTitle>
                <CardDescription>General platform settings and controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable user access for maintenance</p>
                  </div>
                  <Switch
                    checked={platformSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setPlatformSettings({ ...platformSettings, maintenanceMode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registration Enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                  </div>
                  <Switch
                    checked={platformSettings.registrationEnabled}
                    onCheckedChange={(checked) =>
                      setPlatformSettings({ ...platformSettings, registrationEnabled: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSessionTime">Maximum Session Time (minutes)</Label>
                  <Input
                    id="maxSessionTime"
                    type="number"
                    value={platformSettings.maxSessionTime}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        maxSessionTime: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button onClick={() => savePlatformSettings(platformSettings)} className="w-full">
                  Save Platform Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Configure available payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Deposit Methods</Label>
                  <div className="space-y-2">
                    {["Credit Card", "Bank Transfer", "Cryptocurrency", "E-Wallet", "Quick Deposit"].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`deposit-${method}`}
                          checked={platformSettings.depositMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlatformSettings({
                                ...platformSettings,
                                depositMethods: [...platformSettings.depositMethods, method],
                              })
                            } else {
                              setPlatformSettings({
                                ...platformSettings,
                                depositMethods: platformSettings.depositMethods.filter((m) => m !== method),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`deposit-${method}`}>{method}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Withdrawal Methods</Label>
                  <div className="space-y-2">
                    {["Bank Transfer", "Cryptocurrency", "E-Wallet", "Check"].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`withdrawal-${method}`}
                          checked={platformSettings.withdrawalMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlatformSettings({
                                ...platformSettings,
                                withdrawalMethods: [...platformSettings.withdrawalMethods, method],
                              })
                            } else {
                              setPlatformSettings({
                                ...platformSettings,
                                withdrawalMethods: platformSettings.withdrawalMethods.filter((m) => m !== method),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`withdrawal-${method}`}>{method}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => savePlatformSettings(platformSettings)} className="w-full">
                  Save Payment Methods
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user information and activity</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedUser.phone || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country:</span>
                      <span>{selectedUser.country || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <span>{selectedUser.dateOfBirth || "Not provided"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KYC Status:</span>
                      {getKYCBadge(selectedUser.kycStatus)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Verified:</span>
                      <span>{selectedUser.emailVerified ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone Verified:</span>
                      <span>{selectedUser.phoneVerified ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">2FA Enabled:</span>
                      <span>{selectedUser.twoFactorEnabled ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Financial Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="font-medium">${selectedUser.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Deposits:</span>
                      <span className="text-green-600">${selectedUser.totalDeposits.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Withdrawals:</span>
                      <span className="text-red-600">${selectedUser.totalWithdrawals.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Deposit:</span>
                      <span className="font-medium">
                        ${(selectedUser.totalDeposits - selectedUser.totalWithdrawals).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Gaming Activity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Games Played:</span>
                      <span>{selectedUser.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Winnings:</span>
                      <span className="text-green-600">${selectedUser.winnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Losses:</span>
                      <span className="text-red-600">${selectedUser.losses.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Gaming:</span>
                      <span className="font-medium">${(selectedUser.winnings - selectedUser.losses).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Activity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered:</span>
                      <span>{new Date(selectedUser.registeredAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span>
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referral Code:</span>
                      <span className="font-mono">{selectedUser.referralCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-2xl sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and settings</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSubmit={(updates) => handleUpdateUser(selectedUser.id, updates)}
              onCancel={() => {
                setShowEditUserDialog(false)
                setSelectedUser(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Balance Adjustment Dialog */}
      <Dialog open={showBalanceAdjustDialog} onOpenChange={setShowBalanceAdjustDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust User Balance</DialogTitle>
            <DialogDescription>
              Modify balance for {selectedUser?.name} (Current: ${selectedUser?.balance.toFixed(2)})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type</Label>
              <Select
                value={balanceAdjustment.type}
                onValueChange={(value) => setBalanceAdjustment({ ...balanceAdjustment, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add to Balance</SelectItem>
                  <SelectItem value="subtract">Subtract from Balance</SelectItem>
                  <SelectItem value="set">Set Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustmentAmount">Amount</Label>
              <Input
                id="adjustmentAmount"
                type="number"
                step="0.01"
                value={balanceAdjustment.amount}
                onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustmentReason">Reason</Label>
              <Textarea
                id="adjustmentReason"
                value={balanceAdjustment.reason}
                onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, reason: e.target.value })}
                placeholder="Reason for balance adjustment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBalanceAdjustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBalanceAdjustment}>Apply Adjustment</Button>
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
                    <p>Card ending in: {selectedDeposit.cardDetails.lastFourDigits}</p>
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
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
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
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
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

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetailsDialog} onOpenChange={setShowTransactionDetailsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete transaction information</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label>User</Label>
                  <p className="font-medium">{selectedTransaction.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.userEmail}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedTransaction.type.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p
                    className={`font-medium ${
                      selectedTransaction.type === "deposit" ||
                      selectedTransaction.type === "game_win" ||
                      selectedTransaction.type === "bonus"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.type === "deposit" ||
                    selectedTransaction.type === "game_win" ||
                    selectedTransaction.type === "bonus"
                      ? "+"
                      : "-"}
                    ${selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label>Method</Label>
                  <p>{selectedTransaction.method}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div>
                  <Label>Date</Label>
                  <p>{selectedTransaction.timestamp.toLocaleString()}</p>
                </div>
                {selectedTransaction.completedAt && (
                  <div>
                    <Label>Completed</Label>
                    <p>{selectedTransaction.completedAt.toLocaleString()}</p>
                  </div>
                )}
              </div>
              {selectedTransaction.fees && (
                <div>
                  <Label>Fees</Label>
                  <p>${selectedTransaction.fees.toFixed(2)}</p>
                </div>
              )}
              {selectedTransaction.adminNotes && (
                <div>
                  <Label>Admin Notes</Label>
                  <div className="bg-muted p-2 rounded text-sm">{selectedTransaction.adminNotes}</div>
                </div>
              )}
              {selectedTransaction.processedBy && (
                <div>
                  <Label>Processed By</Label>
                  <p>{selectedTransaction.processedBy}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Create User Form Component
function CreateUserForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "user",
    balance: 0,
    country: "",
    dateOfBirth: "",
    preferredCurrency: "USD",
    depositLimit: 10000,
    withdrawalLimit: 5000,
    autoApproveDeposits: false,
    autoApproveWithdrawals: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required.",
        variant: "destructive",
      })
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance">Initial Balance</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: Number.parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Select
            value={formData.preferredCurrency}
            onValueChange={(value) => setFormData({ ...formData, preferredCurrency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="depositLimit">Deposit Limit</Label>
          <Input
            id="depositLimit"
            type="number"
            value={formData.depositLimit}
            onChange={(e) => setFormData({ ...formData, depositLimit: Number.parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="withdrawalLimit">Withdrawal Limit</Label>
          <Input
            id="withdrawalLimit"
            type="number"
            value={formData.withdrawalLimit}
            onChange={(e) => setFormData({ ...formData, withdrawalLimit: Number.parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoApproveDeposits"
            checked={formData.autoApproveDeposits}
            onChange={(e) => setFormData({ ...formData, autoApproveDeposits: e.target.checked })}
          />
          <Label htmlFor="autoApproveDeposits">Auto-approve deposits</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoApproveWithdrawals"
            checked={formData.autoApproveWithdrawals}
            onChange={(e) => setFormData({ ...formData, autoApproveWithdrawals: e.target.checked })}
          />
          <Label htmlFor="autoApproveWithdrawals">Auto-approve withdrawals</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create User</Button>
      </DialogFooter>
    </form>
  )
}

// Edit User Form Component
function EditUserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user: User
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    role: user.role,
    status: user.status,
    kycStatus: user.kycStatus,
    country: user.country || "",
    dateOfBirth: user.dateOfBirth || "",
    preferredCurrency: user.preferredCurrency,
    depositLimit: user.depositLimit || 10000,
    withdrawalLimit: user.withdrawalLimit || 5000,
    autoApproveDeposits: user.autoApproveDeposits || false,
    autoApproveWithdrawals: user.autoApproveWithdrawals || false,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    twoFactorEnabled: user.twoFactorEnabled,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="kycStatus">KYC Status</Label>
          <Select
            value={formData.kycStatus}
            onValueChange={(value) => setFormData({ ...formData, kycStatus: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Select
            value={formData.preferredCurrency}
            onValueChange={(value) => setFormData({ ...formData, preferredCurrency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="depositLimit">Deposit Limit</Label>
          <Input
            id="depositLimit"
            type="number"
            value={formData.depositLimit}
            onChange={(e) => setFormData({ ...formData, depositLimit: Number.parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="withdrawalLimit">Withdrawal Limit</Label>
          <Input
            id="withdrawalLimit"
            type="number"
            value={formData.withdrawalLimit}
            onChange={(e) => setFormData({ ...formData, withdrawalLimit: Number.parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailVerified"
            checked={formData.emailVerified}
            onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
          />
          <Label htmlFor="emailVerified">Email Verified</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="phoneVerified"
            checked={formData.phoneVerified}
            onChange={(e) => setFormData({ ...formData, phoneVerified: e.target.checked })}
          />
          <Label htmlFor="phoneVerified">Phone Verified</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="twoFactorEnabled"
            checked={formData.twoFactorEnabled}
            onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
          />
          <Label htmlFor="twoFactorEnabled">2FA Enabled</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoApproveDeposits"
            checked={formData.autoApproveDeposits}
            onChange={(e) => setFormData({ ...formData, autoApproveDeposits: e.target.checked })}
          />
          <Label htmlFor="autoApproveDeposits">Auto-approve deposits</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoApproveWithdrawals"
            checked={formData.autoApproveWithdrawals}
            onChange={(e) => setFormData({ ...formData, autoApproveWithdrawals: e.target.checked })}
          />
          <Label htmlFor="autoApproveWithdrawals">Auto-approve withdrawals</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update User</Button>
      </DialogFooter>
    </form>
  )
}

export default function AdminPage() {
  return <AdminPageContent />
}
