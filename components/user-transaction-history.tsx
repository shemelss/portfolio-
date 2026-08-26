"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History, DollarSign, TrendingUp, TrendingDown, Gamepad2, Gift } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "bonus" | "referral" | "game_win" | "game_loss"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled" | "processing"
  method: string
  timestamp: Date
  completedAt?: Date
  details?: Record<string, any>
}

interface UserTransactionHistoryProps {
  userId: string
}

export default function UserTransactionHistory({ userId }: UserTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [userId])

  const loadTransactions = () => {
    setLoading(true)
    setError(null)
    try {
      const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]") as Transaction[]
      const userTransactions = storedTransactions
        .filter((tx) => tx.userId === userId)
        .map((tx) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
          completedAt: tx.completedAt ? new Date(tx.completedAt) : undefined,
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by newest first

      setTransactions(userTransactions)
    } catch (e) {
      console.error("Failed to load transactions from local storage", e)
      setError("Failed to load transaction history.")
      toast({
        title: "Error",
        description: "Could not load your transaction history.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "withdrawal":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "game_win":
        return <Gamepad2 className="h-4 w-4 text-green-500" />
      case "game_loss":
        return <Gamepad2 className="h-4 w-4 text-red-500" />
      case "bonus":
      case "referral":
        return <Gift className="h-4 w-4 text-yellow-500" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" /> Transaction History
        </CardTitle>
        <CardDescription>A complete record of all your financial activities and game results.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mb-4" />
            <p>No transactions found.</p>
            <p className="text-sm">Start playing or make a deposit to see your history here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[120px]">Method</TableHead>
                  <TableHead className="min-w-[150px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(tx.type)}
                        <span className="capitalize">{tx.type.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          tx.type === "deposit" || tx.type === "game_win" || tx.type === "bonus"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "deposit" || tx.type === "game_win" || tx.type === "bonus" ? "+" : "-"}
                        {tx.amount.toFixed(2)} {tx.currency}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>{tx.method || "N/A"}</TableCell>
                    <TableCell>
                      <div className="text-sm">{tx.timestamp.toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{tx.timestamp.toLocaleTimeString()}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
