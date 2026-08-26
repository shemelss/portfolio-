"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Gift, DollarSign, CheckCircle, Search, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuditLogger } from "@/hooks/use-audit-logger"

interface Referral {
  id: string
  referrerId: string
  referrerName: string
  referrerEmail: string
  referredUserId?: string
  referredUserName?: string
  referredUserEmail: string
  status: "pending" | "registered" | "deposited" | "bonus_paid" | "cancelled"
  timestamp: Date
  bonusAmount: number
  bonusPaidAt?: Date
}

interface User {
  id: string
  name: string
  email: string
  referralCode: string
  balance: number
}

interface AdminReferralAnalyticsProps {
  adminUserData: any // Current logged-in admin user data
}

export default function AdminReferralAnalytics({ adminUserData }: AdminReferralAnalyticsProps) {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [users, setUsers] = useState<User[]>([]) // To map user IDs to names/emails

  // Filters
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const auditLogger = useAuditLogger()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
      setUsers(storedUsers)

      // Simulate loading referrals, linking them to users
      const allReferrals: Referral[] = []
      storedUsers.forEach((user: User) => {
        if (user.referrals) {
          user.referrals.forEach((ref: any) => {
            const referredUser = storedUsers.find((u: User) => u.email === ref.email)
            allReferrals.push({
              id: `ref_${ref.id}`,
              referrerId: user.id,
              referrerName: user.name,
              referrerEmail: user.email,
              referredUserId: referredUser?.id,
              referredUserName: referredUser?.name,
              referredUserEmail: ref.email,
              status: ref.status,
              timestamp: new Date(ref.timestamp),
              bonusAmount: 25, // Assuming a fixed bonus
              bonusPaidAt: ref.bonusPaid ? new Date() : undefined, // Mock paid date
            })
          })
        }
      })
      setReferrals(allReferrals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    } catch (error) {
      console.error("Error loading referral data:", error)
      toast({
        title: "Error",
        description: "Failed to load referral data.",
        variant: "destructive",
      })
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

  const handleMarkBonusPaid = (referralId: string) => {
    const referralToUpdate = referrals.find((r) => r.id === referralId)
    if (!referralToUpdate || referralToUpdate.status === "bonus_paid") return

    const updatedReferrals = referrals.map((r) =>
      r.id === referralId ? { ...r, status: "bonus_paid" as const, bonusPaidAt: new Date() } : r,
    )
    setReferrals(updatedReferrals)

    // Update referrer's balance
    const referrer = users.find((u) => u.id === referralToUpdate.referrerId)
    if (referrer) {
      const updatedUsers = users.map((u) =>
        u.id === referrer.id ? { ...u, balance: u.balance + referralToUpdate.bonusAmount } : u,
      )
      saveUsers(updatedUsers)
    }

    auditLogger.logFinancialAction("Referral Bonus Paid", {
      adminId: adminUserData.id,
      targetReferralId: referralId,
      referrerId: referralToUpdate.referrerId,
      referredUserEmail: referralToUpdate.referredUserEmail,
      bonusAmount: referralToUpdate.bonusAmount,
    })

    toast({
      title: "Bonus Paid",
      description: `Bonus of $${referralToUpdate.bonusAmount} paid for referral ${referralId}.`,
    })
  }

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referrerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredUserEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || referral.status === statusFilter

    const matchesDate =
      !dateRange?.from ||
      (referral.timestamp >= dateRange.from && (!dateRange.to || referral.timestamp <= dateRange.to))

    return matchesSearch && matchesStatus && matchesDate
  })

  const totalReferrals = filteredReferrals.length
  const completedReferrals = filteredReferrals.filter(
    (r) => r.status === "deposited" || r.status === "bonus_paid",
  ).length
  const totalBonusPaid = filteredReferrals
    .filter((r) => r.status === "bonus_paid")
    .reduce((sum, r) => sum + r.bonusAmount, 0)
  const pendingBonus = filteredReferrals
    .filter((r) => r.status === "deposited" && r.bonusPaidAt === undefined)
    .reduce((sum, r) => sum + r.bonusAmount, 0)

  const getStatusBadge = (status: Referral["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "registered":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Registered
          </Badge>
        )
      case "deposited":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Deposited
          </Badge>
        )
      case "bonus_paid":
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            Bonus Paid
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" /> Referral Analytics
        </CardTitle>
        <CardDescription>Monitor and manage the platform's referral program.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Referrals</p>
            <p className="text-2xl font-bold">{totalReferrals}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Completed Referrals</p>
            <p className="text-2xl font-bold text-green-600">{completedReferrals}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Bonus Paid</p>
            <p className="text-2xl font-bold text-purple-600">${totalBonusPaid.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Pending Bonus Payouts</p>
            <p className="text-2xl font-bold text-yellow-600">${pendingBonus.toFixed(2)}</p>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by referrer/referred email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="deposited">Deposited</SelectItem>
              <SelectItem value="bonus_paid">Bonus Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker date={dateRange} setDate={setDateRange} className="w-full lg:w-auto" />
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Referrals Table */}
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Referral ID</TableHead>
                <TableHead className="min-w-[150px]">Referrer</TableHead>
                <TableHead className="min-w-[150px]">Referred User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead className="min-w-[120px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No referrals found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{referral.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{referral.referrerName}</div>
                      <div className="text-sm text-muted-foreground">{referral.referrerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{referral.referredUserName || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">{referral.referredUserEmail}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    <TableCell>
                      <div className="font-medium">${referral.bonusAmount.toFixed(2)}</div>
                      {referral.bonusPaidAt && (
                        <div className="text-xs text-muted-foreground">
                          Paid: {referral.bonusPaidAt.toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{referral.timestamp.toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{referral.timestamp.toLocaleTimeString()}</div>
                    </TableCell>
                    <TableCell>
                      {referral.status === "deposited" && !referral.bonusPaidAt && (
                        <Button size="sm" onClick={() => handleMarkBonusPaid(referral.id)}>
                          <DollarSign className="h-4 w-4 mr-1" /> Pay Bonus
                        </Button>
                      )}
                      {referral.status === "bonus_paid" && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" /> Paid
                        </Badge>
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
  )
}
