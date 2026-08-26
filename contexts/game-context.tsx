"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface GameStats {
  totalWins: number
  totalLosses: number
  currentWinStreak: number
  bestWinStreak: number
  totalWagered: number
  biggestWin: number
  highestBalance: number
  gamesThisWeek: number
  winsThisWeek: number
}

interface GameContextType {
  gameStats: GameStats
  updateGameStats: (updates: Partial<GameStats>) => void
  recordWin: (amount: number) => void
  recordLoss: (amount: number) => void
  recordWager: (amount: number) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameStats, setGameStats] = useState<GameStats>({
    totalWins: 0,
    totalLosses: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    totalWagered: 0,
    biggestWin: 0,
    highestBalance: 10,
    gamesThisWeek: 0,
    winsThisWeek: 0,
  })

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        const user = JSON.parse(userData)
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const userRecord = users.find((u: any) => u.id === user.id)

        if (userRecord?.gameStats) {
          setGameStats(userRecord.gameStats)
        }
      }
    } catch (error) {
      console.error("Error loading game stats:", error)
    }
  }, [])

  // Save stats to localStorage whenever they change
  useEffect(() => {
    try {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        const user = JSON.parse(userData)
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const updatedUsers = users.map((u: any) => {
          if (u.id === user.id) {
            return { ...u, gameStats }
          }
          return u
        })
        localStorage.setItem("users", JSON.stringify(updatedUsers))
      }
    } catch (error) {
      console.error("Error saving game stats:", error)
    }
  }, [gameStats])

  const updateGameStats = (updates: Partial<GameStats>) => {
    setGameStats((prev) => ({ ...prev, ...updates }))
  }

  const recordWin = (amount: number) => {
    setGameStats((prev) => ({
      ...prev,
      totalWins: prev.totalWins + 1,
      currentWinStreak: prev.currentWinStreak + 1,
      bestWinStreak: Math.max(prev.bestWinStreak, prev.currentWinStreak + 1),
      biggestWin: Math.max(prev.biggestWin, amount),
      winsThisWeek: prev.winsThisWeek + 1,
      gamesThisWeek: prev.gamesThisWeek + 1,
    }))
  }

  const recordLoss = (amount: number) => {
    setGameStats((prev) => ({
      ...prev,
      totalLosses: prev.totalLosses + 1,
      currentWinStreak: 0,
      gamesThisWeek: prev.gamesThisWeek + 1,
    }))
  }

  const recordWager = (amount: number) => {
    setGameStats((prev) => ({
      ...prev,
      totalWagered: prev.totalWagered + amount,
    }))
  }

  return (
    <GameContext.Provider
      value={{
        gameStats,
        updateGameStats,
        recordWin,
        recordLoss,
        recordWager,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
