"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, Info, Gift, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReferralQRCode from "./referral-qr-code"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReferralCodeTesterProps {
  onTest?: (code: string, result: string) => void
}

export default function ReferralCodeTester({ onTest }: ReferralCodeTesterProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("validate")
  const [referralCode, setReferralCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    referrer?: { name: string; email: string; referralCode: string }
    bonus?: number
    message?: string
  } | null>(null)

  // For the generator tab
  const [generatedCode, setGeneratedCode] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<{
    success: boolean
    code?: string
    message?: string
  } | null>(null)

  // For the statistics tab
  const [stats, setStats] = useState<{
    totalCodes: number
    validCodes: number
    usedCodes: number
    topCodes: Array<{ code: string; uses: number }>
  }>({
    totalCodes: 0,
    validCodes: 0,
    usedCodes: 0,
    topCodes: [],
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Load statistics when the dialog opens
  useEffect(() => {
    if (open && activeTab === "stats") {
      loadStatistics()
    }
  }, [open, activeTab])

  const validateReferralCode = () => {
    if (!referralCode.trim()) {
      setValidationResult({
        isValid: false,
        message: "Please enter a referral code to validate",
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      console.log("Validating referral code:", referralCode)

      // Normalize the code (trim whitespace and convert to uppercase)
      const normalizedCode = referralCode.trim().toUpperCase()
      console.log("Normalized code:", normalizedCode)

      // Get users from localStorage
      const usersString = localStorage.getItem("users")
      console.log("Users string exists:", !!usersString)

      // Check if users exist
      if (!usersString || usersString === "[]") {
        console.log("No users found in localStorage")
        setValidationResult({
          isValid: false,
          message: "No users found in the system. Please try again later.",
        })
        setIsValidating(false)
        return
      }

      const users = JSON.parse(usersString)
      console.log("Found users:", users.length)

      // Log all available referral codes for debugging
      const availableCodes = users.map((u: any) => u.referralCode)
      console.log("Available referral codes:", availableCodes)

      // Find referrer with case-insensitive comparison
      const referrer = users.find((u: any) => u.referralCode && u.referralCode.trim().toUpperCase() === normalizedCode)

      console.log("Referrer found:", referrer ? "Yes" : "No")

      if (referrer) {
        setValidationResult({
          isValid: true,
          referrer: {
            name: referrer.name,
            email: referrer.email,
            referralCode: referrer.referralCode,
          },
          bonus: 5, // $5 bonus for using a referral code
        })
        console.log("Valid referral code from:", referrer.name)
      } else {
        setValidationResult({
          isValid: false,
          message: "Invalid referral code. This code doesn't match any user in our system.",
        })
        console.log("No matching referral code found")
      }
    } catch (error) {
      console.error("Error validating referral code:", error)
      setValidationResult({
        isValid: false,
        message: "An error occurred while validating the referral code. Please try again.",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const generateReferralCode = () => {
    if (!userName.trim() || !userEmail.trim()) {
      setGenerationResult({
        success: false,
        message: "Please enter both name and email to generate a referral code",
      })
      return
    }

    setIsGenerating(true)
    setGenerationResult(null)

    try {
      // Generate a unique referral code
      const prefix = userName.trim().substring(0, 3).toUpperCase()
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
      const newCode = `${prefix}${randomPart}`

      setGeneratedCode(newCode)
      setGenerationResult({
        success: true,
        code: newCode,
        message: "Referral code generated successfully!",
      })

      // In a real app, you would save this to the database
      // For this demo, we'll just simulate it
      setTimeout(() => {
        toast({
          title: "Referral Code Generated",
          description: `Your new referral code is: ${newCode}`,
        })
      }, 500)
    } catch (error) {
      console.error("Error generating referral code:", error)
      setGenerationResult({
        success: false,
        message: "An error occurred while generating the referral code. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const loadStatistics = () => {
    setIsLoadingStats(true)

    try {
      // In a real app, this would be an API call
      // For this demo, we'll calculate stats from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Count total valid codes (users with referral codes)
      const validCodes = users.filter((u: any) => u.referralCode).length

      // Count used codes (users with referrals)
      const usedCodes = users.filter((u: any) => u.referrals && u.referrals.length > 0).length

      // Calculate top codes by usage
      const codeUsage = users.reduce((acc: Record<string, number>, user: any) => {
        if (user.referrals && user.referrals.length > 0 && user.referralCode) {
          acc[user.referralCode] = user.referrals.length
        }
        return acc
      }, {})

      const topCodes = Object.entries(codeUsage)
        .map(([code, uses]) => ({ code, uses: uses as number }))
        .sort((a, b) => b.uses - a.uses)
        .slice(0, 5)

      setStats({
        totalCodes: users.length,
        validCodes,
        usedCodes,
        topCodes,
      })
    } catch (error) {
      console.error("Error loading statistics:", error)
      toast({
        title: "Error",
        description: "Failed to load referral statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when dialog closes
      setReferralCode("")
      setValidationResult(null)
      setGeneratedCode("")
      setUserName("")
      setUserEmail("")
      setGenerationResult(null)
      setIsLoading(false)
      setTestResult(null)
    }
  }

  const simulateReferralProcess = async () => {
    setIsLoading(true)
    setTestResult(null)

    // Simulate a complex referral process with different outcomes
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate network delay

    let resultMessage: string
    const lowerCaseCode = referralCode.toLowerCase()

    if (lowerCaseCode.includes("success")) {
      resultMessage = "Referral successfully applied and bonus granted!"
      toast({
        title: "Test Success",
        description: resultMessage,
        variant: "default",
      })
    } else if (lowerCaseCode.includes("invalid")) {
      resultMessage = "Referral code is invalid or expired."
      toast({
        title: "Test Failed",
        description: resultMessage,
        variant: "destructive",
      })
    } else if (lowerCaseCode.includes("alreadyused")) {
      resultMessage = "This referral code has already been used."
      toast({
        title: "Test Failed",
        description: resultMessage,
        variant: "destructive",
      })
    } else if (lowerCaseCode.includes("pending")) {
      resultMessage = "Referral is pending review. Bonus will be applied soon."
      toast({
        title: "Test Pending",
        description: resultMessage,
        variant: "default",
      })
    } else {
      resultMessage = "Referral process completed with an unknown outcome."
      toast({
        title: "Test Complete",
        description: resultMessage,
        variant: "default",
      })
    }

    setTestResult(resultMessage)
    setIsLoading(false)
    onTest?.(referralCode, resultMessage)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Gift className="h-4 w-4" />
          <span>Referral Code Tester</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-500" />
            Referral Code Testing Tool
          </DialogTitle>
          <DialogDescription>Test, validate, and generate referral codes for the system.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="validate">Validate</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="validate" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="referral-code">Enter Referral Code</Label>
              <div className="flex gap-2">
                <Input
                  id="referral-code"
                  placeholder="e.g., WELCOME50"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button onClick={validateReferralCode} disabled={isValidating || !referralCode.trim()}>
                  {isValidating ? "Checking..." : "Validate"}
                </Button>
              </div>
            </div>

            {validationResult && (
              <div className="mt-4">
                {validationResult.isValid ? (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      <span className="font-bold">Valid referral code!</span> You've been referred by{" "}
                      {validationResult.referrer?.name}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationResult.message}</AlertDescription>
                  </Alert>
                )}

                {validationResult.isValid && validationResult.referrer && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium">Referrer Information</h4>
                          <p className="text-sm text-muted-foreground">{validationResult.referrer.name}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Referral Code</h4>
                          <div className="flex items-center gap-2">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {validationResult.referrer.referralCode}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => copyToClipboard(validationResult.referrer?.referralCode || "")}
                            >
                              <span className="sr-only">Copy</span>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Your Bonus</h4>
                          <p className="text-sm text-green-600 dark:text-green-400 font-bold">
                            ${validationResult.bonus} bonus when you register
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!validationResult.isValid && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Available Test Codes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start bg-transparent"
                        onClick={() => {
                          setReferralCode("SAMPLE123")
                          validateReferralCode()
                        }}
                      >
                        <code className="text-xs">SAMPLE123</code>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start bg-transparent"
                        onClick={() => {
                          setReferralCode("WELCOME50")
                          validateReferralCode()
                        }}
                      >
                        <code className="text-xs">WELCOME50</code>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      These are sample referral codes you can use for testing.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!validationResult && !isValidating && (
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  Enter a referral code to check if it's valid and see what bonus you'll receive.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="generate" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Your Name</Label>
              <Input
                id="user-name"
                placeholder="John Doe"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Your Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="you@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="flex-1"
              />
            </div>

            <Button
              onClick={generateReferralCode}
              disabled={isGenerating || !userName.trim() || !userEmail.trim()}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Referral Code"}
            </Button>

            {generationResult && (
              <div className="mt-4">
                {generationResult.success ? (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      {generationResult.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{generationResult.message}</AlertDescription>
                  </Alert>
                )}

                {generationResult.success && generationResult.code && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium">Your Referral Code</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {generationResult.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => copyToClipboard(generationResult.code || "")}
                            >
                              <span className="sr-only">Copy</span>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Referral Link</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs truncate max-w-[200px]">
                              {`${window.location.origin}?ref=${generationResult.code}`}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 flex-shrink-0"
                              onClick={() => copyToClipboard(`${window.location.origin}?ref=${generationResult.code}`)}
                            >
                              <span className="sr-only">Copy</span>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Referral QR Code</h4>
                          <div className="flex justify-center mt-2">
                            <ReferralQRCode referralCode={generationResult.code} size={150} />
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <p className="text-xs text-blue-800 dark:text-blue-300">
                              Share this code with friends. When they register using your code, they'll get a $5 bonus
                              and you'll earn $25 when they make their first deposit.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!generationResult && !isGenerating && (
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  Enter your information to generate a unique referral code you can share with friends.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Referral Code Statistics</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStatistics}
                disabled={isLoadingStats}
                className="h-8 px-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingStats ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {isLoadingStats ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.totalCodes}</div>
                      <div className="text-xs text-muted-foreground">Total Users</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.validCodes}</div>
                      <div className="text-xs text-muted-foreground">Valid Codes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stats.usedCodes}</div>
                      <div className="text-xs text-muted-foreground">Used Codes</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Top Performing Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stats.topCodes.length > 0 ? (
                      <div className="space-y-2">
                        {stats.topCodes.map((code, index) => (
                          <div key={index} className="flex justify-between items-center py-1 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{index + 1}.</span>
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{code.code}</code>
                            </div>
                            <div className="text-sm">{code.uses} uses</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No referral data available yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
                    These statistics show the performance of referral codes in the system. Top performing codes are
                    those that have been used the most times.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="sm:flex-1">
            Close
          </Button>
          <Button
            variant="link"
            className="gap-1"
            onClick={() => {
              window.open(`${window.location.origin}?ref=SAMPLE123`, "_blank")
            }}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Test Referral Link</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
