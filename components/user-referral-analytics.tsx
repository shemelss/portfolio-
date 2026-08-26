"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Copy, Check, Gift, Users, Share2, QrCode, DollarSign } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import ReferralQRCode from "./referral-qr-code"

interface Referral {
  id: number
  email: string
  status: "pending" | "registered" | "deposited"
  timestamp: Date
  bonusPaid: boolean
}

interface UserReferralAnalyticsProps {
  userData: {
    id: string
    name: string
    email: string
    referralCode: string
  }
}

const REFERRAL_BONUS = 25
const REFERRAL_BONUS_THRESHOLD = 3 // Number of deposited referrals for a bonus

export default function UserReferralAnalytics({ userData }: UserReferralAnalyticsProps) {
  const [referralEmail, setReferralEmail] = useState("")
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralLinkCopied, setReferralLinkCopied] = useState(false)

  useEffect(() => {
    // Load referrals from localStorage for the current user
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const currentUser = users.find((u: any) => u.id === userData.id)
      if (currentUser && currentUser.referrals) {
        const loadedReferrals = currentUser.referrals.map((ref: any) => ({
          ...ref,
          timestamp: new Date(ref.timestamp),
        }))
        setReferrals(loadedReferrals)
      }
    } catch (error) {
      console.error("Error loading referrals:", error)
    }
  }, [userData.id])

  const saveReferralsToLocalStorage = (updatedReferrals: Referral[]) => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === userData.id)
      if (userIndex !== -1) {
        users[userIndex].referrals = updatedReferrals
        localStorage.setItem("users", JSON.stringify(users))
      }
    } catch (error) {
      console.error("Error saving referrals:", error)
    }
  }

  const handleReferralSubmit = () => {
    if (!referralEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the referral.",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(referralEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    const newReferral: Referral = {
      id: Date.now(),
      email: referralEmail,
      status: "pending",
      timestamp: new Date(),
      bonusPaid: false,
    }

    const updatedReferrals = [...referrals, newReferral]
    setReferrals(updatedReferrals)
    saveReferralsToLocalStorage(updatedReferrals)

    toast({
      title: "Referral Sent!",
      description: `Referral invitation sent to ${referralEmail}. You'll earn $${REFERRAL_BONUS} when they make their first crypto deposit!`,
    })

    setReferralEmail("")
  }

  const getReferralLink = () => {
    return `${window.location.origin}/?ref=${userData.referralCode}`
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(getReferralLink()).then(() => {
      setReferralLinkCopied(true)
      setTimeout(() => setReferralLinkCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      })
    })
  }

  const completedReferrals = referrals.filter((ref) => ref.status === "deposited").length
  const totalEarned = completedReferrals * REFERRAL_BONUS
  const referralProgress = (completedReferrals / REFERRAL_BONUS_THRESHOLD) * 100

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Gift className="h-6 w-6 text-green-500" />
        Referral Program
      </h2>
      <p className="text-muted-foreground">Invite your friends to Casino Royale and earn exciting bonuses!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Referral Stats */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Your Referral Statistics
            </CardTitle>
            <CardDescription>Overview of your referral activity and earnings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">{referrals.length}</div>
                <div className="text-sm text-muted-foreground">Total Invitations Sent</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{completedReferrals}</div>
                <div className="text-sm text-muted-foreground">Friends Joined & Deposited</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">${totalEarned.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bonus Progress */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Next Bonus Progress
            </CardTitle>
            <CardDescription>Complete more referrals to earn your next bonus!</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={referralProgress} className="mb-2 h-3" />
            <div className="text-sm text-muted-foreground">
              {completedReferrals} of {REFERRAL_BONUS_THRESHOLD} referrals completed for next bonus.
              <br />
              Next bonus: ${REFERRAL_BONUS}
            </div>
          </CardContent>
        </Card>

        {/* Share Your Link */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" /> Share Your Link
            </CardTitle>
            <CardDescription>Copy and share your unique referral link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="referral-link">Your Referral Link</Label>
            <div className="flex gap-2">
              <Input id="referral-link" value={getReferralLink()} readOnly className="font-mono text-sm flex-1" />
              <Button variant="outline" onClick={copyReferralLink}>
                {referralLinkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Share Your QR Code */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Share Your QR Code
            </CardTitle>
            <CardDescription>Friends can scan this to register with your code.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <ReferralQRCode referralCode={userData.referralCode} />
          </CardContent>
        </Card>

        {/* Send Email Invitation */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" /> Send Invitation
            </CardTitle>
            <CardDescription>Send a direct email invitation to your friends.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="referral-email">Friend's Email</Label>
            <div className="flex gap-2">
              <Input
                id="referral-email"
                type="email"
                placeholder="Enter friend's email"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleReferralSubmit}>
                <Share2 className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral List */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Your Referred Friends
            </CardTitle>
            <CardDescription>Track the status of your invited friends.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{referral.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Invited: {referral.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        referral.status === "deposited"
                          ? "text-green-600"
                          : referral.status === "registered"
                            ? "text-blue-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {referral.status === "deposited"
                        ? "Completed (Deposited)"
                        : referral.status === "registered"
                          ? "Registered"
                          : "Pending Registration"}
                    </div>
                    {referral.bonusPaid && <div className="text-xs text-green-600">+${REFERRAL_BONUS} Bonus Paid</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
