"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, Settings, LogOut, Trophy, BarChart3, Crown, Shield, Gamepad2, Target } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface GameHeaderProps {
  userData: any
  onMenuClick: () => void
  activeView: "game" | "stats" | "achievements" | "leaderboard"
  onViewChange: (view: "game" | "stats" | "achievements" | "leaderboard") => void
}

export default function GameHeader({ userData, onMenuClick, activeView, onViewChange }: GameHeaderProps) {
  const [balance, setBalance] = useState(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.id === userData?.id)
    return user?.balance || 10
  })

  const handleLogout = () => {
    try {
      // Clear auth cookie
      document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"

      // Clear localStorage
      localStorage.removeItem("currentUser")

      // Show logout message
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out. See you next time!",
      })

      // Redirect to login page
      window.location.href = "/"
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const navigateToAdmin = () => {
    if (userData?.role === "admin") {
      window.location.href = "/admin"
    } else {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access the admin panel.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:px-4">
        {/* Left Side - Menu & Logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <Crown className="h-5 w-5 shrink-0 text-yellow-500 sm:h-6 sm:w-6" />
            <span className="truncate text-base font-bold text-white sm:text-xl">Royal Casino</span>
          </div>
        </div>

        {/* Center - Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant={activeView === "game" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("game")}
            className={activeView === "game" ? "" : "text-white hover:bg-white/10"}
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Game
          </Button>
          <Button
            variant={activeView === "stats" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("stats")}
            className={activeView === "stats" ? "" : "text-white hover:bg-white/10"}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Stats
          </Button>
          <Button
            variant={activeView === "achievements" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("achievements")}
            className={activeView === "achievements" ? "" : "text-white hover:bg-white/10"}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </Button>
          <Button
            variant={activeView === "leaderboard" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("leaderboard")}
            className={activeView === "leaderboard" ? "" : "text-white hover:bg-white/10"}
          >
            <Target className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
        </div>

        {/* Right Side - User Info & Actions */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-4">
          {/* Balance Display */}
          <Badge variant="outline" className="border-yellow-500 bg-black/50 px-2 py-1 text-sm text-white sm:px-3">
            ${balance}
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userData?.name}</span>
                {userData?.role === "admin" && <Shield className="h-4 w-4 text-blue-400" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userData?.name}</p>
                <p className="text-xs text-muted-foreground">{userData?.email}</p>
                {userData?.role && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {userData.role}
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewChange("stats")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Stats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange("achievements")}>
                <Trophy className="mr-2 h-4 w-4" />
                Achievements
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {userData?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={navigateToAdmin}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
