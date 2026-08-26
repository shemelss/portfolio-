"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

interface GameSettings {
  minBet: number
  maxBet: number
  blackjackPayout: number
  dealerStandsOnSoft17: boolean
  maxPlayers: number
  gameSpeed: "slow" | "medium" | "fast"
  maintenanceMode: boolean
}

const DEFAULT_GAME_SETTINGS: GameSettings = {
  minBet: 5,
  maxBet: 500,
  blackjackPayout: 1.5, // 3:2 payout
  dealerStandsOnSoft17: true,
  maxPlayers: 7,
  gameSpeed: "medium",
  maintenanceMode: false,
}

export function useAdminGameSettings() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate fetching settings from a backend or local storage
    const fetchSettings = () => {
      try {
        const storedSettings = localStorage.getItem("adminGameSettings")
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings))
        }
      } catch (e) {
        console.error("Failed to load admin game settings from local storage", e)
        setError("Failed to load settings.")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      try {
        localStorage.setItem("adminGameSettings", JSON.stringify(updated))
        toast({
          title: "Settings Updated",
          description: "Game settings saved successfully.",
        })
      } catch (e) {
        console.error("Failed to save admin game settings to local storage", e)
        setError("Failed to save settings.")
        toast({
          title: "Error",
          description: "Failed to save game settings.",
          variant: "destructive",
        })
      }
      return updated
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_GAME_SETTINGS)
    try {
      localStorage.removeItem("adminGameSettings")
      toast({
        title: "Settings Reset",
        description: "Game settings reset to defaults.",
      })
    } catch (e) {
      console.error("Failed to reset admin game settings in local storage", e)
      setError("Failed to reset settings.")
      toast({
        title: "Error",
        description: "Failed to reset game settings.",
        variant: "destructive",
      })
    }
  }, [])

  return { settings, loading, error, updateSettings, resetSettings }
}
