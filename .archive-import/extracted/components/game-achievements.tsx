"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Crown, Target, Zap, Gift, Lock, CheckCircle } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  requirement: number
  current: number
  completed: boolean
  reward: number
  category: "wins" | "streak" | "balance" | "special"
}

interface GameAchievementsProps {
  userData: any
}

export default function GameAchievements({ userData }: GameAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    // Load user stats from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.id === userData?.id)

    if (user) {
      const totalWins = user.totalWins || 0
      const gameStats = user.gameStats || {}
      const bestWinStreak = gameStats.bestWinStreak || 0
      const highestBalance = gameStats.highestBalance || user.balance || 10
      const totalGames = (gameStats.totalWins || 0) + (gameStats.totalLosses || 0)

      const achievementList: Achievement[] = [
        // Win-based achievements
        {
          id: "first_win",
          title: "First Victory",
          description: "Win your first game of blackjack",
          icon: <Star className="h-6 w-6 text-yellow-500" />,
          requirement: 1,
          current: totalWins,
          completed: totalWins >= 1,
          reward: 10,
          category: "wins",
        },
        {
          id: "five_wins",
          title: "Getting Started",
          description: "Win 5 games of blackjack",
          icon: <Trophy className="h-6 w-6 text-blue-500" />,
          requirement: 5,
          current: totalWins,
          completed: totalWins >= 5,
          reward: 25,
          category: "wins",
        },
        {
          id: "ten_wins",
          title: "Experienced Player",
          description: "Win 10 games of blackjack",
          icon: <Target className="h-6 w-6 text-green-500" />,
          requirement: 10,
          current: totalWins,
          completed: totalWins >= 10,
          reward: 50,
          category: "wins",
        },
        {
          id: "twenty_five_wins",
          title: "Blackjack Veteran",
          description: "Win 25 games of blackjack",
          icon: <Crown className="h-6 w-6 text-purple-500" />,
          requirement: 25,
          current: totalWins,
          completed: totalWins >= 25,
          reward: 100,
          category: "wins",
        },

        // Streak-based achievements
        {
          id: "three_streak",
          title: "Hot Streak",
          description: "Win 3 games in a row",
          icon: <Zap className="h-6 w-6 text-orange-500" />,
          requirement: 3,
          current: bestWinStreak,
          completed: bestWinStreak >= 3,
          reward: 30,
          category: "streak",
        },
        {
          id: "five_streak",
          title: "On Fire",
          description: "Win 5 games in a row",
          icon: <Zap className="h-6 w-6 text-red-500" />,
          requirement: 5,
          current: bestWinStreak,
          completed: bestWinStreak >= 5,
          reward: 75,
          category: "streak",
        },
        {
          id: "ten_streak",
          title: "Unstoppable",
          description: "Win 10 games in a row",
          icon: <Crown className="h-6 w-6 text-gold-500" />,
          requirement: 10,
          current: bestWinStreak,
          completed: bestWinStreak >= 10,
          reward: 200,
          category: "streak",
        },

        // Balance-based achievements
        {
          id: "hundred_balance",
          title: "Growing Wealth",
          description: "Reach a balance of $100",
          icon: <Gift className="h-6 w-6 text-green-500" />,
          requirement: 100,
          current: highestBalance,
          completed: highestBalance >= 100,
          reward: 20,
          category: "balance",
        },
        {
          id: "five_hundred_balance",
          title: "High Roller",
          description: "Reach a balance of $500",
          icon: <Crown className="h-6 w-6 text-blue-500" />,
          requirement: 500,
          current: highestBalance,
          completed: highestBalance >= 500,
          reward: 100,
          category: "balance",
        },
        {
          id: "thousand_balance",
          title: "Millionaire Mindset",
          description: "Reach a balance of $1000",
          icon: <Crown className="h-6 w-6 text-purple-500" />,
          requirement: 1000,
          current: highestBalance,
          completed: highestBalance >= 1000,
          reward: 250,
          category: "balance",
        },

        // Special achievements
        {
          id: "first_day",
          title: "Welcome Player",
          description: "Play your first game",
          icon: <Star className="h-6 w-6 text-blue-500" />,
          requirement: 1,
          current: totalGames,
          completed: totalGames >= 1,
          reward: 5,
          category: "special",
        },
        {
          id: "dedicated_player",
          title: "Dedicated Player",
          description: "Play 50 games total",
          icon: <Trophy className="h-6 w-6 text-orange-500" />,
          requirement: 50,
          current: totalGames,
          completed: totalGames >= 50,
          reward: 150,
          category: "special",
        },
      ]

      setAchievements(achievementList)
      setCompletedCount(achievementList.filter((a) => a.completed).length)
    }
  }, [userData])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "wins":
        return <Trophy className="h-4 w-4" />
      case "streak":
        return <Zap className="h-4 w-4" />
      case "balance":
        return <Gift className="h-4 w-4" />
      case "special":
        return <Star className="h-4 w-4" />
      default:
        return <Trophy className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "wins":
        return "bg-blue-600"
      case "streak":
        return "bg-orange-600"
      case "balance":
        return "bg-green-600"
      case "special":
        return "bg-purple-600"
      default:
        return "bg-gray-600"
    }
  }

  const categories = ["wins", "streak", "balance", "special"]

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-white/70">Unlock rewards by completing challenges</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            {completedCount}/{achievements.length} Completed
          </Badge>
          <Progress value={(completedCount / achievements.length) * 100} className="w-32" />
        </div>
      </div>

      {/* Achievement Categories */}
      {categories.map((category) => {
        const categoryAchievements = achievements.filter((a) => a.category === category)
        const categoryCompleted = categoryAchievements.filter((a) => a.completed).length

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`${getCategoryColor(category)} text-white gap-1`}>
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
              <span className="text-white/70">
                {categoryCompleted}/{categoryAchievements.length} completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 ${
                    achievement.completed
                      ? "ring-2 ring-green-500/50 bg-green-500/10"
                      : "hover:bg-white/15 hover:scale-105"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {achievement.completed ? (
                          <div className="relative">
                            {achievement.icon}
                            <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="opacity-50">{achievement.icon}</div>
                        )}
                        <div>
                          <CardTitle className="text-white text-lg">{achievement.title}</CardTitle>
                          <CardDescription className="text-white/70 text-sm">{achievement.description}</CardDescription>
                        </div>
                      </div>
                      {achievement.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Lock className="h-6 w-6 text-white/30" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Progress</span>
                          <span className="text-white">
                            {Math.min(achievement.current, achievement.requirement)}/{achievement.requirement}
                          </span>
                        </div>
                        <Progress
                          value={
                            (Math.min(achievement.current, achievement.requirement) / achievement.requirement) * 100
                          }
                          className="h-2"
                        />
                      </div>

                      {/* Reward */}
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Reward</span>
                        <Badge
                          variant="outline"
                          className={`${
                            achievement.completed
                              ? "bg-green-600 text-white border-green-500"
                              : "bg-yellow-600 text-white border-yellow-500"
                          }`}
                        >
                          ${achievement.reward}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Summary Stats */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{completedCount}</div>
              <p className="text-white/70 text-sm">Completed</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{achievements.length - completedCount}</div>
              <p className="text-white/70 text-sm">Remaining</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                ${achievements.filter((a) => a.completed).reduce((sum, a) => sum + a.reward, 0)}
              </div>
              <p className="text-white/70 text-sm">Earned Rewards</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {((completedCount / achievements.length) * 100).toFixed(0)}%
              </div>
              <p className="text-white/70 text-sm">Completion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
