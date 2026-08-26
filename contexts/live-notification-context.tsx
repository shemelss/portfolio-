"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react"
import { v4 as uuidv4 } from "uuid"
import { useNotifications } from "./notification-context"
import { useAdminActivity } from "./admin-activity-context"

export type CriticalEventType =
  | "large_deposit"
  | "large_withdrawal"
  | "suspicious_activity"
  | "security_breach"
  | "system_alert"
  | "fraud_detection"
  | "kyc_issue"
  | "user_banned"
  | "multiple_failed_logins"
  | "unusual_betting_pattern"
  | "high_win_streak"
  | "payment_failure"
  | "server_error"
  | "compliance_alert"

export type NotificationPriority = "low" | "medium" | "high" | "critical"

export interface LiveNotification {
  id: string
  type: "win" | "jackpot" | "alert" | "info" | CriticalEventType
  message: string
  timestamp: Date
  read: boolean
  userId?: string
  userName?: string
  amount?: number
  details?: Record<string, any>
  acknowledged?: boolean
  autoExpire?: boolean
  expiresAt?: Date
  actions?: NotificationAction[]
}

export interface NotificationAction {
  id: string
  label: string
  variant: "default" | "destructive" | "outline"
  action: () => void
}

interface LiveNotificationContextType {
  liveNotifications: LiveNotification[]
  addLiveNotification: (notification: Omit<LiveNotification, "id" | "timestamp" | "read">) => void
  markLiveNotificationAsRead: (id: string) => void
  clearAllLiveNotifications: () => void
  unreadLiveNotificationCount: number
  notifications: LiveNotification[]
  unacknowledgedCount: number
  criticalCount: number
  acknowledgeNotification: (id: string) => void
  acknowledgeAll: () => void
  removeNotification: (id: string) => void
  clearExpired: () => void
  getNotificationsByPriority: (priority: NotificationPriority) => LiveNotification[]
  isConnected: boolean
  connectionStatus: "connected" | "disconnected" | "reconnecting"
}

const LiveNotificationContext = createContext<LiveNotificationContextType | undefined>(undefined)

export const useLiveNotifications = () => {
  const context = useContext(LiveNotificationContext)
  if (!context) {
    throw new Error("useLiveNotifications must be used within a LiveNotificationProvider")
  }
  return context
}

export const LiveNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([])
  const [notifications, setNotifications] = useState<LiveNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">(
    "disconnected",
  )
  const notificationQueue = useRef<Omit<LiveNotification, "id" | "timestamp" | "read">[]>([])
  const processingQueue = useRef(false)
  const { addNotification: addToastNotification } = useNotifications()
  const { logAction } = useAdminActivity()
  const simulationInterval = useRef<NodeJS.Timeout | null>(null)
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Function to process the queue
  const processQueue = useCallback(() => {
    if (processingQueue.current || notificationQueue.current.length === 0) {
      return
    }

    processingQueue.current = true
    const nextNotification = notificationQueue.current.shift()

    if (nextNotification) {
      const newNotification: LiveNotification = {
        ...nextNotification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
        timestamp: new Date(),
        read: false,
      }

      setLiveNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, 20) // Keep max 20 notifications
        // Optionally save to local storage if persistence is needed for live notifications
        // localStorage.setItem("liveNotifications", JSON.stringify(updated));
        return updated
      })

      // Simulate display time before processing next
      setTimeout(() => {
        processingQueue.current = false
        processQueue() // Process next after a delay
      }, 3000) // Display each live notification for 3 seconds
    } else {
      processingQueue.current = false
    }
  }, [])

  const addLiveNotification = useCallback(
    (notification: Omit<LiveNotification, "id" | "timestamp" | "read">) => {
      notificationQueue.current.push(notification)
      processQueue()
    },
    [processQueue],
  )

  const markLiveNotificationAsRead = useCallback((id: string) => {
    setLiveNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }, [])

  const clearAllLiveNotifications = useCallback(() => {
    setLiveNotifications([])
    notificationQueue.current = [] // Clear pending queue as well
    processingQueue.current = false
  }, [])

  const unreadLiveNotificationCount = useMemo(
    () => liveNotifications.filter((notif) => !notif.read).length,
    [liveNotifications],
  )

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("liveNotifications")
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications).map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
          expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
        }))
        setNotifications(parsedNotifications)
      }
    } catch (error) {
      console.error("Error loading live notifications:", error)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("liveNotifications", JSON.stringify(notifications))
    } catch (error) {
      console.error("Error saving live notifications:", error)
    }
  }, [notifications])

  // Simulate WebSocket connection and real-time events
  useEffect(() => {
    // Simulate connection establishment
    setConnectionStatus("reconnecting")
    setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus("connected")
    }, 2000)

    // Start event simulation
    startEventSimulation()

    // Connection health check
    connectionCheckInterval.current = setInterval(() => {
      // Simulate occasional connection issues
      if (Math.random() < 0.05) {
        setConnectionStatus("reconnecting")
        setIsConnected(false)
        setTimeout(() => {
          setIsConnected(true)
          setConnectionStatus("connected")
        }, 3000)
      }
    }, 30000)

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current)
      }
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current)
      }
    }
  }, [])

  // Auto-expire notifications
  useEffect(() => {
    const expireInterval = setInterval(() => {
      clearExpired()
    }, 60000) // Check every minute

    return () => clearInterval(expireInterval)
  }, [])

  const startEventSimulation = () => {
    simulationInterval.current = setInterval(() => {
      if (Math.random() < 0.3) {
        // 30% chance to generate an event every 10 seconds
        generateRandomEvent()
      }
    }, 10000)
  }

  const generateRandomEvent = () => {
    const events = [
      {
        type: "large_deposit" as CriticalEventType,
        priority: "high" as NotificationPriority,
        title: "Large Deposit Alert",
        message: "User deposited $5,000 - requires verification",
        amount: 5000,
        autoExpire: false,
      },
      {
        type: "suspicious_activity" as CriticalEventType,
        priority: "critical" as NotificationPriority,
        title: "Suspicious Activity Detected",
        message: "Multiple accounts from same IP address",
        autoExpire: false,
      },
      {
        type: "high_win_streak" as CriticalEventType,
        priority: "medium" as NotificationPriority,
        title: "High Win Streak Alert",
        message: "User won 15 consecutive games - potential investigation needed",
        autoExpire: true,
      },
      {
        type: "payment_failure" as CriticalEventType,
        priority: "high" as NotificationPriority,
        title: "Payment Processing Error",
        message: "Multiple payment failures detected",
        autoExpire: true,
      },
      {
        type: "kyc_issue" as CriticalEventType,
        priority: "medium" as NotificationPriority,
        title: "KYC Document Issue",
        message: "Suspicious document uploaded for verification",
        autoExpire: false,
      },
    ]

    const randomEvent = events[Math.floor(Math.random() * events.length)]
    const userId = `user_${Math.floor(Math.random() * 1000)}`
    const userName = `User${Math.floor(Math.random() * 1000)}`

    addNotification({
      ...randomEvent,
      userId,
      userName,
      details: {
        timestamp: new Date().toISOString(),
        source: "system_monitor",
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      actions: getActionsForEventType(randomEvent.type, userId, userName),
    })
  }

  const getActionsForEventType = (type: CriticalEventType, userId: string, userName: string): NotificationAction[] => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    switch (type) {
      case "large_deposit":
        return [
          {
            id: "approve",
            label: "Approve",
            variant: "default",
            action: () => {
              logAction({
                type: "settings_change",
                description: `Approved large deposit for ${userName}`,
                adminId: currentUser.id || "admin",
                adminName: currentUser.name || "Admin",
                severity: "high",
                details: { userId, action: "approve_deposit" },
              })
            },
          },
          {
            id: "investigate",
            label: "Investigate",
            variant: "outline",
            action: () => {
              logAction({
                type: "security_alert",
                description: `Started investigation for ${userName}`,
                adminId: currentUser.id || "admin",
                adminName: currentUser.name || "Admin",
                severity: "high",
                details: { userId, action: "start_investigation" },
              })
            },
          },
        ]

      case "suspicious_activity":
        return [
          {
            id: "ban_user",
            label: "Ban User",
            variant: "destructive",
            action: () => {
              logAction({
                type: "user_ban",
                description: `Banned ${userName} for suspicious activity`,
                adminId: currentUser.id || "admin",
                adminName: currentUser.name || "Admin",
                severity: "high",
                details: { userId, reason: "suspicious_activity" },
              })
            },
          },
          {
            id: "review",
            label: "Review",
            variant: "outline",
            action: () => {
              logAction({
                type: "security_alert",
                description: `Reviewing suspicious activity for ${userName}`,
                adminId: currentUser.id || "admin",
                adminName: currentUser.name || "Admin",
                severity: "medium",
                details: { userId, action: "review_activity" },
              })
            },
          },
        ]

      case "kyc_issue":
        return [
          {
            id: "reject_kyc",
            label: "Reject KYC",
            variant: "destructive",
            action: () => {
              logAction({
                type: "settings_change",
                description: `Rejected KYC documents for ${userName}`,
                adminId: currentUser.id || "admin",
                adminName: currentUser.name || "Admin",
                severity: "medium",
                details: { userId, action: "reject_kyc" },
              })
            },
          },
          {
            id: "request_new",
            label: "Request New Docs",
            variant: "outline",
            action: () => {
              logAction({
                type: "settings_change",
                description: `Requested new KYC documents from ${userName}`,
                adminId: currentUser.id || "admin",
                adminName: currentUser.name || "Admin",
                severity: "low",
                details: { userId, action: "request_new_kyc" },
              })
            },
          },
        ]

      default:
        return [
          {
            id: "acknowledge",
            label: "Acknowledge",
            variant: "default",
            action: () => {
              logAction({
                type: "settings_change",
                description: `Acknowledged ${type} alert`,
                adminId: currentUser.id || "admin",
                adminName: currentUser.name || "Admin",
                severity: "low",
                details: { eventType: type, action: "acknowledge" },
              })
            },
          },
        ]
    }
  }

  const addNotification = (notification: Omit<LiveNotification, "id" | "timestamp" | "read">) => {
    const newNotification: LiveNotification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
      acknowledged: false,
      autoExpire: notification.autoExpire || false,
      expiresAt: notification.autoExpire ? new Date(Date.now() + 5 * 60 * 1000) : undefined, // 5 minutes
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Add to toast notifications for immediate visibility
    addToastNotification({
      type: notification.priority === "critical" ? "error" : notification.priority === "high" ? "warning" : "info",
      title: notification.title || "",
      message: notification.message,
      category: "system",
    })

    // Play sound based on priority
    playNotificationSound(notification.priority)
  }

  const playNotificationSound = (priority: NotificationPriority) => {
    try {
      const audio = new Audio()
      switch (priority) {
        case "critical":
          audio.src = "/sounds/critical-alert.mp3"
          break
        case "high":
          audio.src = "/sounds/high-alert.mp3"
          break
        case "medium":
          audio.src = "/sounds/medium-alert.mp3"
          break
        default:
          audio.src = "/sounds/low-alert.mp3"
      }
      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    } catch (error) {
      console.log("Audio notification not available")
    }
  }

  const acknowledgeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, acknowledged: true } : notification)),
    )
  }

  const acknowledgeAll = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, acknowledged: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearExpired = () => {
    const now = new Date()
    setNotifications((prev) => prev.filter((notification) => !notification.expiresAt || notification.expiresAt > now))
  }

  const getNotificationsByPriority = (priority: NotificationPriority) => {
    return notifications.filter((notification) => notification.priority === priority)
  }

  const unacknowledgedCount = notifications.filter((n) => !n.acknowledged).length
  const criticalCount = notifications.filter((n) => n.priority === "critical" && !n.acknowledged).length

  const memoizedValue = useMemo(
    () => ({
      liveNotifications,
      addLiveNotification,
      markLiveNotificationAsRead,
      clearAllLiveNotifications,
      unreadLiveNotificationCount,
      notifications,
      unacknowledgedCount,
      criticalCount,
      acknowledgeNotification,
      acknowledgeAll,
      removeNotification,
      clearExpired,
      getNotificationsByPriority,
      isConnected,
      connectionStatus,
    }),
    [
      liveNotifications,
      markLiveNotificationAsRead,
      clearAllLiveNotifications,
      unreadLiveNotificationCount,
      notifications,
      isConnected,
      connectionStatus,
    ],
  )

  return <LiveNotificationContext.Provider value={memoizedValue}>{children}</LiveNotificationContext.Provider>
}
