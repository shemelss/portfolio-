"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Load notifications from local storage on mount
    try {
      const storedNotifications = localStorage.getItem("notifications")
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications).map((notif: any) => ({
          ...notif,
          timestamp: new Date(notif.timestamp),
        }))
        setNotifications(parsedNotifications)
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    // Save notifications to local storage whenever they change
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    } catch (error) {
      console.error("Failed to save notifications to localStorage:", error)
    }
  }, [notifications])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)) // Keep max 50 notifications
  }, [])

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = useMemo(() => notifications.filter((notif) => !notif.read).length, [notifications])

  const memoizedValue = useMemo(
    () => ({
      notifications,
      addNotification,
      markNotificationAsRead,
      clearAllNotifications,
      unreadCount,
    }),
    [notifications, addNotification, markNotificationAsRead, clearAllNotifications, unreadCount],
  )

  return <NotificationContext.Provider value={memoizedValue}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
