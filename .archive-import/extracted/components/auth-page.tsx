"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "@/components/login-form"
import RegisterForm from "@/components/register-form"
import { toast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuditLogger } from "@/hooks/use-audit-logger"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const auditLogger = useAuditLogger()

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        if (user && user.id) {
          // Redirect based on role
          if (user.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/game")
          }
          return
        }
      } catch (error) {
        console.error("Failed to parse currentUser from localStorage:", error)
        // If parsing fails, clear the invalid data and proceed to auth page
        localStorage.removeItem("currentUser")
      }
    }

    // Check for referral code in URL
    const refCode = searchParams.get("ref")
    if (refCode) {
      localStorage.setItem("referralCode", refCode)
      toast({
        title: "Referral Code Applied",
        description: `You were referred by code: ${refCode}. Register to claim your bonus!`,
      })
      setActiveTab("register") // Switch to register tab if referral code is present
    }
  }, [router, searchParams])

  const handleLoginSuccess = (user: any) => {
    localStorage.setItem("currentUser", JSON.stringify(user))
    auditLogger.logAuthAction("Login Success", { userId: user.id, userEmail: user.email })
    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.name}!`,
    })
    if (user.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/game")
    }
  }

  const handleRegisterSuccess = (user: any) => {
    localStorage.setItem("currentUser", JSON.stringify(user))
    auditLogger.logAuthAction("Registration Success", { userId: user.id, userEmail: user.email })
    toast({
      title: "Registration Successful",
      description: `Welcome to Casino Royale, ${user.name}!`,
    })
    router.push("/game")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm text-white border-white/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-yellow-400">Casino Royale</CardTitle>
          <CardDescription className="text-white/70">Login or Register to start playing!</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <LoginForm onSuccess={handleLoginSuccess} />
            </TabsContent>
            <TabsContent value="register" className="mt-4">
              <RegisterForm onSuccess={handleRegisterSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
