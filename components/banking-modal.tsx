"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Wallet, Copy, Check, Bitcoin, AlertCircle, Users, Gift, Share2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import ReferralQRCode from "./referral-qr-code"
import { useNotifications } from "@/contexts/notification-context"

// Constants for withdrawal limits
const MIN_WITHDRAWAL = 50
const MAX_WITHDRAWAL = 10000

// Constants for referral bonuses
const REFERRAL_BONUS = 25
const REFERRAL_BONUS_THRESHOLD = 3

type CryptoType = "trx" | "btc" | "trc20"

type Transaction = {
  id: number
  type: "deposit" | "withdrawal" | "referral_bonus"
  amount: number
  timestamp: Date
  cryptoType?: CryptoType
  walletAddress?: string
  referredUser?: string
}

type Referral = {
  id: number
  email: string
  status: "pending" | "registered" | "deposited"
  timestamp: Date
  bonusPaid: boolean
}

type BankingModalProps = {
  balance: number
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  userData?: any
}

// Cryptocurrency wallet addresses
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

export default function BankingModal({
  balance,
  onDeposit,
  onWithdraw,
  open,
  onOpenChange,
  activeTab = "deposit",
  onTabChange,
  userData,
}: BankingModalProps) {
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [internalOpen, setInternalOpen] = useState(false)
  const [selectedDepositCrypto, setSelectedDepositCrypto] = useState<CryptoType>("trx")
  const [withdrawWalletAddress, setWithdrawWalletAddress] = useState("")
  const [copied, setCopied] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  // Referral system states
  const [referralCode, setReferralCode] = useState("")
  const [referralEmail, setReferralEmail] = useState("")
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralLinkCopied, setReferralLinkCopied] = useState(false)

  const { addNotification } = useNotifications()

  // Load user data and referrals from localStorage
  useEffect(() => {
    if (userData) {
      setReferralCode(userData.referralCode || "")

      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const user = users.find((u: any) => u.id === userData.id)

        if (user && user.referrals) {
          const loadedReferrals = user.referrals.map((ref: any) => ({
            ...ref,
            timestamp: new Date(ref.timestamp),
          }))
          setReferrals(loadedReferrals)
        }
      } catch (error) {
        console.error("Error loading referrals:", error)
      }
    }
  }, [userData])

  // Use either controlled or uncontrolled open state
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  // Use either controlled or uncontrolled tab state
  const currentTab = activeTab
  const setCurrentTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  const createDepositRequest = useCallback(
    (amount: number, cryptoType: CryptoType) => {
      const depositRequest = {
        id: `dep_${Date.now()}`,
        userId: userData?.id || "unknown",
        userName: userData?.name || "Unknown User",
        userEmail: userData?.email || "unknown@example.com",
        amount: amount,
        method: `Crypto (${cryptoType.toUpperCase()})`,
        status: "pending" as const,
        timestamp: new Date(),
        requiresApproval: true,
        cryptoDetails: {
          walletAddress: CRYPTO_ADDRESSES[cryptoType],
          network: cryptoType,
        },
      }

      // Save to localStorage for admin review
      try {
        const existingRequests = JSON.parse(localStorage.getItem("depositRequests") || "[]")
        existingRequests.push(depositRequest)
        localStorage.setItem("depositRequests", JSON.stringify(existingRequests))
      } catch (error) {
        console.error("Error saving deposit request:", error)
      }

      return depositRequest
    },
    [userData],
  )

  const createWithdrawalRequest = useCallback(
    (amount: number, walletAddress: string) => {
      const withdrawalRequest = {
        id: `with_${Date.now()}`,
        userId: userData?.id || "unknown",
        userName: userData?.name || "Unknown User",
        userEmail: userData?.email || "unknown@example.com",
        amount: amount,
        method: "Crypto (TRC20)",
        accountDetails: `TRC20 wallet: ${walletAddress}`,
        status: "pending" as const,
        timestamp: new Date(),
        fees: Math.round(amount * 0.025 * 100) / 100, // 2.5% fee
        netAmount: amount - Math.round(amount * 0.025 * 100) / 100,
        verificationRequired: amount > 1000,
        riskScore: amount > 5000 ? 3 : amount > 1000 ? 2 : 1,
        requiresApproval: true,
      }

      // Save to localStorage for admin review
      try {
        const existingRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")
        existingRequests.push(withdrawalRequest)
        localStorage.setItem("withdrawalRequests", JSON.stringify(existingRequests))
      } catch (error) {
        console.error("Error saving withdrawal request:", error)
      }

      return withdrawalRequest
    },
    [userData],
  )

  const handleDeposit = useCallback(() => {
    const amount = Number.parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      })
      return
    }

    if (amount < 10) {
      toast({
        title: "Minimum Deposit",
        description: "Minimum deposit amount is $10.",
        variant: "destructive",
      })
      return
    }

    if (amount > 10000) {
      toast({
        title: "Maximum Deposit",
        description: "Maximum deposit amount is $10,000.",
        variant: "destructive",
      })
      return
    }

    createDepositRequest(amount, selectedDepositCrypto)

    addNotification({
      id: Date.now().toString(),
      type: "info",
      title: "Crypto Deposit Request Submitted",
      message: `Your ${selectedDepositCrypto.toUpperCase()} deposit of $${amount} has been submitted for admin approval.`,
      timestamp: new Date(),
      read: false,
    })

    toast({
      title: "Deposit Request Submitted",
      description: `Your ${selectedDepositCrypto.toUpperCase()} deposit of $${amount} is pending admin approval. You'll be notified once processed.`,
    })

    setDepositAmount("")
    setIsOpen(false)
  }, [depositAmount, selectedDepositCrypto, createDepositRequest, addNotification, setIsOpen])

  const validateTRC20Address = useCallback((address: string) => {
    return address.startsWith("T") && address.length === 34
  }, [])

  const handleWithdraw = useCallback(() => {
    const amount = Number.parseFloat(withdrawAmount)
    setWithdrawError(null)

    if (isNaN(amount) || amount <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount.")
      return
    }

    if (amount < MIN_WITHDRAWAL) {
      setWithdrawError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}.`)
      return
    }

    if (amount > MAX_WITHDRAWAL) {
      setWithdrawError(`Maximum withdrawal amount is $${MAX_WITHDRAWAL}.`)
      return
    }

    if (amount > balance) {
      setWithdrawError("Insufficient balance for this withdrawal.")
      return
    }

    if (!withdrawWalletAddress) {
      setWithdrawError("Please enter a valid TRC20 wallet address.")
      return
    }

    if (!validateTRC20Address(withdrawWalletAddress)) {
      setWithdrawError("Please enter a valid TRC20 wallet address (starts with T).")
      return
    }

    createWithdrawalRequest(amount, withdrawWalletAddress)

    addNotification({
      id: Date.now().toString(),
      type: "info",
      title: "Withdrawal Request Submitted",
      message: `Your TRC20 withdrawal of $${amount} has been submitted for admin approval.`,
      timestamp: new Date(),
      read: false,
    })

    toast({
      title: "Withdrawal Request Submitted",
      description: `Your TRC20 withdrawal of $${amount} is pending admin approval. Processing typically takes 1-3 business days.`,
    })

    setWithdrawAmount("")
    setWithdrawWalletAddress("")
    setIsOpen(false)
  }, [
    withdrawAmount,
    withdrawWalletAddress,
    balance,
    validateTRC20Address,
    createWithdrawalRequest,
    addNotification,
    setIsOpen,
  ])

  const copyToClipboard = useCallback((text: string, type: "address" | "referral") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "address") {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setReferralLinkCopied(true)
        setTimeout(() => setReferralLinkCopied(false), 2000)
      }
      toast({
        title: "Copied!",
        description: `${type === "address" ? "Wallet address" : "Referral link"} copied to clipboard.`,
      })
    })
  }, [])

  const handleReferralSubmit = useCallback(() => {
    if (!referralEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the referral.",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(referralEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    const newReferral: Referral = {
      id: Date.now(),
      email: referralEmail,
      status: "pending",
      timestamp: new Date(),
      bonusPaid: false,
    }

    const updatedReferrals = [...referrals, newReferral]
    setReferrals(updatedReferrals)

    // Save to user data
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === userData?.id)
      if (userIndex !== -1) {
        users[userIndex].referrals = updatedReferrals
        localStorage.setItem("users", JSON.stringify(users))
      }
    } catch (error) {
      console.error("Error saving referral:", error)
    }

    toast({
      title: "Referral Sent!",
      description: `Referral invitation sent to ${referralEmail}. You'll earn $${REFERRAL_BONUS} when they make their first deposit!`,
    })

    setReferralEmail("")
  }, [referralEmail, referrals, userData])

  const getReferralLink = useCallback(() => {
    return `${window.location.origin}/?ref=${referralCode}`
  }, [referralCode])

  const completedReferrals = referrals.filter((ref) => ref.status === "deposited").length
  const referralProgress = (completedReferrals / REFERRAL_BONUS_THRESHOLD) * 100

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Banking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Crypto Banking Center
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <div className="text-center">
                <div className="text-sm text-blue-600 font-medium mb-2">Current Balance</div>
                <div className="text-3xl font-bold text-blue-900">${balance.toFixed(2)}</div>
                <div className="text-xs text-blue-600 mt-2">Available for withdrawal</div>
              </div>
            </Card>
          </div>

          {/* Main Banking Interface */}
          <div className="lg:col-span-2">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deposit">Crypto Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">TRC20 Withdraw</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>

              {/* Crypto Deposit Tab */}
              <TabsContent value="deposit" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Deposit Amount (USD)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10"
                      max="10000"
                    />
                    <div className="text-xs text-muted-foreground mt-1">Minimum: $10 | Maximum: $10,000</div>
                  </div>

                  <div>
                    <Label>Select Cryptocurrency</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {Object.entries(CRYPTO_ADDRESSES).map(([crypto, address]) => (
                        <Button
                          key={crypto}
                          variant={selectedDepositCrypto === crypto ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDepositCrypto(crypto as CryptoType)}
                          className="justify-start gap-2 flex-col h-auto py-3"
                        >
                          <Bitcoin className="h-4 w-4" />
                          <span className="text-xs">{crypto.toUpperCase()}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* QR Code */}
                    <div className="text-center">
                      <Label className="text-sm font-medium">{selectedDepositCrypto.toUpperCase()} QR Code</Label>
                      <div className="bg-white p-4 rounded-lg inline-block mt-2">
                        <img
                          src={CRYPTO_QR_CODES[selectedDepositCrypto] || "/placeholder.svg"}
                          alt={`${selectedDepositCrypto.toUpperCase()} QR Code`}
                          className="w-32 h-32 mx-auto"
                        />
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Deposit Address ({selectedDepositCrypto.toUpperCase()})</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(CRYPTO_ADDRESSES[selectedDepositCrypto], "address")}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="font-mono text-sm break-all bg-background p-3 rounded border">
                        {CRYPTO_ADDRESSES[selectedDepositCrypto]}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Send only {selectedDepositCrypto.toUpperCase()} to this address. All deposits require admin
                      approval and network confirmations. Processing typically takes 1-24 hours.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Instructions:</h4>
                    <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>1. Copy the wallet address or scan the QR code</li>
                      <li>2. Send {selectedDepositCrypto.toUpperCase()} to this address</li>
                      <li>3. Enter the deposit amount above</li>
                      <li>4. Submit your deposit request</li>
                      <li>5. Wait for admin approval and network confirmations</li>
                    </ol>
                  </div>

                  <Button onClick={handleDeposit} className="w-full" size="lg">
                    Submit {selectedDepositCrypto.toUpperCase()} Deposit Request
                  </Button>
                </div>
              </TabsContent>

              {/* TRC20 Withdraw Tab */}
              <TabsContent value="withdraw" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount">Withdrawal Amount (USD)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min={MIN_WITHDRAWAL}
                      max={Math.min(balance, MAX_WITHDRAWAL)}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Minimum: ${MIN_WITHDRAWAL} | Maximum: ${Math.min(balance, MAX_WITHDRAWAL).toFixed(2)} | Fee: 2.5%
                    </div>
                    {withdrawAmount && (
                      <div className="text-xs text-green-600 mt-1">
                        You'll receive: $
                        {(
                          Number.parseFloat(withdrawAmount) -
                          Math.round(Number.parseFloat(withdrawAmount) * 0.025 * 100) / 100
                        ).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="wallet-address">Your TRC20 Wallet Address</Label>
                    <Input
                      id="wallet-address"
                      placeholder="Enter your TRC20 wallet address (starts with T)"
                      value={withdrawWalletAddress}
                      onChange={(e) => setWithdrawWalletAddress(e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Make sure this is a valid TRC20 address. Double-check before submitting.
                    </div>
                  </div>

                  {withdrawError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{withdrawError}</AlertDescription>
                    </Alert>
                  )}

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
                      <li>• Only TRC20 network is supported for withdrawals</li>
                      <li>• Verify your wallet address carefully</li>
                      <li>• Incorrect addresses cannot be recovered</li>
                      <li>• Processing fee: 2.5% of withdrawal amount</li>
                      <li>• Minimum withdrawal: ${MIN_WITHDRAWAL}</li>
                    </ul>
                  </div>

                  <Button onClick={handleWithdraw} className="w-full" size="lg" disabled={balance < MIN_WITHDRAWAL}>
                    Submit TRC20 Withdrawal Request
                  </Button>
                </div>
              </TabsContent>

              {/* Referrals Tab */}
              <TabsContent value="referrals" className="space-y-4">
                <div className="space-y-6">
                  {/* Referral Stats */}
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold">Referral Program</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{referrals.length}</div>
                        <div className="text-xs text-muted-foreground">Total Sent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{completedReferrals}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">${completedReferrals * REFERRAL_BONUS}</div>
                        <div className="text-xs text-muted-foreground">Earned</div>
                      </div>
                    </div>
                  </Card>

                  {/* Bonus Progress */}
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Bonus Progress</span>
                    </div>
                    <Progress value={referralProgress} className="mb-2" />
                    <div className="text-sm text-muted-foreground">
                      {completedReferrals} of {REFERRAL_BONUS_THRESHOLD} referrals completed for next bonus
                    </div>
                  </Card>

                  {/* Referral Link */}
                  <div className="space-y-3">
                    <Label>Your Referral Link</Label>
                    <div className="flex gap-2">
                      <Input value={getReferralLink()} readOnly className="font-mono text-sm" />
                      <Button variant="outline" onClick={() => copyToClipboard(getReferralLink(), "referral")}>
                        {referralLinkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <ReferralQRCode referralCode={referralCode} />
                  </div>

                  {/* Send Referral */}
                  <div className="space-y-3">
                    <Label htmlFor="referral-email">Send Referral Invitation</Label>
                    <div className="flex gap-2">
                      <Input
                        id="referral-email"
                        type="email"
                        placeholder="Enter friend's email"
                        value={referralEmail}
                        onChange={(e) => setReferralEmail(e.target.value)}
                      />
                      <Button onClick={handleReferralSubmit}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>

                  {/* Referral List */}
                  {referrals.length > 0 && (
                    <div className="space-y-3">
                      <Label>Your Referrals</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {referrals.map((referral) => (
                          <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{referral.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {referral.timestamp.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-medium ${
                                  referral.status === "deposited"
                                    ? "text-green-600"
                                    : referral.status === "registered"
                                      ? "text-blue-600"
                                      : "text-yellow-600"
                                }`}
                              >
                                {referral.status === "deposited"
                                  ? "Completed"
                                  : referral.status === "registered"
                                    ? "Registered"
                                    : "Pending"}
                              </div>
                              {referral.bonusPaid && <div className="text-xs text-green-600">+${REFERRAL_BONUS}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Alert>
                    <Gift className="h-4 w-4" />
                    <AlertDescription>
                      Earn ${REFERRAL_BONUS} for each friend who registers and makes their first crypto deposit! Bonus
                      is added to your balance automatically.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
