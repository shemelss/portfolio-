"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Crown, Users } from "lucide-react"

interface LeaderboardEntry {
  userId: string
  userName: string
  totalReferrals: number
  totalBonusEarned: number
}

interface Referral {
  id: number
  email: string
  status: "pending" | "registered" | "deposited"
  timestamp: Date
  bonusPaid: boolean
}

interface User {
  id: string
  name: string
  email: string
  referralCode: string
  referrals?: Referral[]
}

interface ReferralLeaderboardProps {
  currentUserId?: string // Optional: to highlight the current user
}

const REFERRAL_BONUS_PER_DEPOSIT = 25 // Assuming this is the bonus per deposited referral

export default function ReferralLeaderboard({ currentUserId }: ReferralLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboardData()
  }, [])

  const loadLeaderboardData = () => {
    setLoading(true)
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]") as User[]

      const leaderboardMap = new Map<string, LeaderboardEntry>()

      storedUsers.forEach((user) => {
        let totalReferrals = 0
        let totalBonusEarned = 0

        if (user.referrals) {
          user.referrals.forEach((referral) => {
            totalReferrals++
            if (referral.status === "deposited" || referral.bonusPaid) {
              totalBonusEarned += REFERRAL_BONUS_PER_DEPOSIT
            }
          })
        }

        if (totalReferrals > 0) {
          leaderboardMap.set(user.id, {
            userId: user.id,
            userName: user.name,
            totalReferrals,
            totalBonusEarned,
          })
        }
      })

      const sortedLeaderboard = Array.from(leaderboardMap.values()).sort((a, b) => {
        // Sort primarily by totalBonusEarned, then by totalReferrals
        if (b.totalBonusEarned !== a.totalBonusEarned) {
          return b.totalBonusEarned - a.totalBonusEarned
        }
        return b.totalReferrals - a.totalReferrals
      })

      setLeaderboard(sortedLeaderboard)
    } catch (error) {
      console.error("Error loading leaderboard data:", error)
      // Optionally show a toast error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" /> Referral Leaderboard
        </CardTitle>
        <CardDescription>Top players by successful referrals and earned bonuses.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mb-4" />
            <p>No referral activity yet.</p>
            <p className="text-sm">Be the first to invite friends and climb the ranks!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead className="min-w-[150px]">Player</TableHead>
                  <TableHead className="text-right">Referrals</TableHead>
                  <TableHead className="text-right">Bonus Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <TableRow key={entry.userId} className={entry.userId === currentUserId ? "bg-blue-50/20" : ""}>
                    <TableCell className="font-medium">
                      {index === 0 && <Crown className="h-5 w-5 text-yellow-500 inline-block mr-1" />}
                      {index === 1 && <Trophy className="h-5 w-5 text-gray-400 inline-block mr-1" />}
                      {index === 2 && <Trophy className="h-5 w-5 text-orange-400 inline-block mr-1" />}
                      {index >= 3 ? index + 1 : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {entry.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{entry.totalReferrals}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      ${entry.totalBonusEarned.toFixed(2)}
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
