"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Save, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NotificationSettingsState {
  emailNotifications: boolean
  pushNotifications: boolean
  gameNotifications: boolean
  promotionNotifications: boolean
  chatNotifications: boolean
}

const DEFAULT_SETTINGS: NotificationSettingsState = {
  emailNotifications: true,
  pushNotifications: true,
  gameNotifications: true,
  promotionNotifications: true,
  chatNotifications: true,
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsState>(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const storedSettings = localStorage.getItem("notificationSettings")
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error("Error loading notification settings:", error)
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(settings))
      setHasChanges(false)
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasChanges(true) // Mark as changed so user can save defaults
    toast({
      title: "Settings Reset",
      description: "Notification settings reset to defaults.",
    })
  }

  const updateSetting = (key: keyof NotificationSettingsState, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notification Preferences
        </CardTitle>
        <CardDescription>Manage how you receive alerts and updates from the casino.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates and promotions via email.</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get instant browser notifications for key events.</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gameNotifications">Game Notifications</Label>
              <p className="text-sm text-muted-foreground">Alerts about game results, achievements, and bonuses.</p>
            </div>
            <Switch
              id="gameNotifications"
              checked={settings.gameNotifications}
              onCheckedChange={(checked) => updateSetting("gameNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotionNotifications">Promotion Notifications</Label>
              <p className="text-sm text-muted-foreground">Stay informed about special offers and new games.</p>
            </div>
            <Switch
              id="promotionNotifications"
              checked={settings.promotionNotifications}
              onCheckedChange={(checked) => updateSetting("promotionNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="chatNotifications">Chat Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for new messages in live chat.</p>
            </div>
            <Switch
              id="chatNotifications"
              checked={settings.chatNotifications}
              onCheckedChange={(checked) => updateSetting("chatNotifications", checked)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" disabled={!hasChanges} onClick={loadSettings}>
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
