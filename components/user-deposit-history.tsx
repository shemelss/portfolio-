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
import { TrendingUp, Clock, CheckCircle, XCircle, Bitcoin, Plus, AlertCircle, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { usePayment } from "@/contexts/payment-context"

interface DepositRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  method: string
  status: "pending" | "approved" | "rejected"
  timestamp: Date
  processedAt?: Date
  adminNotes?: string
  requiresApproval: boolean
  cryptoDetails?: {
    walletAddress: string
    network: string
    transactionHash?: string
  }
}

interface UserDepositHistoryProps {
  userId: string
}

const CRYPTO_ADDRESSES = {
  trx: "TPkmk3RJhuHiBJHKQDnPLEpB3FGFQMatQj",
  btc: "bc1qqa0zdkkpf6jelkpu76949re8famgmvqape8zmq",
  trc20: "TPkmk3RJhuHiBJHKQDnPLEpB3FGFQMatQj",
}

const CRYPTO_QR_CODES = {
  trx: "/qr-codes/trx-qr.jpg",
  btc: "/qr-codes/btc-qr.jpg",
  trc20: "/qr-codes/trc20-qr.jpg",
}

export default function UserDepositHistory({ userId }: UserDepositHistoryProps) {
  const [deposits, setDeposits] = useState<DepositRequest[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [showNewDepositDialog, setShowNewDepositDialog] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<"trx" | "btc" | "trc20">("trx")
  const [depositForm, setDepositForm] = useState({
    amount: "",
    transactionHash: "",
  })
  const [copied, setCopied] = useState(false)

  const { processDeposit } = usePayment()

  useEffect(() => {
    loadDeposits()
  }, [userId])

  const loadDeposits = () => {
    try {
      const storedDeposits = localStorage.getItem("depositRequests")
      if (storedDeposits) {
        const allDeposits = JSON.parse(storedDeposits)
        const userDeposits = allDeposits
          .filter((deposit: any) => deposit.userId === userId)
          .map((deposit: any) => ({
            ...deposit,
            timestamp: new Date(deposit.timestamp),
            processedAt: deposit.processedAt ? new Date(deposit.processedAt) : undefined,
          }))
          .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())

        setDeposits(userDeposits)
      }
    } catch (error) {
      console.error("Error loading deposits:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard.",
      })
    })
  }

  const handleNewDeposit = async () => {
    const amount = Number.parseFloat(depositForm.amount)

    if (!amount || amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is $10",
        variant: "destructive",
      })
      return
    }

    if (amount > 50000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum deposit amount is $50,000",
        variant: "destructive",
      })
      return
    }

    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    const depositRequest: DepositRequest = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      userName: currentUser.name || "Unknown User",
      userEmail: currentUser.email || "unknown@example.com",
      amount: amount,
      method: `Crypto (${selectedCrypto.toUpperCase()})`,
      status: "pending",
      timestamp: new Date(),
      requiresApproval: true,
      cryptoDetails: {
        walletAddress: CRYPTO_ADDRESSES[selectedCrypto],
        network: selectedCrypto,
        transactionHash: depositForm.transactionHash,
      },
    }

    // Save to localStorage for admin review
    try {
      const existingRequests = JSON.parse(localStorage.getItem("depositRequests") || "[]")
      existingRequests.push(depositRequest)
      localStorage.setItem("depositRequests", JSON.stringify(existingRequests))

      // Reload deposits
      loadDeposits()

      toast({
        title: "Deposit Request Submitted",
        description: `Your ${selectedCrypto.toUpperCase()} deposit of $${amount} has been submitted for admin approval.`,
      })

      // Reset form
      setDepositForm({
        amount: "",
        transactionHash: "",
      })
      setShowNewDepositDialog(false)
    } catch (error) {
      console.error("Error saving deposit request:", error)
      toast({
        title: "Error",
        description: "Failed to submit deposit request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredDeposits = deposits.filter((deposit) => {
    if (activeTab === "pending") return deposit.status === "pending"
    if (activeTab === "approved") return deposit.status === "approved"
    if (activeTab === "rejected") return deposit.status === "rejected"
    return true
  })

  const totalDeposited = deposits.filter((d) => d.status === "approved").reduce((sum, d) => sum + d.amount, 0)
  const pendingAmount = deposits.filter((d) => d.status === "pending").reduce((sum, d) => sum + d.amount, 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
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
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Crypto Deposit History
            </div>
            <Dialog open={showNewDepositDialog} onOpenChange={setShowNewDepositDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Crypto Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Cryptocurrency Deposit</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left side - Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Deposit Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={depositForm.amount}
                        onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                        min="10"
                        max="50000"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Min: $10 | Max: $50,000</p>
                    </div>

                    <div>
                      <Label>Select Cryptocurrency</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button
                          variant={selectedCrypto === "trx" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCrypto("trx")}
                          className="flex flex-col gap-1 h-auto py-3"
                        >
                          <Bitcoin className="h-4 w-4" />
                          <span className="text-xs">TRX</span>
                        </Button>
                        <Button
                          variant={selectedCrypto === "btc" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCrypto("btc")}
                          className="flex flex-col gap-1 h-auto py-3"
                        >
                          <Bitcoin className="h-4 w-4" />
                          <span className="text-xs">BTC</span>
                        </Button>
                        <Button
                          variant={selectedCrypto === "trc20" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCrypto("trc20")}
                          className="flex flex-col gap-1 h-auto py-3"
                        >
                          <Bitcoin className="h-4 w-4" />
                          <span className="text-xs">TRC20</span>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="transactionHash">Transaction Hash (Optional)</Label>
                      <Input
                        id="transactionHash"
                        placeholder="Enter transaction hash after sending"
                        value={depositForm.transactionHash}
                        onChange={(e) => setDepositForm({ ...depositForm, transactionHash: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can add this after making the transaction
                      </p>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Send only {selectedCrypto.toUpperCase()} to the address shown. All deposits require admin
                        approval and network confirmations.
                      </AlertDescription>
                    </Alert>

                    <Button onClick={handleNewDeposit} className="w-full">
                      Submit Deposit Request
                    </Button>
                  </div>

                  {/* Right side - QR Code and Address */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">{selectedCrypto.toUpperCase()} Deposit Address</h3>
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img
                          src={CRYPTO_QR_CODES[selectedCrypto] || "/placeholder.svg"}
                          alt={`${selectedCrypto.toUpperCase()} QR Code`}
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Wallet Address</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(CRYPTO_ADDRESSES[selectedCrypto])}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="font-mono text-sm break-all bg-muted p-3 rounded border">
                        {CRYPTO_ADDRESSES[selectedCrypto]}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Instructions:</h4>
                      <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>1. Copy the wallet address above</li>
                        <li>2. Send {selectedCrypto.toUpperCase()} to this address</li>
                        <li>3. Enter the transaction hash (optional)</li>
                        <li>4. Submit your deposit request</li>
                        <li>5. Wait for admin approval</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Deposited</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">${totalDeposited.toFixed(2)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">${pendingAmount.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{deposits.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({deposits.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({deposits.filter((d) => d.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({deposits.filter((d) => d.status === "approved").length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({deposits.filter((d) => d.status === "rejected").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 pt-4">
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {filteredDeposits.length > 0 ? (
                  filteredDeposits.map((deposit) => (
                    <Card key={deposit.id} className="p-4 bg-white/5 border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bitcoin className="h-5 w-5 text-orange-500" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">${deposit.amount.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-white/70">{deposit.method}</p>
                            <p className="text-xs text-white/50">
                              {deposit.timestamp.toLocaleDateString()} at {deposit.timestamp.toLocaleTimeString()}
                            </p>
                            {deposit.cryptoDetails?.transactionHash && (
                              <p className="text-xs text-white/50 font-mono">
                                TX: {deposit.cryptoDetails.transactionHash.slice(0, 20)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(deposit.status)}
                          {deposit.processedAt && (
                            <p className="text-xs text-white/50">
                              Processed: {deposit.processedAt.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {deposit.adminNotes && (
                        <div className="mt-3 p-2 bg-white/10 rounded text-sm">
                          <p className="font-medium text-white/70 mb-1">Admin Notes:</p>
                          <p className="text-white/90">{deposit.adminNotes}</p>
                        </div>
                      )}

                      {deposit.status === "pending" && (
                        <div className="mt-3 p-2 bg-yellow-500/20 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-400" />
                            <span className="font-medium text-yellow-300">Awaiting Admin Approval</span>
                          </div>
                          <p className="text-yellow-200 mt-1">
                            Your crypto deposit is being reviewed. Processing typically takes 1-24 hours after network
                            confirmations.
                          </p>
                        </div>
                      )}

                      {deposit.status === "approved" && (
                        <div className="mt-3 p-2 bg-green-500/20 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="font-medium text-green-300">Deposit Approved</span>
                          </div>
                          <p className="text-green-200 mt-1">
                            Your crypto deposit has been approved and added to your balance.
                          </p>
                        </div>
                      )}

                      {deposit.status === "rejected" && deposit.adminNotes && (
                        <div className="mt-3 p-2 bg-red-500/20 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="font-medium text-red-300">Deposit Rejected</span>
                          </div>
                          <p className="text-red-200 mt-1">
                            Please contact support if you have questions about this rejection.
                          </p>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bitcoin className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">No crypto deposits found</p>
                    <p className="text-sm text-white/50 mt-1">
                      {activeTab === "all"
                        ? "You haven't made any crypto deposit requests yet."
                        : `No ${activeTab} deposits found.`}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
