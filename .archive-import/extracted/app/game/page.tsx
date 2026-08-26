"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import GameHeader from "@/components/game-header"
import GameSidebar from "@/components/game-sidebar"
import BlackjackGame from "@/components/blackjack-game"
import GameStats from "@/components/game-stats"
import GameAchievements from "@/components/game-achievements"
import UserProfileSettings from "@/components/user-profile-settings"
import NotificationSettings from "@/components/notification-settings"
import NotificationCenter from "@/components/notification-center"
import UserTransactionHistory from "@/components/user-transaction-history"
import UserDepositHistory from "@/components/user-deposit-history"
import UserWithdrawalHistory from "@/components/user-withdrawal-history"
import UserReferralAnalytics from "@/components/user-referral-analytics"
import ReferralLeaderboard from "@/components/referral-leaderboard"
import SecurityAnomalyDashboard from "@/components/security-anomaly-dashboard"
import LiveChat from "@/components/live-chat"
import BankingModal from "@/components/banking-modal"
import { useSoundEffects } from "@/hooks/use-sound-effects"
import { useGame } from "@/contexts/game-context"
import { useNotifications } from "@/contexts/notification-context"
import { useLiveNotifications } from "@/contexts/live-notification-context"
import { useInternationalization } from "@/contexts/internationalization-context"
import { useSecurityMonitoring } from "@/contexts/security-monitoring-context"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import { useJackpot } from "@/contexts/jackpot-context"
import JackpotDisplay from "@/components/jackpot-display"
import { toast } from "@/hooks/use-toast"

export default function GamePage() {
  const searchParams = useSearchParams()
  const initialView = searchParams.get("view") || "dashboard"
  const initialBankingTab = searchParams.get("tab") || "deposit"

  const [activeView, setActiveView] = useState(initialView)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isBankingModalOpen, setIsBankingModalOpen] = useState(false)
  const [bankingModalActiveTab, setBankingModalActiveTab] = useState(initialBankingTab)

  // Initialize userData with a default structure to prevent undefined errors
  const [userData, setUserData] = useState<any>({
    id: null,
    name: "",
    email: "",
    balance: 0,
    totalWins: 0,
    totalLosses: 0,
    level: 0,
    xp: 0,
    role: "",
    referralCode: "",
    referrals: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const { playSound } = useSoundEffects()
  // useGame hook now expects userData to be available, so we'll pass it down or ensure it's loaded
  const gameContext = useGame()
  const { notifications, addNotification, acknowledgeNotification, acknowledgeAll, removeNotification } =
    useNotifications()
  const { liveNotifications, addLiveNotification, acknowledgeLiveNotification, clearExpiredLiveNotifications } =
    useLiveNotifications()
  const { currentLanguage, changeLanguage } = useInternationalization()
  const { logSecurityEvent } = useSecurityMonitoring()
  const { logAuditAction } = useAuditLogger()
  const { jackpotAmount } = useJackpot()

  useEffect(() => {
    try {
      const localUserData = localStorage.getItem("currentUser")
      if (localUserData) {
        const parsedUserData = JSON.parse(localUserData)
        setUserData(parsedUserData)
        // Simulate initial data load or fetch
        if (!parsedUserData.id) {
          // If user data is empty, set some defaults
          setUserData((prev: any) => ({
            ...prev,
            id: "user-123",
            name: "CryptoPlayer",
            email: "player@example.com",
            balance: 1000.0,
            totalWins: 50,
            totalLosses: 20,
            level: 5,
            xp: 450,
            role: "Player",
            referralCode: "CRYPTOKING",
            referrals: [],
          }))
        }
      } else {
        // Redirect to login if no user data
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error)
      window.location.href = "/"
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && userData.id) {
      // Simulate a new live notification
      const liveNotifTimer = setTimeout(() => {
        addLiveNotification({
          id: "live-1",
          type: "success",
          title: "Big Win Alert!",
          message: "Another player just hit a $5,000 jackpot on Slots!",
          timestamp: new Date(),
          read: false,
          priority: "high",
          expiresAt: new Date(Date.now() + 60 * 1000), // Expires in 1 minute
        })
      }, 5000)

      // Simulate a regular notification
      const regularNotifTimer = setTimeout(() => {
        addNotification({
          id: "regular-1",
          type: "info",
          title: "Welcome Bonus!",
          message: "Your 100% deposit bonus has been applied to your account.",
          timestamp: new Date(),
          read: false,
        })
      }, 10000)

      return () => {
        clearTimeout(liveNotifTimer)
        clearTimeout(regularNotifTimer)
      }
    }
  }, [isLoading, userData.id, addLiveNotification, addNotification])

  const handleDeposit = useCallback(
    (amount: number) => {
      gameContext.updateBalance(amount)
      gameContext.addXP(amount / 10) // Example: 1 XP for every $10 deposited
      logAuditAction("deposit", { amount })
      logSecurityEvent("deposit_attempt", { amount, status: "success" })
      toast({
        title: "Deposit Successful!",
        description: `$${amount} has been added to your balance.`,
        variant: "success",
      })
      playSound("chip")
    },
    [gameContext, logAuditAction, logSecurityEvent, playSound],
  )

  const handleWithdraw = useCallback(
    (amount: number) => {
      if (gameContext.gameStats.highestBalance >= amount) {
        // Use gameContext.gameStats.highestBalance for balance check
        gameContext.updateBalance(-amount)
        logAuditAction("withdrawal", { amount })
        logSecurityEvent("withdrawal_attempt", { amount, status: "success" })
        toast({
          title: "Withdrawal Initiated!",
          description: `$${amount} withdrawal is being processed.`,
          variant: "success",
        })
        playSound("chip")
      } else {
        toast({
          title: "Insufficient Balance",
          description: "You do not have enough funds for this withdrawal.",
          variant: "destructive",
        })
        logSecurityEvent("withdrawal_attempt", { amount, status: "failed_insufficient_funds" })
      }
    },
    [gameContext, logAuditAction, logSecurityEvent, playSound],
  )

  const handleOpenBankingModal = useCallback((tab: string) => {
    setIsBankingModalOpen(true)
    setBankingModalActiveTab(tab)
    setIsSidebarOpen(false) // Close sidebar if open
  }, [])

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <GameStats userData={userData} />
      case "games":
        return <BlackjackGame />
      case "achievements":
        return <GameAchievements />
      case "history":
        return <UserTransactionHistory />
      case "deposits":
        return <UserDepositHistory />
      case "withdrawals":
        return <UserWithdrawalHistory />
      case "analytics":
        return <UserReferralAnalytics />
      case "chat":
        return <LiveChat />
      case "referrals":
        return <UserReferralAnalytics />
      case "leaderboard":
        return <ReferralLeaderboard />
      case "profile":
        return <UserProfileSettings />
      case "notifications":
        return <NotificationCenter />
      case "security":
        return <SecurityAnomalyDashboard />
      case "settings":
        return <NotificationSettings />
      case "support":
        return (
          <div className="p-4 text-white">
            <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
            <p>For any questions or issues, please contact our support team.</p>
            {/* Add more support content here */}
          </div>
        )
      default:
        return <GameStats userData={userData} />
    }
  }

  if (isLoading || !userData.id) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading game...</div>
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <GameSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
        userData={userData}
        notifications={notifications.filter((n) => !n.read).length + liveNotifications.filter((n) => !n.read).length}
        onOpenBankingModal={handleOpenBankingModal}
      />
      <div className="flex-1 flex flex-col">
        <GameHeader
          userData={userData}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          activeView={
            // collapse our many views into the 4-tab header vocabulary
            activeView === "games"
              ? "game"
              : activeView === "stats"
                ? "stats"
                : activeView === "achievements"
                  ? "achievements"
                  : activeView === "leaderboard"
                    ? "leaderboard"
                    : "game"
          }
          onViewChange={(view) => {
            // map header clicks back to our router-level view names
            if (view === "game") setActiveView("games")
            else setActiveView(view)
          }}
        />
        <main className="flex-1 p-4 overflow-auto">
          <JackpotDisplay amount={jackpotAmount} />
          {renderContent()}
        </main>
      </div>

      <BankingModal
        balance={gameContext.gameStats.highestBalance} // Use gameContext.gameStats.highestBalance
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        open={isBankingModalOpen}
        onOpenChange={setIsBankingModalOpen}
        activeTab={bankingModalActiveTab}
        onTabChange={setBankingModalActiveTab}
        userData={userData}
      />
    </div>
  )
}
