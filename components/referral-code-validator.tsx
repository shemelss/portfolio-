"use client"

import { useState } from "react"
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
import { AlertCircle, Check, Info, Gift, Copy, ExternalLink, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import ReferralQRCode from "./referral-qr-code"

type ReferralCodeValidatorProps = {
  onSelectCode?: (code: string) => void
  onValidate?: (code: string, isValid: boolean) => void
}

export default function ReferralCodeValidator({ onSelectCode, onValidate }: ReferralCodeValidatorProps) {
  const [referralCode, setReferralCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    referrer?: { name: string; email: string; referralCode: string }
    bonus?: number
    message?: string
  } | null>(null)
  const [open, setOpen] = useState(false)

  const validateReferralCode = async () => {
    setIsValidating(true)
    setValidationResult(null)

    // Simulate API call or database lookup
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock validation logic
    const validCodes = ["ALPHA123", "BETA456", "GAMMA789"]
    const isValid = validCodes.includes(referralCode.toUpperCase())

    setValidationResult({ isValid })
    setIsValidating(false)

    if (isValid) {
      toast({
        title: "Code Valid",
        description: `Referral code "${referralCode}" is valid!`,
        variant: "default",
      })
    } else {
      toast({
        title: "Code Invalid",
        description: `Referral code "${referralCode}" is not recognized.`,
        variant: "destructive",
      })
    }

    onValidate?.(referralCode, isValid)
  }

  const handleUseCode = () => {
    if (validationResult?.isValid && onSelectCode) {
      onSelectCode(referralCode)
      setOpen(false)
      toast({
        title: "Referral Code Applied",
        description: `You'll receive a $${validationResult.bonus} bonus when you register!`,
      })
    }
  }

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Referral Code Copied",
      description: "The referral code has been copied to your clipboard.",
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when dialog closes
      setReferralCode("")
      setValidationResult(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Gift className="h-4 w-4" />
          <span>Validate Referral Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Referral Code Validator
          </DialogTitle>
          <DialogDescription>Check if a referral code is valid and see what bonus you'll receive.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="referral-code">Enter Referral Code</Label>
            <div className="flex gap-2">
              <Input
                id="referral-code"
                placeholder="e.g., WELCOME50"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="flex-1"
                disabled={isValidating}
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
                            onClick={() => copyReferralCode(validationResult.referrer?.referralCode || "")}
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

                      <div>
                        <h4 className="text-sm font-medium">Referral QR Code</h4>
                        <div className="flex justify-center mt-2">
                          <ReferralQRCode referralCode={validationResult.referrer.referralCode} size={150} />
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <p className="text-xs text-blue-800 dark:text-blue-300">
                            Using this referral code will give you a ${validationResult.bonus} bonus when you register.
                            Your friend will also receive a reward when you make your first deposit.
                          </p>
                        </div>
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
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {validationResult?.isValid && onSelectCode && (
            <Button onClick={handleUseCode} className="bg-green-600 hover:bg-green-700 sm:flex-1">
              Use This Code
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className={onSelectCode && validationResult?.isValid ? "" : "sm:flex-1"}
          >
            {onSelectCode && validationResult?.isValid ? "Cancel" : "Close"}
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
