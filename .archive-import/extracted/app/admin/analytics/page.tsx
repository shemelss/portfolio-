"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  LineChart,
  PieChart,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Gift,
  Shield,
  AlertTriangle,
} from "lucide-react"
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Pie,
  Cell,
} from "recharts"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { useSecurityMonitoring } from "@/contexts/security-monitoring-context"
import AdminActivityDashboard from "@/components/admin-activity-dashboard"
import SecurityAnomalyDashboard from "@/components/security-anomaly-dashboard"
import AuditDashboard from "@/components/audit-dashboard"
import AdminReferralAnalytics from "@/components/admin-referral-analytics"

interface User {
  id: string
  name: string
  email: string
  registeredAt: string
  totalDeposits: number
  totalWithdrawals: number
  gamesPlayed: number
  winnings: number
  losses: number
  balance: number
  role: string
}

interface Transaction {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "bonus" | "game_win" | "game_loss"
  amount: number
  timestamp: Date
  status: string
}

interface AdminAnalyticsProps {
  adminUserData: any // Current logged-in admin user data
}

export default function AdminAnalyticsPage({ adminUserData }: AdminAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date(),
  })

  const { getCriticalAnomalies } = useSecurityMonitoring()
  const criticalAnomalies = getCriticalAnomalies()

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = () => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
      setUsers(storedUsers)

      const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]").map((tx: any) => ({
        ...tx,
        timestamp: new Date(tx.timestamp),
      }))

      const filteredTransactions = storedTransactions.filter((tx: Transaction) => {
        if (!dateRange?.from) return true
        const txDate = new Date(tx.timestamp)
        return txDate >= dateRange.from && (!dateRange.to || txDate <= dateRange.to)
      })
      setTransactions(filteredTransactions)
    } catch (error) {
      console.error("Error loading analytics data:", error)
    }
  }

  // Dashboard Overview Stats
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "active").length
  const newUsersThisPeriod = users.filter((u) => {
    const registeredDate = new Date(u.registeredAt)
    return registeredDate >= (dateRange?.from || new Date(0)) && registeredDate <= (dateRange?.to || new Date())
  }).length

  const totalDeposits = transactions
    .filter((tx) => tx.type === "deposit" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const totalWithdrawals = transactions
    .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const netRevenue = totalDeposits - totalWithdrawals

  const totalGamesPlayed = users.reduce((sum, user) => sum + user.gamesPlayed, 0)
  const totalWinnings = users.reduce((sum, user) => sum + user.winnings, 0)
  const totalLosses = users.reduce((sum, user) => sum + user.losses, 0)

  // Data for charts
  const getDailyData = (data: any[], dateKey: string, valueKey: string, typeFilter?: string) => {
    const dailyMap = new Map<string, number>()
    data.forEach((item) => {
      if (typeFilter && item.type !== typeFilter) return
      const date = new Date(item[dateKey]).toISOString().split("T")[0]
      dailyMap.set(date, (dailyMap.get(date) || 0) + item[valueKey])
    })
    return Array.from(dailyMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, value]) => ({ date, value }))
  }

  const userRegistrationData = getDailyData(users, "registeredAt", "id") // Just count registrations
  const depositData = getDailyData(transactions, "timestamp", "amount", "deposit")
  const withdrawalData = getDailyData(transactions, "timestamp", "amount", "withdrawal")

  const userRoleDistribution = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const rolePieData = Object.entries(userRoleDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold">Admin Analytics</h1>
            {criticalAnomalies.length > 0 && (
              <div className="gap-1 bg-destructive text-destructive-foreground rounded px-2 py-1">
                <AlertTriangle className="h-3 w-3" />
                {criticalAnomalies.length} Critical Alert{criticalAnomalies.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <p className="text-muted-foreground">Comprehensive insights into platform performance and user behavior.</p>
        </div>
        <div className="w-full md:w-auto">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="referrals" className="gap-2">
            <Gift className="h-4 w-4" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security & Audit
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">+{newUsersThisPeriod} new this period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {((activeUsers / totalUsers) * 100 || 0).toFixed(1)}% active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalDeposits.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">in selected period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${netRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Deposits - Withdrawals</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registrations Over Time</CardTitle>
                <CardDescription>New user sign-ups per day.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userRegistrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by their assigned roles.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rolePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {rolePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Daily user engagement and activity trends.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userRegistrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" name="Active Users" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* More user-specific analytics components can go here */}
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposit & Withdrawal Trends</CardTitle>
              <CardDescription>Daily financial flow on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={depositData.concat(withdrawalData).sort((a, b) => a.date.localeCompare(b.date))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="Deposits" />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Withdrawals" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* More financial analytics components can go here */}
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6 pt-4">
          <AdminReferralAnalytics adminUserData={adminUserData} />
        </TabsContent>

        {/* Security & Audit Tab */}
        <TabsContent value="security" className="space-y-6 pt-4">
          <SecurityAnomalyDashboard />
          <AdminActivityDashboard />
          <AuditDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
