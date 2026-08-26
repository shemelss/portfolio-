"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, User, Key, History, Wallet, DollarSign, Users, Gift } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import PasswordChangeForm from "./password-change-form"
import UserTransactionHistory from "./user-transaction-history"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ReferralQRCode from "./referral-qr-code"

type UserProfileSettingsProps = {
  userData: {
    id: string
    name: string
    email: string
    referralCode?: string
  }
  trigger?: React.ReactNode
  balance?: number
  onDeposit?: (amount: number) => void
  onWithdraw?: (amount: number) => void
}

export default function UserProfileSettings({
  userData,
  trigger,
  balance = 0,
  onDeposit = () => {},
  onWithdraw = () => {},
}: UserProfileSettingsProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState(userData.name)
  const [email, setEmail] = useState(userData.email)
  const [isLoading, setIsLoading] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [referrals, setReferrals] = useState<any[]>([])

  // Load referrals from localStorage
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: any) => u.id === userData.id)

      if (user && user.referrals) {
        // Convert date strings back to Date objects
        const loadedReferrals = user.referrals.map((ref: any) => ({
          ...ref,
          timestamp: new Date(ref.timestamp),
        }))
        setReferrals(loadedReferrals)
      }
    } catch (error) {
      console.error("Error loading referrals:", error)
    }
  }, [userData.id])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      // For this demo, we'll update localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === userData.id)

      if (userIndex === -1) {
        throw new Error("User not found")
      }

      // Update user data
      users[userIndex].name = name
      users[userIndex].email = email
      localStorage.setItem("users", JSON.stringify(users))

      // Update current user in localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      if (currentUser.id === userData.id) {
        currentUser.name = name
        currentUser.email = email
        localStorage.setItem("currentUser", JSON.stringify(currentUser))
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChangeSuccess = () => {
    setActiveTab("profile")
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    })
  }

  const handleDeposit = () => {
    const amount = Number(depositAmount)
    if (amount > 0) {
      onDeposit(amount)
      setDepositAmount("")

      toast({
        title: "Deposit Successful",
        description: `$${amount} has been added to your balance.`,
      })
    }
  }

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount)
    if (amount > 0 && amount <= balance) {
      onWithdraw(amount)
      setWithdrawAmount("")

      toast({
        title: "Withdrawal Initiated",
        description: `$${amount} will be sent to your wallet.`,
      })
    } else if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      })
    }
  }

  // Calculate referral statistics
  const totalReferrals = referrals.length
  const pendingReferrals = referrals.filter((ref) => ref.status === "pending").length
  const registeredReferrals = referrals.filter((ref) => ref.status === "registered").length
  const depositedReferrals = referrals.filter((ref) => ref.status === "deposited").length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>Update your profile information and manage your account.</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 pt-4">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="account" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-medium">Balance</h3>
                </div>
                <div className="text-3xl font-bold mb-4">${balance.toFixed(2)}</div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="deposit-amount">Deposit Amount</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        min="1"
                      />
                      <Button
                        onClick={handleDeposit}
                        disabled={!depositAmount || Number(depositAmount) <= 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Deposit
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min="1"
                        max={balance}
                      />
                      <Button
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    For detailed banking options including crypto deposits and withdrawals, use the Banking button in
                    the game.
                  </AlertDescription>
                </Alert>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-medium">Referrals</h3>
                </div>

                {userData.referralCode && (
                  <div className="mb-4">
                    <Label>Your Referral Code</Label>
                    <div className="mt-1 text-lg font-mono text-center font-bold p-2 bg-muted rounded-md">
                      {userData.referralCode}
                    </div>

                    <div className="flex justify-center my-3">
                      <ReferralQRCode referralCode={userData.referralCode} size={120} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted rounded p-2">
                    <div className="text-muted-foreground">Total Referrals</div>
                    <div className="text-xl font-bold">{totalReferrals}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="text-muted-foreground">Pending</div>
                    <div className="text-xl font-bold">{pendingReferrals}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="text-muted-foreground">Registered</div>
                    <div className="text-xl font-bold">{registeredReferrals}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="text-muted-foreground">Deposited</div>
                    <div className="text-xl font-bold">{depositedReferrals}</div>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(false)}>
                  <Gift className="mr-2 h-4 w-4" />
                  Manage Referrals
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 pt-4">
            <PasswordChangeForm
              userId={userData.id}
              onSuccess={handlePasswordChangeSuccess}
              onCancel={() => setActiveTab("profile")}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 pt-4">
            <UserTransactionHistory userId={userData.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
