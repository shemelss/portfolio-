"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Users, DollarSign, Edit, Trash2, Plus, Search, Eye, MoreHorizontal } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuditLogger } from "@/hooks/use-audit-logger"

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

interface AdminUserManagementProps {
  userData: any // Current logged-in admin user data
}

export default function AdminUserManagement({ userData }: AdminUserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
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

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false)
  const [showBalanceAdjustDialog, setShowBalanceAdjustDialog] = useState(false)

  // Form states
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: "",
    type: "add" as "add" | "subtract" | "set",
    reason: "",
  })

  const auditLogger = useAuditLogger()

  useEffect(() => {
    loadUsers()
    loadPlatformSettings()
  }, [])

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

  const loadPlatformSettings = () => {
    try {
      const stored = localStorage.getItem("platformSettings")
      if (stored) {
        const parsed = JSON.parse(stored)
        setPlatformSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error("Error loading platform settings:", error)
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

  // Enhanced User Management Functions
  const handleCreateUser = (newUserData: Partial<User>) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: newUserData.name || "",
      email: newUserData.email || "",
      phone: newUserData.phone || "",
      address: newUserData.address || "",
      role: newUserData.role || "user",
      balance: newUserData.balance || 0,
      status: "active",
      registeredAt: new Date().toISOString(),
      referralCode: `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      kycStatus: "unverified",
      totalDeposits: 0,
      totalWithdrawals: 0,
      gamesPlayed: 0,
      winnings: 0,
      losses: 0,
      preferredCurrency: newUserData.preferredCurrency || "USD",
      twoFactorEnabled: false,
      emailVerified: false,
      phoneVerified: false,
      country: newUserData.country || "",
      dateOfBirth: newUserData.dateOfBirth || "",
      depositLimit: newUserData.depositLimit || platformSettings.maxDeposit,
      withdrawalLimit: newUserData.withdrawalLimit || platformSettings.maxWithdrawal,
      autoApproveDeposits: newUserData.autoApproveDeposits || false,
      autoApproveWithdrawals: newUserData.autoApproveWithdrawals || false,
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

  // Status badge helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "suspended":
        return <Badge className="bg-yellow-500">Suspended</Badge>
      case "banned":
        return <Badge className="bg-red-500">Banned</Badge>
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

  return (
    <Card className="w-full">
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
            <SelectTrigger className="w-full lg:w-40">
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
            <SelectTrigger className="w-full lg:w-40">
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
                <TableHead className="min-w-[150px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead className="min-w-[120px]">Activity</TableHead>
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
                          <span className="text-sm font-medium text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
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

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
        <DialogContent className="max-w-2xl">
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
        <DialogContent>
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
    </Card>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
