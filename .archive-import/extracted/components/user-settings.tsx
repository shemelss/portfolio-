"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Shield, Bell, Gamepad2, Monitor, Save, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UserSettingsProps {
  userData: any
  onUserDataUpdate: (userData: any) => void
}

export default function UserSettings({ userData, onUserDataUpdate }: UserSettingsProps) {
  const [settings, setSettings] = useState({
    // Profile Settings
    displayName: userData?.name || "",
    email: userData?.email || "",
    bio: userData?.bio || "",
    avatar: userData?.avatar || "",

    // Privacy Settings
    showBalance: true,
    showActivity: true,
    allowMessages: true,
    showOnlineStatus: true,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    gameNotifications: true,
    promotionNotifications: true,
    chatNotifications: true,

    // Game Settings
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: [75],
    musicVolume: [50],
    autoPlay: false,
    quickBet: false,
    animationsEnabled: true,

    // Display Settings
    theme: "dark",
    language: "en",
    currency: "USD",
    timezone: "UTC",
    compactMode: false,

    // Security Settings
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    passwordChangeRequired: false,
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [userData])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(`userSettings_${userData?.id}`)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem(`userSettings_${userData?.id}`, JSON.stringify(settings))

      // Update user data if profile settings changed
      const updatedUserData = {
        ...userData,
        name: settings.displayName,
        email: settings.email,
        bio: settings.bio,
        avatar: settings.avatar,
      }

      onUserDataUpdate(updatedUserData)
      setHasChanges(false)

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetSettings = () => {
    setSettings({
      displayName: userData?.name || "",
      email: userData?.email || "",
      bio: userData?.bio || "",
      avatar: userData?.avatar || "",
      showBalance: true,
      showActivity: true,
      allowMessages: true,
      showOnlineStatus: true,
      emailNotifications: true,
      pushNotifications: true,
      gameNotifications: true,
      promotionNotifications: true,
      chatNotifications: true,
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: [75],
      musicVolume: [50],
      autoPlay: false,
      quickBet: false,
      animationsEnabled: true,
      theme: "dark",
      language: "en",
      currency: "USD",
      timezone: "UTC",
      compactMode: false,
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 30,
      passwordChangeRequired: false,
    })
    setHasChanges(true)

    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    })
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-white">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={settings.displayName}
                      onChange={(e) => updateSetting("displayName", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting("email", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => updateSetting("bio", e.target.value)}
                    placeholder="Tell other players about yourself..."
                    className="bg-white/5 border-white/20 text-white"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Privacy Controls</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Show Balance</Label>
                      <p className="text-sm text-white/70">Allow other players to see your balance</p>
                    </div>
                    <Switch
                      checked={settings.showBalance}
                      onCheckedChange={(checked) => updateSetting("showBalance", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Show Activity</Label>
                      <p className="text-sm text-white/70">Display your gaming activity to others</p>
                    </div>
                    <Switch
                      checked={settings.showActivity}
                      onCheckedChange={(checked) => updateSetting("showActivity", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Allow Messages</Label>
                      <p className="text-sm text-white/70">Receive private messages from other players</p>
                    </div>
                    <Switch
                      checked={settings.allowMessages}
                      onCheckedChange={(checked) => updateSetting("allowMessages", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Show Online Status</Label>
                      <p className="text-sm text-white/70">Let others see when you're online</p>
                    </div>
                    <Switch
                      checked={settings.showOnlineStatus}
                      onCheckedChange={(checked) => updateSetting("showOnlineStatus", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-white/70">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Push Notifications</Label>
                      <p className="text-sm text-white/70">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Game Notifications</Label>
                      <p className="text-sm text-white/70">Notifications about game results and achievements</p>
                    </div>
                    <Switch
                      checked={settings.gameNotifications}
                      onCheckedChange={(checked) => updateSetting("gameNotifications", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Promotion Notifications</Label>
                      <p className="text-sm text-white/70">Special offers and bonuses</p>
                    </div>
                    <Switch
                      checked={settings.promotionNotifications}
                      onCheckedChange={(checked) => updateSetting("promotionNotifications", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Chat Notifications</Label>
                      <p className="text-sm text-white/70">New messages in live chat</p>
                    </div>
                    <Switch
                      checked={settings.chatNotifications}
                      onCheckedChange={(checked) => updateSetting("chatNotifications", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Game Settings */}
            <TabsContent value="game" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Gamepad2 className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Game Preferences</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Sound Effects</Label>
                      <p className="text-sm text-white/70">Enable game sound effects</p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                    />
                  </div>

                  {settings.soundEnabled && (
                    <div className="space-y-2">
                      <Label className="text-white">Sound Volume</Label>
                      <div className="flex items-center gap-4">
                        <VolumeX className="h-4 w-4 text-white/50" />
                        <Slider
                          value={settings.soundVolume}
                          onValueChange={(value) => updateSetting("soundVolume", value)}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <Volume2 className="h-4 w-4 text-white/50" />
                        <span className="text-white text-sm w-8">{settings.soundVolume[0]}%</span>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Background Music</Label>
                      <p className="text-sm text-white/70">Enable background music</p>
                    </div>
                    <Switch
                      checked={settings.musicEnabled}
                      onCheckedChange={(checked) => updateSetting("musicEnabled", checked)}
                    />
                  </div>

                  {settings.musicEnabled && (
                    <div className="space-y-2">
                      <Label className="text-white">Music Volume</Label>
                      <div className="flex items-center gap-4">
                        <VolumeX className="h-4 w-4 text-white/50" />
                        <Slider
                          value={settings.musicVolume}
                          onValueChange={(value) => updateSetting("musicVolume", value)}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <Volume2 className="h-4 w-4 text-white/50" />
                        <span className="text-white text-sm w-8">{settings.musicVolume[0]}%</span>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Auto Play</Label>
                      <p className="text-sm text-white/70">Automatically play next hand</p>
                    </div>
                    <Switch
                      checked={settings.autoPlay}
                      onCheckedChange={(checked) => updateSetting("autoPlay", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Quick Bet</Label>
                      <p className="text-sm text-white/70">Enable quick betting options</p>
                    </div>
                    <Switch
                      checked={settings.quickBet}
                      onCheckedChange={(checked) => updateSetting("quickBet", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Animations</Label>
                      <p className="text-sm text-white/70">Enable card and chip animations</p>
                    </div>
                    <Switch
                      checked={settings.animationsEnabled}
                      onCheckedChange={(checked) => updateSetting("animationsEnabled", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Display Options</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => updateSetting("currency", value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                        <SelectItem value="CET">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Compact Mode</Label>
                      <p className="text-sm text-white/70">Use a more compact interface layout</p>
                    </div>
                    <Switch
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Two-Factor Authentication</Label>
                      <p className="text-sm text-white/70">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSetting("twoFactorEnabled", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Login Notifications</Label>
                      <p className="text-sm text-white/70">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      checked={settings.loginNotifications}
                      onCheckedChange={(checked) => updateSetting("loginNotifications", checked)}
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="space-y-2">
                    <Label className="text-white">Session Timeout (minutes)</Label>
                    <Select
                      value={settings.sessionTimeout.toString()}
                      onValueChange={(value) => updateSetting("sessionTimeout", Number.parseInt(value))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-white/20">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!hasChanges}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={saveSettings} disabled={!hasChanges} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
