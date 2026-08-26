"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  DollarSign,
  Calendar,
  Zap,
  Star,
  Crown,
} from "lucide-react"

interface GameStatsProps {
  userData: any
}

export default function GameStats({ userData }: GameStatsProps) {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    winRate: 0,
    currentBalance: 0,
    highestBalance: 0,
    totalWagered: 0,
    biggestWin: 0,
    winStreak: 0,
    bestWinStreak: 0,
    gamesThisWeek: 0,
    winsThisWeek: 0,
  })

  useEffect(() => {
    // Load user stats from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.id === userData?.id)

    if (user) {
      const gameStats = user.gameStats || {}
      const totalGames = (gameStats.totalWins || 0) + (gameStats.totalLosses || 0)
      const winRate = totalGames > 0 ? ((gameStats.totalWins || 0) / totalGames) * 100 : 0

      setStats({
        totalGames,
        totalWins: gameStats.totalWins || 0,
        totalLosses: gameStats.totalLosses || 0,
        winRate,
        currentBalance: user.balance || 10,
        highestBalance: gameStats.highestBalance || user.balance || 10,
        totalWagered: gameStats.totalWagered || 0,
        biggestWin: gameStats.biggestWin || 0,
        winStreak: gameStats.currentWinStreak || 0,
        bestWinStreak: gameStats.bestWinStreak || 0,
        gamesThisWeek: gameStats.gamesThisWeek || 0,
        winsThisWeek: gameStats.winsThisWeek || 0,
      })
    }
  }, [userData])

  const getWinRateColor = (rate: number) => {
    if (rate >= 60) return "text-green-600"
    if (rate >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = () => {
    if (stats.winRate >= 70) return { text: "Excellent", color: "bg-green-600" }
    if (stats.winRate >= 60) return { text: "Great", color: "bg-blue-600" }
    if (stats.winRate >= 50) return { text: "Good", color: "bg-yellow-600" }
    if (stats.winRate >= 40) return { text: "Fair", color: "bg-orange-600" }
    return { text: "Needs Improvement", color: "bg-red-600" }
  }

  const performance = getPerformanceBadge()

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Game Statistics</h1>
        <p className="text-white/70">Track your blackjack performance and progress</p>
        <Badge className={`mt-2 ${performance.color} text-white`}>{performance.text} Player</Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Total Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalGames}</div>
            <p className="text-white/70 text-sm">Games played</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getWinRateColor(stats.winRate)}`}>{stats.winRate.toFixed(1)}%</div>
            <Progress value={stats.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">${stats.currentBalance}</div>
            <p className="text-white/70 text-sm">Available funds</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              Win Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{stats.winStreak}</div>
            <p className="text-white/70 text-sm">Current streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Performance Metrics
            </CardTitle>
            <CardDescription className="text-white/70">Your gaming performance breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/90">Total Wins</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-bold">{stats.totalWins}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/90">Total Losses</span>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-bold">{stats.totalLosses}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/90">Biggest Win</span>
              <span className="text-yellow-400 font-bold">${stats.biggestWin}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/90">Best Win Streak</span>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{stats.bestWinStreak}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/90">Total Wagered</span>
              <span className="text-blue-400 font-bold">${stats.totalWagered}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/90">Highest Balance</span>
              <span className="text-green-400 font-bold">${stats.highestBalance}</span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              This Week's Performance
            </CardTitle>
            <CardDescription className="text-white/70">Your recent gaming activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.gamesThisWeek}</div>
              <p className="text-white/70">Games This Week</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">{stats.winsThisWeek}</div>
              <p className="text-white/70">Wins This Week</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {stats.gamesThisWeek > 0 ? ((stats.winsThisWeek / stats.gamesThisWeek) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-white/70">Weekly Win Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Progress */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Achievement Progress
          </CardTitle>
          <CardDescription className="text-white/70">Track your progress towards achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/90">First 10 Wins</span>
              <span className="text-yellow-400">{Math.min(stats.totalWins, 10)}/10</span>
            </div>
            <Progress value={(Math.min(stats.totalWins, 10) / 10) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/90">Win Streak Master (5 in a row)</span>
              <span className="text-yellow-400">{Math.min(stats.bestWinStreak, 5)}/5</span>
            </div>
            <Progress value={(Math.min(stats.bestWinStreak, 5) / 5) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/90">High Roller ($1000 balance)</span>
              <span className="text-yellow-400">${Math.min(stats.highestBalance, 1000)}/1000</span>
            </div>
            <Progress value={(Math.min(stats.highestBalance, 1000) / 1000) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
