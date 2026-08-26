"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, Copy, Check, Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import UserProfileSettings from "./user-profile-settings"

// Update the UserProfileProps to include balance and banking functions
type UserProfileProps = {
  userData: {
    id: string
    name: string
    email: string
    referralCode: string
  }
  balance?: number
  onDeposit?: (amount: number) => void
  onWithdraw?: (amount: number) => void
}

export default function UserProfile({
  userData,
  balance = 0,
  onDeposit = () => {},
  onWithdraw = () => {},
}: UserProfileProps) {
  const [copied, setCopied] = useState(false)
  const [initials, setInitials] = useState("")

  useEffect(() => {
    // Generate initials from name
    if (userData.name) {
      const nameParts = userData.name.split(" ")
      const initials = nameParts.map((part) => part[0]).join("")
      setInitials(initials.toUpperCase())
    }
  }, [userData.name])

  const handleLogout = () => {
    try {
      // Clear auth cookie
      document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"

      // Clear localStorage
      localStorage.removeItem("currentUser")

      // Show logout message
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })

      // Redirect to login page with absolute URL
      const baseUrl = window.location.origin
      window.location.href = baseUrl
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const copyReferralCode = () => {
    try {
      // Make sure we have a valid referral code
      if (!userData.referralCode) {
        console.error("No referral code available to copy")
        toast({
          title: "Error",
          description: "No referral code available to copy",
          variant: "destructive",
        })
        return
      }

      console.log("Copying referral code:", userData.referralCode)

      // Use the clipboard API
      navigator.clipboard
        .writeText(userData.referralCode)
        .then(() => {
          setCopied(true)

          toast({
            title: "Referral Code Copied",
            description: "Share this code with friends to earn bonuses!",
          })

          setTimeout(() => setCopied(false), 2000)
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err)

          // Fallback method
          const textarea = document.createElement("textarea")
          textarea.value = userData.referralCode
          textarea.style.position = "fixed"
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()

          try {
            const successful = document.execCommand("copy")
            if (successful) {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)

              toast({
                title: "Referral Code Copied",
                description: "Share this code with friends to earn bonuses!",
              })
            } else {
              throw new Error("Copy command failed")
            }
          } catch (err) {
            console.error("execCommand failed:", err)
            toast({
              title: "Copy Failed",
              description: "Your referral code is: " + userData.referralCode,
              variant: "destructive",
            })
          } finally {
            document.body.removeChild(textarea)
          }
        })
    } catch (error) {
      console.error("Error in copyReferralCode:", error)
      toast({
        title: "Error",
        description: "Failed to copy referral code. Please try again.",
        variant: "destructive",
      })
    }
  }

  const shareReferral = async () => {
    const shareUrl = `${window.location.origin}/?ref=${encodeURIComponent(userData.referralCode)}`
    const shareMessage = `Join me at Royal Casino and get a welcome gift. Use my referral code: ${userData.referralCode}\n${shareUrl}`

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareMessage)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = shareMessage
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      toast({ title: "Invite link copied", description: "Paste it into WhatsApp, Messenger, email, or SMS." })
    } catch {
      toast({ title: "Copy failed", description: `Share this code manually: ${userData.referralCode}`, variant: "destructive" })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-yellow-500">
            <AvatarFallback className="bg-green-700 text-yellow-400">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userData.name}</p>
            <p className="text-xs text-muted-foreground">{userData.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between items-center cursor-pointer" onClick={copyReferralCode}>
          <div className="flex items-center">
            <span className="mr-2 text-xs">Referral Code: {userData.referralCode}</span>
          </div>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={shareReferral}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share invite link</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <UserProfileSettings
            userData={userData}
            balance={balance}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
            trigger={
              <div className="flex items-center w-full cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </div>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
