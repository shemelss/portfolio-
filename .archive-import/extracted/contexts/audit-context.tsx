"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { generateId } from "@/lib/id" // Import our custom ID generator

export type AuditEventType =
  | "user_login"
  | "user_logout"
  | "user_registration"
  | "admin_login"
  | "admin_logout"
  | "user_role_change"
  | "user_ban"
  | "user_unban"
  | "password_change"
  | "email_change"
  | "profile_update"
  | "game_start"
  | "game_end"
  | "bet_placed"
  | "win_recorded"
  | "loss_recorded"
  | "deposit"
  | "withdrawal"
  | "referral_created"
  | "referral_reward"
  | "settings_change"
  | "security_alert"
  | "data_export"
  | "data_import"
  | "system_maintenance"
  | "api_access"
  | "failed_login"
  | "suspicious_activity"

export interface AuditEvent {
  id: string
  type: AuditEventType
  userId: string
  userName: string
  userRole: string
  action: string
  description: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  sessionId: string
  details: Record<string, any>
  severity: "info" | "warning" | "error" | "critical"
  category: "authentication" | "authorization" | "data" | "system" | "security" | "financial" | "gaming"
  source: "web" | "api" | "admin" | "system"
  outcome: "success" | "failure" | "pending"
  metadata: {
    location?: string
    device?: string
    browser?: string
    os?: string
    referrer?: string
    duration?: number
    dataChanged?: string[]
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
  }
}

export interface AuditFilter {
  startDate?: Date
  endDate?: Date
  userId?: string
  userRole?: string
  eventType?: AuditEventType
  category?: string
  severity?: string
  outcome?: string
  searchTerm?: string
}

export interface AuditStats {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByCategory: Record<string, number>
  eventsBySeverity: Record<string, number>
  eventsByOutcome: Record<string, number>
  uniqueUsers: number
  failedLogins: number
  securityAlerts: number
  recentActivity: AuditEvent[]
}

interface AuditContextType {
  events: AuditEvent[]
  logEvent: (event: Omit<AuditEvent, "id" | "timestamp" | "sessionId">) => void
  getFilteredEvents: (filter: AuditFilter) => AuditEvent[]
  getEventsByUser: (userId: string) => AuditEvent[]
  getEventsByType: (type: AuditEventType) => AuditEvent[]
  getAuditStats: (filter?: AuditFilter) => AuditStats
  exportAuditLog: (filter?: AuditFilter) => void
  clearAuditLog: () => void
  getComplianceReport: (startDate: Date, endDate: Date) => any
}

const AuditContext = createContext<AuditContextType | undefined>(undefined)

export const useAudit = () => {
  const context = useContext(AuditContext)
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider")
  }
  return context
}

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [sessionId] = useState(() => generateId()) // Use generateId for sessionId

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem("auditEvents")
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }))
        setEvents(parsedEvents)
      }
    } catch (error) {
      console.error("Error loading audit events:", error)
    }
  }, [])

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length === 0) return

    try {
      // Keep only last 10000 events to prevent storage overflow
      const eventsToSave = events.slice(0, 10000)
      localStorage.setItem("auditEvents", JSON.stringify(eventsToSave))
    } catch (error) {
      console.error("Error saving audit events:", error)
    }
  }, [events])

  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent
    let device = "Unknown"
    let browser = "Unknown"
    let os = "Unknown"

    // Detect device
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device = "Mobile"
    } else if (/Tablet|iPad/.test(userAgent)) {
      device = "Tablet"
    } else {
      device = "Desktop"
    }

    // Detect browser
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    // Detect OS
    if (userAgent.includes("Windows")) os = "Windows"
    else if (userAgent.includes("Mac")) os = "macOS"
    else if (userAgent.includes("Linux")) os = "Linux"
    else if (userAgent.includes("Android")) os = "Android"
    else if (userAgent.includes("iOS")) os = "iOS"

    return { device, browser, os }
  }, [])

  const logEvent = useCallback(
    (event: Omit<AuditEvent, "id" | "timestamp" | "sessionId">) => {
      const deviceInfo = getDeviceInfo()

      const newEvent: AuditEvent = {
        ...event,
        id: generateId(), // Use generateId
        timestamp: new Date(),
        sessionId,
        ipAddress: event.ipAddress || "127.0.0.1", // Fallback for demo
        userAgent: event.userAgent || navigator.userAgent,
        metadata: {
          ...event.metadata,
          ...deviceInfo,
          referrer: document.referrer || undefined,
        },
      }

      setEvents((prev) => [newEvent, ...prev])
    },
    [getDeviceInfo, sessionId],
  )

  const getFilteredEvents = useCallback(
    (filter: AuditFilter): AuditEvent[] => {
      let filtered = [...events]

      if (filter.startDate) {
        filtered = filtered.filter((event) => new Date(event.timestamp) >= filter.startDate!)
      }

      if (filter.endDate) {
        filtered = filtered.filter((event) => new Date(event.timestamp) <= filter.endDate!)
      }

      if (filter.userId) {
        filtered = filtered.filter((event) => event.userId === filter.userId)
      }

      if (filter.userRole) {
        filtered = filtered.filter((event) => event.userRole === filter.userRole)
      }

      if (filter.eventType) {
        filtered = filtered.filter((event) => event.type === filter.eventType)
      }

      if (filter.category) {
        filtered = filtered.filter((event) => event.category === filter.category)
      }

      if (filter.severity) {
        filtered = filtered.filter((event) => event.severity === filter.severity)
      }

      if (filter.outcome) {
        filtered = filtered.filter((event) => event.outcome === filter.outcome)
      }

      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase()
        filtered = filtered.filter(
          (event) =>
            event.action.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term) ||
            event.userName.toLowerCase().includes(term) ||
            JSON.stringify(event.details).toLowerCase().includes(term),
        )
      }

      return filtered
    },
    [events],
  )

  const getEventsByUser = useCallback(
    (userId: string): AuditEvent[] => {
      return events.filter((event) => event.userId === userId)
    },
    [events],
  )

  const getEventsByType = useCallback(
    (type: AuditEventType): AuditEvent[] => {
      return events.filter((event) => event.type === type)
    },
    [events],
  )

  const getAuditStats = useCallback(
    (filter?: AuditFilter): AuditStats => {
      const filteredEvents = filter ? getFilteredEvents(filter) : events

      const eventsByType = filteredEvents.reduce(
        (acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const eventsByCategory = filteredEvents.reduce(
        (acc, event) => {
          acc[event.category] = (acc[event.category] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const eventsBySeverity = filteredEvents.reduce(
        (acc, event) => {
          acc[event.severity] = (acc[event.severity] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const eventsByOutcome = filteredEvents.reduce(
        (acc, event) => {
          acc[event.outcome] = (acc[event.outcome] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const uniqueUsers = new Set(filteredEvents.map((event) => event.userId)).size
      const failedLogins = filteredEvents.filter((event) => event.type === "failed_login").length
      const securityAlerts = filteredEvents.filter((event) => event.category === "security").length

      return {
        totalEvents: filteredEvents.length,
        eventsByType,
        eventsByCategory,
        eventsBySeverity,
        eventsByOutcome,
        uniqueUsers,
        failedLogins,
        securityAlerts,
        recentActivity: filteredEvents.slice(0, 10),
      }
    },
    [events, getFilteredEvents],
  )

  const exportAuditLog = useCallback(
    (filter?: AuditFilter) => {
      const eventsToExport = filter ? getFilteredEvents(filter) : events

      const headers = [
        "ID",
        "Timestamp",
        "Type",
        "User ID",
        "User Name",
        "User Role",
        "Action",
        "Description",
        "Category",
        "Severity",
        "Outcome",
        "IP Address",
        "User Agent",
        "Session ID",
        "Device",
        "Browser",
        "OS",
        "Details",
      ]

      const csvRows = [
        headers.join(","),
        ...eventsToExport.map((event) =>
          [
            event.id,
            new Date(event.timestamp).toISOString(),
            event.type,
            event.userId,
            `"${event.userName.replace(/"/g, '""')}"`,
            event.userRole,
            `"${event.action.replace(/"/g, '""')}"`,
            `"${event.description.replace(/"/g, '""')}"`,
            event.category,
            event.severity,
            event.outcome,
            event.ipAddress,
            `"${event.userAgent.replace(/"/g, '""')}"`,
            event.sessionId,
            event.metadata.device || "",
            event.metadata.browser || "",
            event.metadata.os || "",
            `"${JSON.stringify(event.details).replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ]

      const csvContent = csvRows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `audit-log-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [getFilteredEvents],
  )

  const clearAuditLog = useCallback(() => {
    setEvents([])
  }, [])

  const getComplianceReport = useCallback(
    (startDate: Date, endDate: Date) => {
      const filteredEvents = getFilteredEvents({ startDate, endDate })
      const stats = getAuditStats({ startDate, endDate })

      return {
        reportPeriod: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        summary: stats,
        securityEvents: filteredEvents.filter((e) => e.category === "security"),
        authenticationEvents: filteredEvents.filter((e) => e.category === "authentication"),
        dataAccessEvents: filteredEvents.filter((e) => e.category === "data"),
        financialEvents: filteredEvents.filter((e) => e.category === "financial"),
        failedAttempts: filteredEvents.filter((e) => e.outcome === "failure"),
        privilegedActions: filteredEvents.filter((e) => e.userRole === "admin"),
        generatedAt: new Date().toISOString(),
      }
    },
    [getFilteredEvents, getAuditStats],
  )

  return (
    <AuditContext.Provider
      value={{
        events,
        logEvent,
        getFilteredEvents,
        getEventsByUser,
        getEventsByType,
        getAuditStats,
        exportAuditLog,
        clearAuditLog,
        getComplianceReport,
      }}
    >
      {children}
    </AuditContext.Provider>
  )
}
