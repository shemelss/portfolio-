"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import { toast } from "@/hooks/use-toast"

interface JackpotContextType {
  jackpotAmount: number
  contributeToJackpot: (betAmount: number) => void
  resetJackpot: () => void
  awardJackpot: (userId: string, userName: string, amount: number) => void
}

const JackpotContext = createContext<JackpotContextType | undefined>(undefined)

export const useJackpot = () => {
  const context = useContext(JackpotContext)
  if (!context) {
    throw new Error("useJackpot must be used within a JackpotProvider")
  }
  return context
}

export const JackpotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auditLogger = useAuditLogger()

  // Initial jackpot amount and contribution rate
  const INITIAL_JACKPOT = 1000 // Starting jackpot amount
  const CONTRIBUTION_RATE = 0.005 // 0.5% of each bet contributes to the jackpot

  const [jackpotAmount, setJackpotAmount] = useState<number>(() => {
    try {
      const storedJackpot = localStorage.getItem("progressiveJackpot")
      return storedJackpot ? Number.parseFloat(storedJackpot) : INITIAL_JACKPOT
    } catch (error) {
      console.error("Error loading jackpot from localStorage:", error)
      return INITIAL_JACKPOT
    }
  })

  // Save jackpot to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("progressiveJackpot", jackpotAmount.toFixed(2))
    } catch (error) {
      console.error("Error saving jackpot to localStorage:", error)
    }
  }, [jackpotAmount])

  const contributeToJackpot = useCallback(
    (betAmount: number) => {
      const contribution = betAmount * CONTRIBUTION_RATE
      setJackpotAmount((prevJackpot) => prevJackpot + contribution)

      auditLogger.logGameAction("Jackpot Contribution", "Blackjack", {
        contribution: contribution.toFixed(2),
        newJackpotAmount: (jackpotAmount + contribution).toFixed(2),
      })
    },
    [auditLogger],
  )

  const resetJackpot = useCallback(() => {
    const oldJackpot = jackpotAmount
    setJackpotAmount(INITIAL_JACKPOT)

    auditLogger.logGameAction("Jackpot Reset", "Blackjack", {
      oldJackpotAmount: oldJackpot.toFixed(2),
      newJackpotAmount: INITIAL_JACKPOT.toFixed(2),
    })
  }, [jackpotAmount, auditLogger])

  const awardJackpot = useCallback(
    (userId: string, userName: string, amount: number) => {
      // Update user balance in localStorage
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const updatedUsers = users.map((u: any) => {
          if (u.id === userId) {
            return { ...u, balance: (u.balance || 0) + amount }
          }
          return u
        })
        localStorage.setItem("users", JSON.stringify(updatedUsers))

        // Also update current user in localStorage if it's the winning user
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
        if (currentUser.id === userId) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({ ...currentUser, balance: (currentUser.balance || 0) + amount }),
          )
        }

        toast({
          title: "🎉 JACKPOT WON! 🎉",
          description: `Congratulations ${userName}! You won the progressive jackpot of $${amount.toFixed(2)}!`,
          duration: 9000,
        })

        auditLogger.logGameAction("Jackpot Awarded", "Blackjack", {
          userId,
          userName,
          amount: amount.toFixed(2),
          balanceAfter: (users.find((u: any) => u.id === userId)?.balance || 0) + amount,
        })
      } catch (error) {
        console.error("Error awarding jackpot:", error)
        toast({
          title: "Jackpot Award Error",
          description: "There was an error awarding the jackpot. Please contact support.",
          variant: "destructive",
        })
      }
    },
    [auditLogger],
  )

  const value: JackpotContextType = {
    jackpotAmount,
    contributeToJackpot,
    resetJackpot,
    awardJackpot,
  }

  return <JackpotContext.Provider value={value}>{children}</JackpotContext.Provider>
}
