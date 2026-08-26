"use client"

import { useAudit } from "@/contexts/audit-context"

export function useAuditLogger() {
  const audit = useAudit()

  // Get current user info from localStorage or session
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("currentUser")
      if (userStr) {
        return JSON.parse(userStr)
      }
      return { id: "guest", name: "Guest User", role: "guest" }
    } catch (error) {
      console.error("Error getting current user:", error)
      return { id: "guest", name: "Guest User", role: "guest" }
    }
  }

  return {
    logLogin: (success: boolean, details: Record<string, any>) => {
      const user = getCurrentUser()

      audit.logEvent({
        type: success ? "user_login" : "failed_login",
        userId: details.email || "unknown",
        userName: details.email || "Unknown User",
        userRole: user.role || "guest",
        action: success ? "User Login" : "Failed Login Attempt",
        description: success
          ? `User ${details.email} logged in successfully`
          : `Failed login attempt for ${details.email}`,
        ipAddress: "127.0.0.1", // In a real app, you'd get this from the server
        userAgent: navigator.userAgent,
        details,
        severity: success ? "info" : "warning",
        category: "authentication",
        source: "web",
        outcome: success ? "success" : "failure",
        metadata: {},
      })
    },

    logLogout: (userId: string, userName: string) => {
      const user = getCurrentUser()

      audit.logEvent({
        type: "user_logout",
        userId,
        userName,
        userRole: user.role || "user",
        action: "User Logout",
        description: `User ${userName} logged out`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        details: {
          timestamp: new Date().toISOString(),
        },
        severity: "info",
        category: "authentication",
        source: "web",
        outcome: "success",
        metadata: {},
      })
    },

    logGameAction: (action: string, details: Record<string, any>) => {
      const user = getCurrentUser()

      audit.logEvent({
        type: details.type || "game_start",
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        description: `Game action: ${action}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        details,
        severity: "info",
        category: "gaming",
        source: "web",
        outcome: details.outcome || "success",
        metadata: {},
      })
    },

    logAdminAction: (action: string, details: Record<string, any>) => {
      const user = getCurrentUser()

      audit.logEvent({
        type: details.type || "user_role_change",
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        description: `Admin action: ${action}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        details,
        severity: details.severity || "info",
        category: "authorization",
        source: "admin",
        outcome: details.outcome || "success",
        metadata: {},
      })
    },

    logFinancialAction: (action: string, details: Record<string, any>) => {
      const user = getCurrentUser()

      audit.logEvent({
        type: details.type || "deposit",
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        description: `Financial action: ${action}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        details,
        severity: "info",
        category: "financial",
        source: "web",
        outcome: details.outcome || "success",
        metadata: {},
      })
    },

    logSecurityEvent: (action: string, details: Record<string, any>) => {
      const user = getCurrentUser()

      audit.logEvent({
        type: details.type || "security_alert",
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        description: `Security event: ${action}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        details,
        severity: details.severity || "warning",
        category: "security",
        source: details.source || "system",
        outcome: details.outcome || "success",
        metadata: {},
      })
    },

    logSystemEvent: (action: string, details: Record<string, any>) => {
      const user = getCurrentUser()

      audit.logEvent({
        type: details.type || "system_maintenance",
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        description: `System event: ${action}`,
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent,
        details,
        severity: details.severity || "info",
        category: "system",
        source: "system",
        outcome: details.outcome || "success",
        metadata: {},
      })
    },
  }
}
