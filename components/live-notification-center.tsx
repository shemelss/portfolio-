"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle, Info, AlertTriangle, Crown, XCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useLiveNotifications } from "@/contexts/live-notification-context"

export default function LiveNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { liveNotifications, markLiveNotificationAsRead, clearAllLiveNotifications, unreadLiveNotificationCount } =
    useLiveNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "win":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "jackpot":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadLiveNotificationCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 text-white text-xs">
            {unreadLiveNotificationCount}
          </Badge>
        )}
      </Button>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Live Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden py-4">
          {liveNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bell className="h-12 w-12 mb-4" />
              <p>No live notifications yet.</p>
              <p className="text-sm text-center">Real-time updates will appear here.</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {liveNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
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
        </div>
        <div className="flex-shrink-0 pt-4 border-t">
          <Button onClick={clearAllLiveNotifications} className="w-full" disabled={liveNotifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear All Notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
