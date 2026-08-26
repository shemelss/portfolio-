"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Bitcoin,
  Plus,
  AlertCircle,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface UserWithdrawalHistoryProps {
  userId: string
}

const TRC20_ADDRESS = "TPkmk3RJhuHiBJHKQDnPLEpB3FGFQMatQj"

export default function UserWithdrawalHistory({ userId }: UserWithdrawalHistoryProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [showNewWithdrawalDialog, setShowNewWithdrawalDialog] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [hideBalances, setHideBalances] = useState(false)
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    trc20Address: "",
  })

  useEffect(() => {
    loadWithdrawals()
    loadUserBalance()
  }, [userId])

  const loadUserBalance = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      setUserBalance(currentUser.balance || 0)
    } catch (error) {
      console.error("Error loading user balance:", error)
    }
  }

  const loadWithdrawals = () => {
    try {
      const storedWithdrawals = localStorage.getItem("withdrawalRequests")
      if (storedWithdrawals) {
        const allWithdrawals = JSON.parse(storedWithdrawals)
        const userWithdrawals = allWithdrawals
          .filter((withdrawal: any) => withdrawal.userId === userId)
          .map((withdrawal: any) => ({
            ...withdrawal,
            timestamp: new Date(withdrawal.timestamp),
            processedAt: withdrawal.processedAt ? new Date(withdrawal.processedAt) : undefined,
            estimatedCompletion: withdrawal.estimatedCompletion ? new Date(withdrawal.estimatedCompletion) : undefined,
          }))
          .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())

        setWithdrawals(userWithdrawals)
      }
    } catch (error) {
      console.error("Error loading withdrawals:", error)
    }
  }

  const calculateFees = (amount: number) => {
    return Math.round(amount * 0.025 * 100) / 100 // 2.5% fee
  }

  const validateTRC20Address = (address: string) => {
    // Basic TRC20 address validation (starts with T and is 34 characters)
    return address.startsWith("T") && address.length === 34
  }

  const handleNewWithdrawal = async () => {
    const amount = Number.parseFloat(withdrawalForm.amount)

    if (!amount || amount < 50) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is $50",
        variant: "destructive",
      })
      return
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      })
      return
    }

    if (amount > 10000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum withdrawal amount is $10,000",
        variant: "destructive",
      })
      return
    }

    if (!withdrawalForm.trc20Address) {
      toast({
        title: "Missing Address",
        description: "Please enter your TRC20 wallet address",
        variant: "destructive",
      })
      return
    }

    if (!validateTRC20Address(withdrawalForm.trc20Address)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid TRC20 wallet address",
        variant: "destructive",
      })
      return
    }

    const fees = calculateFees(amount)
    const netAmount = amount - fees

    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    const withdrawalRequest: WithdrawalRequest = {
      id: `with_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      userName: currentUser.name || "Unknown User",
      userEmail: currentUser.email || "unknown@example.com",
      amount: amount,
      method: "Crypto (TRC20)",
      accountDetails: `TRC20 wallet: ${withdrawalForm.trc20Address}`,
      status: "pending",
      timestamp: new Date(),
      fees: fees,
      netAmount: netAmount,
      verificationRequired: amount > 1000,
      riskScore: amount > 5000 ? 3 : amount > 1000 ? 2 : 1,
      requiresApproval: true,
    }

    // Save to localStorage for admin review
    try {
      const existingRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")
      existingRequests.push(withdrawalRequest)
      localStorage.setItem("withdrawalRequests", JSON.stringify(existingRequests))

      // Reload withdrawals
      loadWithdrawals()

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your TRC20 withdrawal of $${amount} has been submitted for admin approval.`,
      })

      // Reset form
      setWithdrawalForm({
        amount: "",
        trc20Address: "",
      })
      setShowNewWithdrawalDialog(false)
    } catch (error) {
      console.error("Error saving withdrawal request:", error)
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (activeTab === "pending") return withdrawal.status === "pending"
    if (activeTab === "approved") return withdrawal.status === "approved"
    if (activeTab === "rejected") return withdrawal.status === "rejected"
    if (activeTab === "completed") return withdrawal.status === "completed"
    return true
  })

  const totalWithdrawn = withdrawals.filter((w) => w.status === "completed").reduce((sum, w) => sum + w.amount, 0)
  const pendingAmount = withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0)
  const processingAmount = withdrawals.filter((w) => w.status === "processing").reduce((sum, w) => sum + w.amount, 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "approved":
        return <Badge className="bg-blue-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "processing":
        return <Badge className="bg-purple-500">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-white">{hideBalances ? "****" : `$${userBalance.toFixed(2)}`}</p>
              </div>
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Withdrawn</p>
                <p className="text-2xl font-bold text-green-400">
                  {hideBalances ? "****" : `$${totalWithdrawn.toFixed(2)}`}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {hideBalances ? "****" : `$${pendingAmount.toFixed(2)}`}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Processing</p>
                <p className="text-2xl font-bold text-blue-400">
                  {hideBalances ? "****" : `$${processingAmount.toFixed(2)}`}
                </p>
              </div>
              <Bitcoin className="h-8 w-8 text-blue-400" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideBalances(!hideBalances)}
              className="mt-2 text-white/60 hover:text-white"
            >
              {hideBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Management */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              TRC20 Withdrawal History
            </div>
            <Dialog open={showNewWithdrawalDialog} onOpenChange={setShowNewWithdrawalDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700" disabled={userBalance < 50}>
                  <Plus className="h-4 w-4 mr-2" />
                  New TRC20 Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit TRC20 Withdrawal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium">Available Balance</p>
                    <p className="text-2xl font-bold text-blue-600">${userBalance.toFixed(2)}</p>
                  </div>

                  <div>
                    <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                      min="50"
                      max={Math.min(userBalance, 10000)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Min: $50 | Max: ${Math.min(userBalance, 10000).toFixed(2)} | Fee: 2.5%
                    </p>
                    {withdrawalForm.amount && (
                      <p className="text-xs text-green-600 mt-1">
                        You'll receive: $
                        {(
                          Number.parseFloat(withdrawalForm.amount) -
                          calculateFees(Number.parseFloat(withdrawalForm.amount))
                        ).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="trc20Address">Your TRC20 Wallet Address</Label>
                    <Textarea
                      id="trc20Address"
                      placeholder="Enter your TRC20 wallet address (starts with T)"
                      value={withdrawalForm.trc20Address}
                      onChange={(e) => setWithdrawalForm({ ...withdrawalForm, trc20Address: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Make sure this is a valid TRC20 address. Double-check before submitting.
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      All withdrawals are processed via TRC20 network only. Processing typically takes 1-24 hours after
                      admin approval. Withdrawals over $1,000 may require additional verification.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Important:</h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Only TRC20 network is supported</li>
                      <li>• Verify your wallet address carefully</li>
                      <li>• Incorrect addresses cannot be recovered</li>
                      <li>• Processing fee: 2.5% of withdrawal amount</li>
                    </ul>
                  </div>

                  <Button onClick={handleNewWithdrawal} className="w-full">
                    Submit TRC20 Withdrawal Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-white/10">
              <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/20">
                All ({withdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-white data-[state=active]:bg-white/20">
                Pending ({withdrawals.filter((w) => w.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-white data-[state=active]:bg-white/20">
                Approved ({withdrawals.filter((w) => w.status === "approved").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-white data-[state=active]:bg-white/20">
                Completed ({withdrawals.filter((w) => w.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-white data-[state=active]:bg-white/20">
                Rejected ({withdrawals.filter((w) => w.status === "rejected").length})
              </TabsTrigger>
            </TabsList>

            {["all", "pending", "approved", "completed", "rejected"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4 pt-4">
                {filteredWithdrawals.length === 0 ? (
                  <div className="text-center py-8">
                    <Bitcoin className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">No {tabValue === "all" ? "" : tabValue} withdrawals found</p>
                    <p className="text-sm text-white/50 mt-1">
                      {tabValue === "all"
                        ? "You haven't made any withdrawal requests yet."
                        : `No ${tabValue} withdrawals found.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {filteredWithdrawals.map((withdrawal) => (
                      <Card key={withdrawal.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Bitcoin className="h-5 w-5 text-orange-400" />
                              <div>
                                <p className="text-white font-medium">
                                  ${withdrawal.amount.toFixed(2)} Withdrawal
                                  <span className="text-sm text-white/50 ml-2">
                                    (Net: ${withdrawal.netAmount.toFixed(2)})
                                  </span>
                                </p>
                                <p className="text-white/60 text-sm">
                                  {withdrawal.timestamp.toLocaleDateString()} at{" "}
                                  {withdrawal.timestamp.toLocaleTimeString()}
                                </p>
                                <p className="text-white/60 text-sm">Via TRC20</p>
                                <p className="text-white/50 text-xs font-mono">
                                  To: {withdrawal.accountDetails.replace("TRC20 wallet: ", "").slice(0, 20)}...
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusIcon(withdrawal.status)}
                                {getStatusBadge(withdrawal.status)}
                              </div>
                              <p className="text-white/60 text-sm">Fee: ${withdrawal.fees.toFixed(2)}</p>
                              {withdrawal.status === "processing" && (
                                <p className="text-white/60 text-xs">
                                  Est: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {withdrawal.adminNotes && (
                            <div className="mt-3 p-2 bg-white/10 rounded text-sm">
                              <p className="font-medium text-white/70 mb-1">Admin Notes:</p>
                              <p className="text-white/90">{withdrawal.adminNotes}</p>
                            </div>
                          )}

                          {withdrawal.status === "pending" && (
                            <div className="mt-3 p-2 bg-yellow-500/20 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-400" />
                                <span className="font-medium text-yellow-300">Awaiting Admin Approval</span>
                              </div>
                              <p className="text-yellow-200 mt-1">
                                Your TRC20 withdrawal request is being reviewed. Processing typically takes 1-24 hours.
                              </p>
                            </div>
                          )}

                          {withdrawal.status === "approved" && (
                            <div className="mt-3 p-2 bg-blue-500/20 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-400" />
                                <span className="font-medium text-blue-300">Withdrawal Approved</span>
                              </div>
                              <p className="text-blue-200 mt-1">
                                Your withdrawal has been approved and is being processed on the TRC20 network.
                              </p>
                            </div>
                          )}

                          {withdrawal.status === "completed" && (
                            <div className="mt-3 p-2 bg-green-500/20 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span className="font-medium text-green-300">Withdrawal Completed</span>
                              </div>
                              <p className="text-green-200 mt-1">
                                Your TRC20 withdrawal has been completed and sent to your wallet.
                              </p>
                            </div>
                          )}

                          {withdrawal.status === "rejected" && withdrawal.adminNotes && (
                            <div className="mt-3 p-2 bg-red-500/20 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-400" />
                                <span className="font-medium text-red-300">Withdrawal Rejected</span>
                              </div>
                              <p className="text-red-200 mt-1">
                                Please contact support if you have questions about this rejection.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
