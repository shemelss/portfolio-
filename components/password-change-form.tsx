"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuditLogger } from "@/hooks/use-audit-logger"

interface PasswordChangeFormProps {
  userId: string
}

export default function PasswordChangeForm({ userId }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const auditLogger = useAuditLogger()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate API call for password change
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real application, you would send currentPassword, newPassword to your backend
    // and validate them against the user's actual credentials.
    // For this demo, we'll simulate success/failure based on a simple condition.
    const isSuccess = currentPassword === "password123" // Mock validation

    if (isSuccess) {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
        variant: "default",
      })
      auditLogger.logAuthAction("Password Change Success", { userId: userId })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } else {
      toast({
        title: "Password Change Failed",
        description: "Incorrect current password or other error. Please try again.",
        variant: "destructive",
      })
      auditLogger.logAuthAction("Password Change Failed", { userId: userId })
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" /> Change Password
        </CardTitle>
        <CardDescription>Update your account password for enhanced security.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
