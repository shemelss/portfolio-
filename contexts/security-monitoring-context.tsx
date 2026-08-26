"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useAdminActivity, type AdminAction } from "./admin-activity-context"

export interface SecurityAnomaly {
  id: string
  type:
    | "suspicious_login"
    | "unusual_activity"
    | "privilege_escalation"
    | "bulk_operations"
    | "off_hours_access"
    | "rapid_actions"
    | "failed_attempts"
    | "location_anomaly"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  adminId: string
  adminName: string
  timestamp: Date
  details: Record<string, any>
  status: "active" | "investigating" | "resolved" | "false_positive"
  relatedActions: string[] // Action IDs
}

export interface AdminBehaviorProfile {
  adminId: string
  adminName: string
  normalHours: { start: number; end: number } // 0-23 hours
  averageActionsPerHour: number
  commonActionTypes: string[]
  lastLoginTime: Date
  totalActions: number
  riskScore: number // 0-100
}

interface SecurityMonitoringContextType {
  anomalies: SecurityAnomaly[]
  profiles: AdminBehaviorProfile[]
  addAnomaly: (anomaly: Omit<SecurityAnomaly, "id" | "timestamp">) => void
  updateAnomalyStatus: (id: string, status: SecurityAnomaly["status"]) => void
  getActiveAnomalies: () => SecurityAnomaly[]
  getCriticalAnomalies: () => SecurityAnomaly[]
  getAdminRiskScore: (adminId: string) => number
  analyzeAdminBehavior: (adminId: string) => void
}

const SecurityMonitoringContext = createContext<SecurityMonitoringContextType | undefined>(undefined)

export const useSecurityMonitoring = () => {
  const context = useContext(SecurityMonitoringContext)
  if (!context) {
    throw new Error("useSecurityMonitoring must be used within a SecurityMonitoringProvider")
  }
  return context
}

export const SecurityMonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anomalies, setAnomalies] = useState<SecurityAnomaly[]>([])
  const [profiles, setProfiles] = useState<AdminBehaviorProfile[]>([])
  const { actions } = useAdminActivity()
  const analysisInProgress = useRef(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedAnomalies = localStorage.getItem("securityAnomalies")
      const savedProfiles = localStorage.getItem("adminProfiles")

      if (savedAnomalies) {
        const parsedAnomalies = JSON.parse(savedAnomalies).map((anomaly: any) => ({
          ...anomaly,
          timestamp: new Date(anomaly.timestamp),
        }))
        setAnomalies(parsedAnomalies)
      }

      if (savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles).map((profile: any) => ({
          ...profile,
          lastLoginTime: new Date(profile.lastLoginTime),
        }))
        setProfiles(parsedProfiles)
      }
    } catch (error) {
      console.error("Error loading security data:", error)
    }
  }, [])

  // Save data to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("securityAnomalies", JSON.stringify(anomalies))
    } catch (error) {
      console.error("Error saving anomalies:", error)
    }
  }, [anomalies])

  useEffect(() => {
    try {
      localStorage.setItem("adminProfiles", JSON.stringify(profiles))
    } catch (error) {
      console.error("Error saving profiles:", error)
    }
  }, [profiles])

  // Analyze behavior patterns when actions change
  useEffect(() => {
    if (actions.length > 0) {
      // Debounce the analysis to prevent excessive calls
      const timeoutId = setTimeout(() => {
        analyzeRecentActivity()
        updateAdminProfiles()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [actions.length]) // Only trigger when actions length changes, not the entire array

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addAnomaly = (anomaly: Omit<SecurityAnomaly, "id" | "timestamp">) => {
    const newAnomaly: SecurityAnomaly = {
      ...anomaly,
      id: generateId(),
      timestamp: new Date(),
    }
    setAnomalies((prev) => [newAnomaly, ...prev])
  }

  const updateAnomalyStatus = (id: string, status: SecurityAnomaly["status"]) => {
    setAnomalies((prev) => prev.map((anomaly) => (anomaly.id === id ? { ...anomaly, status } : anomaly)))
  }

  const getActiveAnomalies = () => {
    return anomalies.filter((anomaly) => anomaly.status === "active")
  }

  const getCriticalAnomalies = () => {
    return anomalies.filter((anomaly) => anomaly.severity === "critical" && anomaly.status === "active")
  }

  const getAdminRiskScore = (adminId: string) => {
    const profile = profiles.find((p) => p.adminId === adminId)
    return profile?.riskScore || 0
  }

  const updateAdminProfiles = () => {
    const adminIds = [...new Set(actions.map((action) => action.adminId))]

    adminIds.forEach((adminId) => {
      const adminActions = actions.filter((action) => action.adminId === adminId)
      if (adminActions.length === 0) return

      const adminName = adminActions[0].adminName
      const profile = calculateAdminProfile(adminId, adminName, adminActions)

      setProfiles((prev) => {
        const existingIndex = prev.findIndex((p) => p.adminId === adminId)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = profile
          return updated
        } else {
          return [...prev, profile]
        }
      })
    })
  }

  const calculateAdminProfile = (
    adminId: string,
    adminName: string,
    adminActions: AdminAction[],
  ): AdminBehaviorProfile => {
    const hours = adminActions.map((action) => new Date(action.timestamp).getHours())
    const actionTypes = adminActions.map((action) => action.type)

    // Calculate normal working hours (most common hours)
    const hourCounts = hours.reduce(
      (acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const sortedHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => Number.parseInt(hour))

    const normalStart = Math.min(...sortedHours.slice(0, 3))
    const normalEnd = Math.max(...sortedHours.slice(0, 3))

    // Calculate common action types
    const typeCounts = actionTypes.reduce(
      (acc, type) => {
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const commonTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type)

    // Calculate risk score
    const riskScore = calculateRiskScore(adminActions)

    return {
      adminId,
      adminName,
      normalHours: { start: normalStart, end: normalEnd },
      averageActionsPerHour: adminActions.length / 24, // Simplified calculation
      commonActionTypes: commonTypes,
      lastLoginTime: new Date(Math.max(...adminActions.map((a) => new Date(a.timestamp).getTime()))),
      totalActions: adminActions.length,
      riskScore,
    }
  }

  const calculateRiskScore = (adminActions: AdminAction[]): number => {
    let score = 0

    // High-risk action types
    const highRiskActions = adminActions.filter((action) =>
      ["user_ban", "user_role_change", "security_alert"].includes(action.type),
    )
    score += highRiskActions.length * 10

    // Off-hours activity
    const offHoursActions = adminActions.filter((action) => {
      const hour = new Date(action.timestamp).getHours()
      return hour < 6 || hour > 22
    })
    score += offHoursActions.length * 5

    // Rapid actions (more than 10 actions in an hour)
    const actionsByHour = adminActions.reduce(
      (acc, action) => {
        const hourKey = new Date(action.timestamp).toISOString().slice(0, 13)
        acc[hourKey] = (acc[hourKey] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const rapidHours = Object.values(actionsByHour).filter((count) => count > 10)
    score += rapidHours.length * 15

    return Math.min(score, 100) // Cap at 100
  }

  const analyzeRecentActivity = () => {
    if (analysisInProgress.current) return
    analysisInProgress.current = true

    try {
      const recentActions = actions.slice(0, 50)
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

      // Group actions by admin
      const actionsByAdmin = recentActions.reduce(
        (acc, action) => {
          if (!acc[action.adminId]) {
            acc[action.adminId] = []
          }
          acc[action.adminId].push(action)
          return acc
        },
        {} as Record<string, AdminAction[]>,
      )

      Object.entries(actionsByAdmin).forEach(([adminId, adminActions]) => {
        const adminName = adminActions[0].adminName

        // Check if we already have recent anomalies for this admin to prevent duplicates
        const existingAnomalies = anomalies.filter((a) => a.adminId === adminId && new Date(a.timestamp) > oneHourAgo)

        // Check for rapid actions
        const recentActionsInHour = adminActions.filter((action) => new Date(action.timestamp) > oneHourAgo)

        if (recentActionsInHour.length > 15 && !existingAnomalies.some((a) => a.type === "rapid_actions")) {
          addAnomaly({
            type: "rapid_actions",
            severity: "high",
            title: "Rapid Action Sequence Detected",
            description: `Admin ${adminName} performed ${recentActionsInHour.length} actions in the last hour`,
            adminId,
            adminName,
            status: "active",
            relatedActions: recentActionsInHour.map((a) => a.id),
            details: {
              actionCount: recentActionsInHour.length,
              timeWindow: "1 hour",
              actionTypes: [...new Set(recentActionsInHour.map((a) => a.type))],
            },
          })
        }

        // Check for off-hours access
        const offHoursActions = adminActions.filter((action) => {
          const hour = new Date(action.timestamp).getHours()
          return hour < 6 || hour > 22
        })

        if (offHoursActions.length > 3 && !existingAnomalies.some((a) => a.type === "off_hours_access")) {
          addAnomaly({
            type: "off_hours_access",
            severity: "medium",
            title: "Off-Hours Activity Detected",
            description: `Admin ${adminName} has been active during unusual hours`,
            adminId,
            adminName,
            status: "active",
            relatedActions: offHoursActions.map((a) => a.id),
            details: {
              offHoursCount: offHoursActions.length,
              hours: offHoursActions.map((a) => new Date(a.timestamp).getHours()),
            },
          })
        }

        // Check for bulk operations
        const bulkOperations = adminActions.filter(
          (action) => action.type === "user_role_change" || action.type === "user_ban",
        )

        if (bulkOperations.length > 5 && !existingAnomalies.some((a) => a.type === "bulk_operations")) {
          addAnomaly({
            type: "bulk_operations",
            severity: "high",
            title: "Bulk User Operations Detected",
            description: `Admin ${adminName} performed multiple user management operations`,
            adminId,
            adminName,
            status: "active",
            relatedActions: bulkOperations.map((a) => a.id),
            details: {
              operationCount: bulkOperations.length,
              operationTypes: [...new Set(bulkOperations.map((a) => a.type))],
            },
          })
        }

        // Check for privilege escalation patterns
        const roleChanges = adminActions.filter((action) => action.type === "user_role_change")
        const adminPromotions = roleChanges.filter((action) => action.details?.newRole === "admin")

        if (adminPromotions.length > 1 && !existingAnomalies.some((a) => a.type === "privilege_escalation")) {
          addAnomaly({
            type: "privilege_escalation",
            severity: "critical",
            title: "Multiple Admin Promotions Detected",
            description: `Admin ${adminName} promoted multiple users to admin role`,
            adminId,
            adminName,
            status: "active",
            relatedActions: adminPromotions.map((a) => a.id),
            details: {
              promotionCount: adminPromotions.length,
              promotedUsers: adminPromotions.map((a) => a.details?.targetUser),
            },
          })
        }
      })
    } finally {
      analysisInProgress.current = false
    }
  }

  const analyzeAdminBehavior = (adminId: string) => {
    const adminActions = actions.filter((action) => action.adminId === adminId)
    if (adminActions.length === 0) return

    const profile = profiles.find((p) => p.adminId === adminId)
    if (!profile) return

    // Analyze current behavior against profile
    const recentActions = adminActions.slice(0, 20)
    const currentHours = recentActions.map((action) => new Date(action.timestamp).getHours())
    const currentTypes = recentActions.map((action) => action.type)

    // Check for unusual hours
    const unusualHours = currentHours.filter(
      (hour) => hour < profile.normalHours.start || hour > profile.normalHours.end,
    )

    if (unusualHours.length > recentActions.length * 0.5) {
      addAnomaly({
        type: "unusual_activity",
        severity: "medium",
        title: "Unusual Activity Hours",
        description: `Admin ${profile.adminName} is active outside normal hours`,
        adminId,
        adminName: profile.adminName,
        status: "active",
        relatedActions: recentActions.map((a) => a.id),
        details: {
          normalHours: profile.normalHours,
          currentHours: unusualHours,
          percentage: (unusualHours.length / recentActions.length) * 100,
        },
      })
    }

    // Check for unusual action types
    const unusualTypes = currentTypes.filter((type) => !profile.commonActionTypes.includes(type))

    if (unusualTypes.length > recentActions.length * 0.3) {
      addAnomaly({
        type: "unusual_activity",
        severity: "low",
        title: "Unusual Action Pattern",
        description: `Admin ${profile.adminName} is performing uncommon actions`,
        adminId,
        adminName: profile.adminName,
        status: "active",
        relatedActions: recentActions.map((a) => a.id),
        details: {
          commonTypes: profile.commonActionTypes,
          unusualTypes: [...new Set(unusualTypes)],
          percentage: (unusualTypes.length / recentActions.length) * 100,
        },
      })
    }
  }

  return (
    <SecurityMonitoringContext.Provider
      value={{
        anomalies,
        profiles,
        addAnomaly,
        updateAnomalyStatus,
        getActiveAnomalies,
        getCriticalAnomalies,
        getAdminRiskScore,
        analyzeAdminBehavior,
      }}
    >
      {children}
    </SecurityMonitoringContext.Provider>
  )
}
