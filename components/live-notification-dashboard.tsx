"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  DollarSign,
  Shield,
  TrendingUp,
  User,
  Wifi,
  WifiOff,
  Crown,
  XCircle,
  Trash2,
} from "lucide-react"
import {
  useLiveNotifications,
  type LiveNotification,
  type NotificationPriority,
} from "@/contexts/live-notification-context"

export default function LiveNotificationDashboard() {
  const {
    notifications: liveNotifications,
    unacknowledgedCount,
    criticalCount,
    acknowledgeNotification,
    acknowledgeAll,
    removeNotification,
    getNotificationsByPriority,
    isConnected,
    connectionStatus,
    markLiveNotificationAsRead,
    clearAllLiveNotifications,
  } = useLiveNotifications()

  const [selectedNotification, setSelectedNotification] = useState<LiveNotification | null>(null)

  useEffect(() => {
    // Mark all notifications as read when the dashboard is viewed
    liveNotifications.forEach((notif) => {
      if (!notif.read) {
        markLiveNotificationAsRead(notif.id)
      }
    })
  }, [liveNotifications, markLiveNotificationAsRead])

  const getStats = () => {
    const last24Hours = liveNotifications.filter(
      (n) => new Date().getTime() - n.timestamp.getTime() < 24 * 60 * 60 * 1000,
    )

    return {
      total: liveNotifications.length,
      unacknowledged: unacknowledgedCount,
      critical: criticalCount,
      last24Hours: last24Hours.length,
      byPriority: {
        critical: getNotificationsByPriority("critical").length,
        high: getNotificationsByPriority("high").length,
        medium: getNotificationsByPriority("medium").length,
        low: getNotificationsByPriority("low").length,
      },
    }
  }

  const stats = getStats()

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Bell className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    if (type.includes("deposit") || type.includes("withdrawal") || type.includes("payment")) {
      return <DollarSign className="h-4 w-4" />
    }
    if (type.includes("user") || type.includes("kyc")) {
      return <User className="h-4 w-4" />
    }
    if (type.includes("security") || type.includes("suspicious")) {
      return <Shield className="h-4 w-4" />
    }
    return <AlertTriangle className="h-4 w-4" />
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const handleNotificationAction = (notification: LiveNotification, actionId: string) => {
    const action = notification.actions?.find((a) => a.id === actionId)
    if (action) {
      action.action()
      acknowledgeNotification(notification.id)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "win":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "jackpot":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "win":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Win</Badge>
      case "jackpot":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Jackpot</Badge>
        )
      case "alert":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Alert</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Info</Badge>
      default:
        return <Badge variant="outline">Notification</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Live Notification System
            </CardTitle>
            <div className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {connectionStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unacknowledged</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unacknowledged}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last 24 Hours</p>
                <p className="text-2xl font-bold">{stats.last24Hours}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Breakdown</CardTitle>
          <CardDescription>Notifications by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.byPriority.critical}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.byPriority.high}</div>
              <div className="text-sm text-muted-foreground">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.byPriority.medium}</div>
              <div className="text-sm text-muted-foreground">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.byPriority.low}</div>
              <div className="text-sm text-muted-foreground">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Live Notifications
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllLiveNotifications}
            disabled={liveNotifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </Button>
        </CardHeader>
        <CardDescription className="px-6">Real-time alerts and updates from the casino platform.</CardDescription>
        <CardContent className="pt-4">
          {liveNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4" />
              <p>No live notifications yet.</p>
              <p className="text-sm">Keep playing to see real-time updates!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {liveNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      notification.read ? "bg-muted/50" : "bg-background shadow-md animate-pulse-once"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{notification.title || "New Notification"}</span>
                        {getNotificationBadge(notification.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.timestamp.toLocaleString()}</p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markLiveNotificationAsRead(notification.id)}
                        className="flex-shrink-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
