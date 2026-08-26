"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/notification-context"

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, markNotificationAsRead, clearAllNotifications, unreadCount } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Success</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Info</Badge>
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Warning</Badge>
        )
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Error</Badge>
      default:
        return <Badge variant="outline">Notification</Badge>
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="relative text-white">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 text-white text-xs">
            {unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden py-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bell className="h-12 w-12 mb-4" />
              <p>No notifications yet.</p>
              <p className="text-sm text-center">Your alerts and updates will appear here.</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      notification.read ? "bg-muted/50" : "bg-background shadow-sm"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{notification.title}</span>
                        {getNotificationBadge(notification.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.timestamp.toLocaleString()}</p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
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
          <Button onClick={clearAllNotifications} className="w-full" disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear All Notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
