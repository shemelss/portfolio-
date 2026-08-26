"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { generateId } from "@/lib/id" // Import our custom ID generator

export type AdminActionType =
  | "user_role_change"
  | "login"
  | "logout"
  | "settings_change"
  | "user_ban"
  | "user_unban"
  | "game_settings_change"
  | "referral_settings_change"
  | "system_maintenance"
  | "security_alert"

export interface AdminAction {
  id: string
  type: AdminActionType
  description: string
  adminId: string
  adminName: string
  timestamp: Date
  details: Record<string, any>
  severity: "low" | "medium" | "high"
}

interface AdminActivityContextType {
  actions: AdminAction[]
  logAction: (action: Omit<AdminAction, "id" | "timestamp">) => void
  clearActions: () => void
  getActionsByType: (type: AdminActionType) => AdminAction[]
  getActionsByAdmin: (adminId: string) => AdminAction[]
  getRecentActions: (count: number) => AdminAction[]
}

const AdminActivityContext = createContext<AdminActivityContextType | undefined>(undefined)

export const useAdminActivity = () => {
  const context = useContext(AdminActivityContext)
  if (!context) {
    throw new Error("useAdminActivity must be used within an AdminActivityProvider")
  }
  return context
}

export const AdminActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<AdminAction[]>([])

  // Load actions from localStorage on mount
  useEffect(() => {
    try {
      const savedActions = localStorage.getItem("adminActions")
      if (savedActions) {
        const parsedActions = JSON.parse(savedActions).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }))
        setActions(parsedActions)
      }
    } catch (error) {
      console.error("Error loading admin actions:", error)
    }
  }, [])

  // Save actions to localStorage whenever they change
  useEffect(() => {
    if (actions.length === 0) return

    try {
      localStorage.setItem("adminActions", JSON.stringify(actions))
    } catch (error) {
      console.error("Error saving admin actions:", error)
    }
  }, [actions])

  const logAction = useCallback((action: Omit<AdminAction, "id" | "timestamp">) => {
    const newAction: AdminAction = {
      ...action,
      id: generateId(), // Use generateId
      timestamp: new Date(),
    }
    setActions((prev) => [newAction, ...prev])
  }, [])

  const clearActions = useCallback(() => {
    setActions([])
  }, [])

  const getActionsByType = useCallback(
    (type: AdminActionType) => {
      return actions.filter((action) => action.type === type)
    },
    [actions],
  )

  const getActionsByAdmin = useCallback(
    (adminId: string) => {
      return actions.filter((action) => action.adminId === adminId)
    },
    [actions],
  )

  const getRecentActions = useCallback(
    (count: number) => {
      return actions.slice(0, count)
    },
    [actions],
  )

  return (
    <AdminActivityContext.Provider
      value={{
        actions,
        logAction,
        clearActions,
        getActionsByType,
        getActionsByAdmin,
        getRecentActions,
      }}
    >
      {children}
    </AdminActivityContext.Provider>
  )
}
