"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Home,
  Gamepad2,
  Trophy,
  MessageCircle,
  History,
  Settings,
  Users,
  TrendingUp,
  TrendingDown,
  User,
  Bell,
  Gift,
  Crown,
  Bitcoin,
  Wallet,
  BarChart3,
  Shield,
  HelpCircle,
  Award,
} from "lucide-react"

interface GameSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  userData: any
  notifications?: number
  isOpen: boolean
  onClose: () => void
  onOpenBankingModal: (tab: string) => void // New prop
}

export default function GameSidebar({
  activeView,
  onViewChange,
  userData,
  notifications = 0,
  isOpen,
  onClose,
  onOpenBankingModal, // Destructure new prop
}: GameSidebarProps) {
  const handleViewChange = (view: string) => {
    if (view === "deposits") {
      onOpenBankingModal("deposit")
    } else if (view === "withdrawals") {
      onOpenBankingModal("withdraw")
    } else if (view === "banking") {
      onOpenBankingModal("deposit") // Default to deposit tab when opening banking center
    } else {
      onViewChange(view)
    }
    onClose() // Close sidebar on mobile after selection
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview & Game Stats",
      category: "main",
    },
    {
      id: "games",
      label: "Casino Games",
      icon: Gamepad2,
      description: "Blackjack, Slots & More",
      category: "main",
      badge: "Play Now",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Trophy,
      description: "Unlock Rewards & Badges",
      category: "main",
    },
    {
      id: "deposits",
      label: "Crypto Deposits",
      icon: TrendingUp,
      description: "TRX, BTC, TRC20",
      category: "banking",
      badge: "Fast",
    },
    {
      id: "withdrawals",
      label: "TRC20 Withdrawals",
      icon: TrendingDown,
      description: "Secure & Quick Payouts",
      category: "banking",
    },
    {
      id: "history",
      label: "Transaction History",
      icon: History,
      description: "All Your Transactions",
      category: "banking",
    },
    {
      id: "banking",
      label: "Banking Center",
      icon: Wallet,
      description: "Complete Banking Hub",
      category: "banking",
      badge: "New",
    },
    {
      id: "analytics",
      label: "Game Analytics",
      icon: BarChart3,
      description: "Performance & Statistics",
      category: "tools",
    },
    {
      id: "chat",
      label: "Live Chat",
      icon: MessageCircle,
      description: "Chat with Players",
      category: "social",
      badge: notifications > 0 ? notifications.toString() : undefined,
    },
    {
      id: "referrals",
      label: "Referral Program",
      icon: Gift,
      description: "Invite Friends & Earn",
      category: "social",
      badge: "Earn $25",
    },
    {
      id: "leaderboard",
      label: "Leaderboards",
      icon: Award,
      description: "Top Players & Rankings",
      category: "social",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
      description: "Account & Preferences",
      category: "account",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Alerts & Updates",
      category: "account",
      badge: notifications > 0 ? notifications.toString() : undefined,
    },
    {
      id: "security",
      label: "Security Center",
      icon: Shield,
      description: "2FA & Account Security",
      category: "account",
    },
    {
      id: "settings",
      label: "Game Settings",
      icon: Settings,
      description: "Sound, Display & More",
      category: "account",
    },
    {
      id: "support",
      label: "Help & Support",
      icon: HelpCircle,
      description: "FAQ & Contact Support",
      category: "help",
    },
  ]

  const categories = {
    main: "Game & Entertainment",
    banking: "Banking & Payments",
    social: "Social & Community",
    tools: "Tools & Analytics",
    account: "Account Management",
    help: "Help & Support",
  }

  const getMenuItemsByCategory = (category: string) => {
    return menuItems.filter((item) => item.category === category)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-80 bg-gradient-to-b from-green-900 to-green-800 border-r border-white/10 p-0"
      >
        <SheetHeader className="p-4 border-b border-white/20">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Crown className="h-5 w-5 text-yellow-500" />
            Casino Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-4 border-b border-white/20">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{userData?.name?.charAt(0) || "P"}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{userData?.name || "Player"}</p>
                  <p className="text-white/70 text-sm">{userData?.email || "player@casino.com"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 text-xs">
                      {userData?.role || "Player"}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                      Level {userData?.level || 1}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Balance and Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-2xl font-bold text-yellow-400">${(userData?.balance || 0).toFixed(2)}</p>
                  <p className="text-white/70 text-xs">Balance</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-2xl font-bold text-green-400">{userData?.totalWins || 0}</p>
                  <p className="text-white/70 text-xs">Total Wins</p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleViewChange("deposits")} // This will now open BankingModal on deposit tab
                  className="bg-green-600 hover:bg-green-700 text-xs flex-1"
                >
                  <Bitcoin className="h-3 w-3 mr-1" />
                  Deposit
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleViewChange("withdrawals")} // This will now open BankingModal on withdraw tab
                  className="bg-red-600 hover:bg-red-700 text-xs flex-1"
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
                const categoryItems = getMenuItemsByCategory(categoryKey)
                if (categoryItems.length === 0) return null

                return (
                  <div key={categoryKey}>
                    <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">{categoryLabel}</h3>
                    <div className="space-y-2">
                      {categoryItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeView === item.id

                        return (
                          <Button
                            key={item.id}
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start text-left h-auto p-3 ${
                              isActive
                                ? "bg-white/20 text-white hover:bg-white/25"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                            onClick={() => handleViewChange(item.id)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="relative">
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {item.badge && item.badge !== "New" && (
                                  <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                                  >
                                    {item.badge.length > 3 ? "!" : item.badge}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium truncate">{item.label}</span>
                                  {item.badge && (
                                    <Badge
                                      variant={
                                        item.badge === "New"
                                          ? "secondary"
                                          : item.badge === "Fast"
                                            ? "default"
                                            : item.badge.startsWith("Earn")
                                              ? "secondary"
                                              : "outline"
                                      }
                                      className={`ml-2 text-xs ${
                                        item.badge === "New"
                                          ? "bg-blue-500/20 text-blue-300"
                                          : item.badge === "Fast"
                                            ? "bg-green-500/20 text-green-300"
                                            : item.badge.startsWith("Earn")
                                              ? "bg-yellow-500/20 text-yellow-300"
                                              : ""
                                      }`}
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs opacity-70 truncate">{item.description}</p>
                              </div>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="p-4 border-t border-white/20">
            <div className="bg-white/5 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-white/70 text-sm font-medium">Casino Stats</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <p className="text-white font-bold">1,247</p>
                  <p className="text-white/60">Online Players</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">$2.4M</p>
                  <p className="text-white/60">Daily Volume</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <p className="text-green-400 font-bold">98.5%</p>
                  <p className="text-white/60">Payout Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 font-bold">24/7</p>
                  <p className="text-white/60">Support</p>
                </div>
              </div>

              {/* Player Level Progress */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-xs">Level Progress</span>
                  <span className="text-white/70 text-xs">{userData?.xp || 0}/1000 XP</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((userData?.xp || 0) / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
