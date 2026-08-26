"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gift } from "lucide-react"
import ReferralCodeValidator from "./referral-code-validator"

const initializeUsers = () => {
  try {
    const usersString = localStorage.getItem("users")
    if (!usersString || usersString === "[]") {
      console.log("Initializing sample users")

      // Create sample users with referral codes
      const sampleUsers = [
        {
          id: "admin1",
          name: "Admin User",
          email: "admin@casino.com",
          password: "Admin123!",
          role: "admin", // Add admin role
          referralCode: "ADMIN123",
          balance: 1000,
          referrals: [],
        },
        {
          id: "sample1",
          name: "John Doe",
          email: "john@example.com",
          password: "Password123!",
          role: "user", // Add user role
          referralCode: "SAMPLE123",
          balance: 100,
          referrals: [],
        },
        {
          id: "sample2",
          name: "Jane Smith",
          email: "jane@example.com",
          password: "Password123!",
          role: "user", // Add user role
          referralCode: "WELCOME50",
          balance: 150,
          referrals: [],
        },
      ]

      localStorage.setItem("users", JSON.stringify(sampleUsers))
      console.log("Sample users created with referral codes")
      return true
    }
    return false
  } catch (error) {
    console.error("Error initializing users:", error)
    return false
  }
}

export default function AuthPageWithReferral() {
  const [activeTab, setActiveTab] = useState("login")
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)

  // Check for referral code in URL on component mount
  useEffect(() => {
    // Initialize sample users if needed
    const initialized = initializeUsers()
    if (initialized) {
      console.log("Sample users initialized")
    }

    // Get referral code from URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get("ref")

    if (refCode) {
      console.log("Referral code found in URL:", refCode)
      setReferralCode(refCode)
      setActiveTab("register") // Switch to register tab if referral code is present

      // Try to find referrer name
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]")

        // Log all available referral codes for debugging
        const availableCodes = users.map((u: any) => u.referralCode)
        console.log("Available referral codes:", availableCodes)

        // Normalize the code
        const normalizedCode = refCode.trim().toUpperCase()

        // Find referrer with case-insensitive comparison
        const referrer = users.find(
          (u: any) => u.referralCode && u.referralCode.trim().toUpperCase() === normalizedCode,
        )

        if (referrer) {
          setReferrerName(referrer.name)
          console.log("Referrer found:", referrer.name)
        } else {
          console.log("No referrer found for code:", refCode)
        }
      } catch (error) {
        console.error("Error finding referrer:", error)
      }
    }
  }, [])

  // Function to handle successful authentication
  const handleAuthSuccess = (userData: any) => {
    try {
      // Store user data in localStorage for immediate access
      localStorage.setItem("currentUser", JSON.stringify(userData))

      // Set the auth cookie with proper formatting
      document.cookie = `auth=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax`

      console.log("Auth cookie set:", document.cookie)

      // Show success message
      toast({
        title: "Authentication Successful",
        description: "Redirecting to game...",
      })

      // Use absolute URL for Vercel deployment
      const baseUrl = window.location.origin
      const gameUrl = `${baseUrl}/game`

      console.log("Redirecting to:", gameUrl)

      // Force a hard redirect to the game page with a slight delay to ensure cookie is set
      setTimeout(() => {
        window.location.href = gameUrl
      }, 500)
    } catch (error) {
      console.error("Error during authentication:", error)
      toast({
        title: "Authentication Error",
        description: "There was a problem logging in. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectReferralCode = (code: string) => {
    setReferralCode(code)
    setActiveTab("register")

    // Find referrer name
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const normalizedCode = code.trim().toUpperCase()
      const referrer = users.find((u: any) => u.referralCode && u.referralCode.trim().toUpperCase() === normalizedCode)

      if (referrer) {
        setReferrerName(referrer.name)
      }
    } catch (error) {
      console.error("Error finding referrer:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-green-900 to-green-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-yellow-500">Blackjack Casino</CardTitle>
          <CardDescription>Sign in to play and win big!</CardDescription>
        </CardHeader>

        {referralCode && referrerName && (
          <div className="px-6">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-4">
              <Gift className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <span className="font-bold">You've been referred by {referrerName}!</span>
                <br />
                Register now to receive a $5 bonus. Referral code: <span className="font-mono">{referralCode}</span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {referralCode && !referrerName && (
          <div className="px-6">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-4">
              <Gift className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <span className="font-bold">You're using a referral code!</span>
                <br />
                Register now with code: <span className="font-mono">{referralCode}</span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <CardContent>
          <div className="flex justify-end mb-2">
            <ReferralCodeValidator onSelectCode={handleSelectReferralCode} />
          </div>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSuccess={handleAuthSuccess} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onLoginClick={() => setActiveTab("login")}
                initialReferralCode={referralCode || ""}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  )
}
