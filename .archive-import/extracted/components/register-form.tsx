"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, Info, Eye, EyeOff } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

type RegisterFormProps = {
  onSuccess: (userData: any) => void
  onLoginClick: () => void
  initialReferralCode?: string
}

export default function RegisterForm({ onSuccess, onLoginClick, initialReferralCode = "" }: RegisterFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCode, setReferralCode] = useState(initialReferralCode)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; email: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Use effect to update referral code if initialReferralCode changes
  useEffect(() => {
    if (initialReferralCode) {
      console.log("Setting initial referral code:", initialReferralCode)
      setReferralCode(initialReferralCode)
      validateReferralCode(initialReferralCode)
    }
  }, [initialReferralCode])

  // Validate referral code and show referrer info if valid
  const validateReferralCode = (code: string) => {
    if (!code) {
      setReferrerInfo(null)
      return
    }

    try {
      console.log("Validating referral code:", code)

      // Normalize the code (trim whitespace and convert to uppercase)
      const normalizedCode = code.trim().toUpperCase()
      console.log("Normalized code:", normalizedCode)

      // Get users from localStorage
      const usersString = localStorage.getItem("users")
      console.log("Users string exists:", !!usersString)

      // Initialize users array if it doesn't exist
      if (!usersString || usersString === "[]") {
        console.log("No users found in localStorage, creating sample user")

        // Create a sample user with a referral code for testing
        const sampleUser = {
          id: "sample1",
          name: "Sample User",
          email: "sample@example.com",
          password: "Password123!",
          referralCode: "SAMPLE123",
          balance: 100,
          referrals: [],
        }

        localStorage.setItem("users", JSON.stringify([sampleUser]))
        console.log("Sample user created with referral code:", sampleUser.referralCode)

        // Check if the entered code matches our sample user
        if (normalizedCode === "SAMPLE123") {
          setReferrerInfo({
            name: sampleUser.name,
            email: sampleUser.email,
          })
          return
        }
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]")
      console.log("Found users:", users.length)

      // Log all available referral codes for debugging
      const availableCodes = users.map((u: any) => u.referralCode)
      console.log("Available referral codes:", availableCodes)

      // Find referrer with case-insensitive comparison
      const referrer = users.find((u: any) => u.referralCode && u.referralCode.trim().toUpperCase() === normalizedCode)

      console.log("Referrer found:", referrer ? "Yes" : "No")

      if (referrer) {
        setReferrerInfo({
          name: referrer.name,
          email: referrer.email,
        })
        console.log("Referrer info set:", referrer.name)
      } else {
        setReferrerInfo(null)
      }
    } catch (error) {
      console.error("Error validating referral code:", error)
      setReferrerInfo(null)
    }
  }

  // Validate referral code when it changes
  useEffect(() => {
    validateReferralCode(referralCode)
  }, [referralCode])

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)
  const passwordsMatch = password === confirmPassword

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasLowercase && hasSpecialChar
  const isFormValid = name && email && isPasswordValid && passwordsMatch

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // Update the handleSubmit function to ensure proper registration flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    setError(null)

    if (!isFormValid) {
      setError("Please fix the errors in the form")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would be an API call to your backend
      // For this demo, we'll simulate registration

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user database (in a real app, this would be on the server)
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      console.log("Current users:", users.length)

      // Check if email already exists
      if (users.some((u: any) => (u.email ?? "").toString().trim().toLowerCase() === normalizedEmail)) {
        toast({
          title: "Email already registered",
          description: "Please sign in instead.",
          variant: "destructive",
        })

        // surface the error under the form as well
        setError("Email already registered. Please sign in.")

        // after a short delay, automatically flip to the login screen
        setTimeout(() => {
          onLoginClick()
        }, 300)

        return // stop further processing
      }

      // Check if referral code is valid (if provided)
      let referrerFound = false
      let referrer = null
      if (referralCode) {
        console.log("Checking referral code during registration:", referralCode)

        // Normalize the code
        const normalizedCode = referralCode.trim().toUpperCase()

        // Find the referrer by their referral code (case-insensitive)
        referrer = users.find((u: any) => u.referralCode && u.referralCode.trim().toUpperCase() === normalizedCode)

        referrerFound = !!referrer
        console.log("Referrer found during registration:", referrerFound)

        if (referrerFound) {
          console.log("Valid referrer:", referrer.name)
        } else {
          // Check if this is our sample code
          if (normalizedCode === "SAMPLE123") {
            referrerFound = true
            referrer = users.find((u: any) => u.referralCode === "SAMPLE123")
            if (!referrer && users.length > 0) {
              // Assign the referral to the first user if sample user doesn't exist
              referrer = users[0]
              referrerFound = true
            }
          } else {
            console.log("No matching referral code found")
            throw new Error("Invalid referral code. Please check and try again.")
          }
        }
      }

      // Generate unique referral code for new user
      const newReferralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      console.log("Generated new referral code:", newReferralCode)

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email: normalizedEmail,
        password, // In a real app, this would be hashed
        role: "user", // Add default role
        referralCode: newReferralCode,
        referredBy: referralCode || null,
        balance: referralCode && referrerFound ? 15 : 10,
        registeredAt: new Date().toISOString(),
        referrals: [],
      }

      // Add user to "database"
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      console.log("User registered successfully:", newUser.email)

      // If referral code was used, update referrer's stats
      if (referralCode && referrerFound && referrer) {
        // In a real app, this would be a separate API call
        // For this demo, we'll update the referrer in our mock database
        const updatedUsers = users.map((u: any) => {
          if (u.referralCode === referralCode) {
            // Add to referrer's referrals
            const referrals = u.referrals || []
            referrals.push({
              id: Date.now(),
              userId: newUser.id,
              email: normalizedEmail,
              status: "registered",
              timestamp: new Date(),
              bonusPaid: false,
            })
            console.log("Updated referrer's referrals:", referrals.length)
            return { ...u, referrals }
          }
          return u
        })
        localStorage.setItem("users", JSON.stringify(updatedUsers))

        // Show success toast about the referral
        toast({
          title: "Referral Applied",
          description: `You've been referred by ${referrer.name}. You received a $5 bonus!`,
        })
      }

      // Registration successful
      const userData = {
        id: newUser.id,
        email: normalizedEmail,
        name: newUser.name,
        referralCode: newUser.referralCode,
      }

      // Show success message
      toast({
        title: "Registration Successful",
        description: "Your account has been created! Redirecting to the game...",
      })

      // Call success callback
      onSuccess(userData)
    } catch (err: any) {
      console.error("Registration error:", err.message)
      setError(err.message || "An error occurred during registration")
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
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Input
            id="register-password"
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

        <div className="text-xs space-y-1 mt-1">
          <div className="flex items-center gap-1">
            <span className={hasMinLength ? "text-green-500" : "text-gray-400"}>
              {hasMinLength ? <Check size={12} /> : "•"}
            </span>
            <span className={hasMinLength ? "text-green-500" : "text-gray-400"}>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={hasUppercase ? "text-green-500" : "text-gray-400"}>
              {hasUppercase ? <Check size={12} /> : "•"}
            </span>
            <span className={hasUppercase ? "text-green-500" : "text-gray-400"}>At least one uppercase letter</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={hasLowercase ? "text-green-500" : "text-gray-400"}>
              {hasLowercase ? <Check size={12} /> : "•"}
            </span>
            <span className={hasLowercase ? "text-green-500" : "text-gray-400"}>At least one lowercase letter</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={hasNumber ? "text-green-500" : "text-gray-400"}>
              {hasNumber ? <Check size={12} /> : "•"}
            </span>
            <span className={hasNumber ? "text-green-500" : "text-gray-400"}>At least one number</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={hasSpecialChar ? "text-green-500" : "text-gray-400"}>
              {hasSpecialChar ? <Check size={12} /> : "•"}
            </span>
            <span className={hasSpecialChar ? "text-green-500" : "text-gray-400"}>At least one special character</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {confirmPassword && !passwordsMatch && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="referral-code" className="flex items-center gap-1">
          Referral Code <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="referral-code"
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
        />

        {referralCode && !referrerInfo && (
          <Alert className="py-2 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-300">
              This referral code will be validated when you register.
            </AlertDescription>
          </Alert>
        )}

        {referrerInfo && (
          <Alert className="py-2 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
              <span className="font-bold">Valid referral code!</span> You've been referred by {referrerInfo.name}.
              You'll receive a $5 bonus when you register!
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading || !isFormValid}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Button variant="link" className="p-0 h-auto" onClick={onLoginClick}>
          Sign in
        </Button>
      </div>
    </form>
  )
}
