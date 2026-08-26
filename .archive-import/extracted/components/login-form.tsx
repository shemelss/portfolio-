"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuditLogger } from "@/hooks/use-audit-logger"

type LoginFormProps = {
  onSuccess: (userData: any) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const auditLogger = useAuditLogger()

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to your backend
      // For this demo, we'll simulate a login

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user database (in a real app, this would be on the server)
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Find user by email
      const user = users.find((u: any) => u.email === email)

      // Check if user exists and password matches
      if (!user || user.password !== password) {
        // Log failed login attempt
        auditLogger.logLogin(false, {
          email,
          errorReason: "invalid_credentials",
          timestamp: new Date().toISOString(),
        })

        throw new Error("Invalid email or password")
      }

      // Login successful
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user", // Add role to login response
        referralCode: user.referralCode,
      }

      // Log successful login
      auditLogger.logLogin(true, {
        email: userData.email,
        userId: userData.id,
        userRole: userData.role,
        loginMethod: "email_password",
        timestamp: new Date().toISOString(),
      })

      // Show success message
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to the game...",
      })

      // Call success callback
      onSuccess(userData)
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button variant="link" className="p-0 h-auto text-xs" type="button">
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}

export default LoginForm
