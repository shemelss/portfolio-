"use client"

import { useEffect } from "react"
import { useSoundEffects } from "@/hooks/use-sound-effects"
import { useNotifications } from "@/contexts/notification-context"
import { useLiveNotifications } from "@/contexts/live-notification-context"

export default function NotificationSoundManager() {
  const { playSound } = useSoundEffects()
  const { notifications } = useNotifications()
  const { liveNotifications } = useLiveNotifications()

  // Track the number of notifications to detect new ones
  const notificationCount = notifications.length
  const liveNotificationCount = liveNotifications.length

  // Play sound for new general notifications
  useEffect(() => {
    if (notificationCount > 0) {
      const latestNotification = notifications[0]
      // Only play if it's a new, unread notification
      if (!latestNotification.read) {
        playSound("notification")
      }
    }
  }, [notificationCount, notifications, playSound])

  // Play sound for new live notifications
  useEffect(() => {
    if (liveNotificationCount > 0) {
      const latestLiveNotification = liveNotifications[0]
      // Only play if it's a new, unread live notification
      if (!latestLiveNotification.read) {
        playSound("liveNotification")
      }
    }
  }, [liveNotificationCount, liveNotifications, playSound])

  return null // This component doesn't render anything
}
