"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  DollarSign,
  TrendingDown,
  Users,
  Gift,
  Trophy,
  Award,
  Star,
  Crown,
  Zap,
  Target,
} from "lucide-react"
import PlayingCard from "./playing-card"
import ChipStack from "./chip-stack"
import BankingModal from "./banking-modal"
import UserProfile from "./user-profile"
import { toast } from "@/hooks/use-toast"
import Confetti from "./confetti"
import { useSoundEffects } from "@/hooks/use-sound-effects"
import { SoundToggle } from "./sound-toggle"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import { usePayment } from "@/contexts/payment-context"
import { useJackpot } from "@/contexts/jackpot-context" // Import useJackpot

type CardType = {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  value: string
  numericValue: number
}

// Define admin settings type
type AdminGameSettings = {
  minBet: number
  maxBet: number
  blackjackPayout: number
  dealerStandsOn: number
  deckCount: number
  allowDoubleDown: boolean
  allowSplit: boolean
  allowInsurance: boolean
  houseEdge: number
  bonusFrequency: number
  referralBonus: number
  isMaintenanceMode: boolean
  maintenanceMessage: string
  jackpotMinBet: number // New setting for jackpot minimum bet
}

// Default settings if admin hasn't configured them
const defaultSettings: AdminGameSettings = {
  minBet: 5,
  maxBet: 500,
  blackjackPayout: 1.5,
  dealerStandsOn: 17,
  deckCount: 6,
  allowDoubleDown: true,
  allowSplit: true,
  allowInsurance: true,
  houseEdge: 0.05,
  bonusFrequency: 0.2,
  referralBonus: 25,
  isMaintenanceMode: false,
  maintenanceMessage: "Game is currently under maintenance. Please check back later.",
  jackpotMinBet: 100, // Default minimum bet to qualify for jackpot
}

interface BlackjackGameProps {
  adminSettings?: Partial<AdminGameSettings>
}

export default function BlackjackGame({ adminSettings = {} }: BlackjackGameProps) {
  // Merge admin settings with defaults
  const settings: AdminGameSettings = { ...defaultSettings, ...adminSettings }

  // Add sound effects hook
  const { playSound, muted, toggleMute } = useSoundEffects()

  // Add audit logger
  const auditLogger = useAuditLogger()

  // Add payment system
  const { processDeposit, processWithdrawal, getTransactionHistory } = usePayment()

  // Add jackpot system
  const { jackpotAmount, contributeToJackpot, resetJackpot, awardJackpot } = useJackpot()

  // Add this function at the beginning of the component, before the useState declarations
  const initializeUsers = () => {
    try {
      const usersString = localStorage.getItem("users")
      if (!usersString || usersString === "[]") {
        console.log("Initializing sample users in blackjack game")

        // Create sample users with referral codes
        const sampleUsers = [
          {
            id: "sample1",
            name: "John Doe",
            email: "john@example.com",
            password: "Password123!",
            referralCode: "SAMPLE123",
            balance: 100,
            referrals: [],
          },
          {
            id: "sample2",
            name: "Jane Smith",
            email: "jane@example.com",
            password: "Password123!",
            referralCode: "WELCOME50",
            balance: 150,
            referrals: [],
          },
        ]

        localStorage.setItem("users", JSON.stringify(sampleUsers))
        console.log("Sample users created with referral codes in blackjack game")
        return true
      }
      return false
    } catch (error) {
      console.error("Error initializing users in blackjack game:", error)
      return false
    }
  }

  // Get user data from localStorage
  const [userData, setUserData] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [winStreak, setWinStreak] = useState(0)
  const [totalWins, setTotalWins] = useState(0) // Track total wins across sessions
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [winAmount, setWinAmount] = useState(0)
  const [isFirstWin, setIsFirstWin] = useState(true)
  const [lossAnimation, setLossAnimation] = useState(false)
  const [lossMessages, setLossMessages] = useState<string[]>([])
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [milestoneData, setMilestoneData] = useState<{
    wins: number
    title: string
    description: string
    bonus: number
    icon: React.ReactNode
  } | null>(null)
  const [showJackpotWinModal, setShowJackpotWinModal] = useState(false) // State for jackpot win modal

  useEffect(() => {
    // Check if game is in maintenance mode
    if (settings.isMaintenanceMode) {
      toast({
        title: "Maintenance Mode",
        description: settings.maintenanceMessage,
        variant: "destructive",
      })
      return
    }

    // Initialize sample users if needed
    initializeUsers()

    try {
      // Get user data from localStorage
      const localUserData = localStorage.getItem("currentUser")
      if (localUserData) {
        const parsedUserData = JSON.parse(localUserData)
        setUserData(parsedUserData)

        // Get user's balance and stats from localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const user = users.find((u: any) => u.id === parsedUserData.id)

        if (user) {
          setPlayerBalance(user.balance || 10)
          setTotalWins(user.totalWins || 0)
          setIsFirstWin((user.totalWins || 0) === 0)
        }

        // Log game session start
        auditLogger.logGameAction("Session Started", "Blackjack", {
          userId: parsedUserData.id,
          userName: parsedUserData.name,
          initialBalance: user?.balance || 10,
        })
      } else {
        // No authentication found, redirect to login
        console.log("No auth data found in localStorage, redirecting to login")
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      // Redirect to login on error
      window.location.href = "/"
    }

    // Cleanup function to log session end
    return () => {
      if (userData) {
        auditLogger.logGameAction("Session Ended", "Blackjack", {
          userId: userData.id,
          userName: userData.name,
          finalBalance: playerBalance,
          sessionDuration: "session_time_calculation",
        })
      }
    }
  }, [settings.isMaintenanceMode, settings.maintenanceMessage])

  const [deck, setDeck] = useState<CardType[]>([])
  const [playerHand, setPlayerHand] = useState<CardType[]>([])
  const [dealerHand, setDealerHand] = useState<CardType[]>([])
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "gameOver">("betting")
  const [playerBalance, setPlayerBalance] = useState(10) // Starting balance of $10
  const [currentBet, setCurrentBet] = useState(0)
  const [gameResult, setGameResult] = useState<"" | "win" | "lose" | "push">("")
  const [dealerCardHidden, setDealerCardHidden] = useState(true)
  const [consecutiveLosses, setConsecutiveLosses] = useState(0)
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false)
  const [showBankingModal, setShowBankingModal] = useState(false)
  const [hasDeposited, setHasDeposited] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [activeTab, setActiveTab] = useState("deposit")
  const [bigWin, setBigWin] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Initialize deck and check for low balance
  useEffect(() => {
    resetDeck()

    // Show low balance notification on initial load
    if (playerBalance === 10 && !hasDeposited) {
      setTimeout(() => {
        setShowLowBalanceModal(true)
      }, 1000)
    }
  }, [])

  // Update user's balance and stats in localStorage when they change
  useEffect(() => {
    if (userData) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedUsers = users.map((u: any) => {
        if (u.id === userData.id) {
          return { ...u, balance: playerBalance, totalWins }
        }
        return u
      })
      localStorage.setItem("users", JSON.stringify(updatedUsers))
    }
  }, [playerBalance, totalWins, userData])

  // Monitor balance changes
  useEffect(() => {
    // Show low balance warning when balance is exactly $10 (starting balance)
    if (playerBalance <= 10 && gameState === "betting" && !showLowBalanceModal) {
      toast({
        title: "Low Balance",
        description: "Your balance is low. Add more funds to keep playing!",
        variant: "destructive",
      })
    }

    // Show warning when balance is getting low (less than $20)
    if (playerBalance < 20 && playerBalance > 10 && gameState === "betting") {
      toast({
        title: "Balance Running Low",
        description: "Your funds are running low. Consider adding more to continue playing.",
        variant: "default",
      })
    }
  }, [playerBalance, gameState])

  // Monitor consecutive losses
  useEffect(() => {
    if (consecutiveLosses >= 2 && gameState === "gameOver" && gameResult === "lose") {
      toast({
        title: "Losing Streak",
        description: "You're on a losing streak. Maybe it's time to add more funds?",
        variant: "destructive",
      })
    }
  }, [consecutiveLosses, gameState, gameResult])

  // Handle win animation
  useEffect(() => {
    if (showWinAnimation) {
      const timer = setTimeout(() => {
        setShowWinAnimation(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showWinAnimation])

  // Check for milestone achievements
  const checkMilestone = (newTotalWins: number) => {
    let milestone = null

    switch (newTotalWins) {
      case 1:
        milestone = {
          wins: 1,
          title: "🎉 First Victory! 🎉",
          description: "Congratulations on your first win! You're off to a great start. Here's a bonus to celebrate!",
          bonus: 10,
          icon: <Star className="h-8 w-8 text-yellow-500" />,
        }
        break
      case 2:
        milestone = {
          wins: 2,
          title: "🔥 Double Winner! 🔥",
          description: "Two wins down! You're getting the hang of this. Keep the momentum going!",
          bonus: 15,
          icon: <Zap className="h-8 w-8 text-orange-500" />,
        }
        break
      case 3:
        milestone = {
          wins: 3,
          title: "🏆 Triple Threat! 🏆",
          description:
            "Three wins! You're proving to be a skilled player. Here's a special bonus for your achievement!",
          bonus: 25,
          icon: <Trophy className="h-8 w-8 text-gold-500" />,
        }
        break
    }

    if (milestone) {
      setMilestoneData(milestone)
      setShowMilestoneModal(true)

      // Add bonus to balance immediately
      const newBalance = playerBalance + milestone.bonus
      setPlayerBalance(newBalance)

      // Extra confetti for milestones
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 6000)

      // Play special sound
      playSound("firstWin")

      // Log milestone achievement
      auditLogger.logGameAction("Milestone Achieved", "Blackjack", {
        userId: userData?.id,
        milestoneName: milestone.title,
        bonusAmount: milestone.bonus,
        totalWins: newTotalWins,
      })
    }
  }

  const resetDeck = () => {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
    const newDeck: CardType[] = []

    // Create multiple decks based on admin settings
    for (let d = 0; d < settings.deckCount; d++) {
      for (const suit of suits) {
        for (const value of values) {
          let numericValue = Number.parseInt(value)
          if (isNaN(numericValue)) {
            if (value === "A") {
              numericValue = 11
            } else {
              numericValue = 10
            }
          }
          newDeck.push({ suit, value, numericValue })
        }
      }
    }

    // Shuffle the deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }

    setDeck(newDeck)

    // Log deck reset
    auditLogger.logGameAction("Deck Reset", "Blackjack", {
      deckSize: newDeck.length,
      deckCount: settings.deckCount,
    })
  }

  const placeBet = (amount: number) => {
    // Check against admin-set min/max bet limits
    if (amount < settings.minBet) {
      toast({
        title: "Minimum Bet Required",
        description: `The minimum bet amount is $${settings.minBet}.`,
        variant: "destructive",
      })
      return
    }

    if (amount > settings.maxBet) {
      toast({
        title: "Maximum Bet Exceeded",
        description: `The maximum bet amount is $${settings.maxBet}.`,
        variant: "destructive",
      })
      return
    }

    if (playerBalance >= amount) {
      // Play chip sound
      playSound("bet")

      setCurrentBet(currentBet + amount)
      setPlayerBalance(playerBalance - amount)
      contributeToJackpot(amount) // Contribute to jackpot on each bet

      // Log bet placed
      auditLogger.logGameAction("Bet Placed", "Blackjack", {
        userId: userData?.id,
        betAmount: amount,
        totalBet: currentBet + amount,
        balanceAfter: playerBalance - amount,
      })
    } else {
      // Not enough balance to place bet
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds to place this bet. Add more funds to continue.",
        variant: "destructive",
      })

      // Show deposit modal if balance is too low
      if (playerBalance < 25) {
        setActiveTab("deposit")
        setShowBankingModal(true)
      }
    }
  }

  const resetBet = () => {
    // Play button click sound
    playSound("buttonClick")

    setPlayerBalance(playerBalance + currentBet)
    setCurrentBet(0)

    // Log bet reset
    auditLogger.logGameAction("Bet Reset", "Blackjack", {
      userId: userData?.id,
      betAmount: currentBet,
      balanceAfter: playerBalance + currentBet,
    })
  }

  const dealCards = () => {
    if (currentBet > 0) {
      // Play card deal sound
      playSound("cardDeal")

      const newDeck = [...deck]
      const playerCards = [newDeck.pop()!, newDeck.pop()!]
      const dealerCards = [newDeck.pop()!, newDeck.pop()!]

      setPlayerHand(playerCards)
      setDealerHand(dealerCards)
      setDeck(newDeck)
      setGameState("playing")
      setGameResult("")
      setBigWin(false)

      // Log game started
      auditLogger.logGameAction("Hand Dealt", "Blackjack", {
        userId: userData?.id,
        betAmount: currentBet,
        playerCards: playerCards.map((card) => `${card.value}${card.suit[0]}`).join(","),
        dealerUpCard: `${dealerCards[0].value}${dealerCards[0].suit[0]}`,
      })
    }
  }

  const hit = () => {
    if (gameState === "playing") {
      // Play card deal sound
      playSound("cardDeal")

      const newDeck = [...deck]
      const newCard = newDeck.pop()!
      const newHand = [...playerHand, newCard]

      setPlayerHand(newHand)
      setDeck(newDeck)

      // Log hit action
      auditLogger.logGameAction("Player Hit", "Blackjack", {
        userId: userData?.id,
        newCard: `${newCard.value}${newCard.suit[0]}`,
        handValue: calculateHandValue(newHand),
      })

      // Check if player busts
      if (calculateHandValue(newHand) > 21) {
        // Play lose sound
        playSound("lose")

        setGameState("gameOver")
        setGameResult("lose")
        setDealerCardHidden(false)
        setConsecutiveLosses(consecutiveLosses + 1)
        setWinStreak(0)

        // Set loss animation
        setLossAnimation(true)
        setTimeout(() => setLossAnimation(false), 2000)

        // Set random loss messages
        const newMessages = []
        for (let i = 0; i < 3; i++) {
          newMessages.push(getRandomLossMessage())
        }
        setLossMessages(newMessages)

        // Log player bust
        auditLogger.logGameAction("Player Bust", "Blackjack", {
          userId: userData?.id,
          handValue: calculateHandValue(newHand),
          betAmount: currentBet,
        })

        // Show deposit suggestion after consecutive losses
        if (consecutiveLosses >= 1 && playerBalance < 20) {
          setTimeout(() => {
            toast({
              title: "Tough Luck!",
              description: "The cards aren't in your favor. Add more funds to turn your luck around!",
              variant: "destructive",
            })
          }, 1500)
        }
      }
    }
  }

  const stand = () => {
    if (gameState === "playing") {
      // Play button click sound
      playSound("buttonClick")

      setGameState("dealerTurn")
      setDealerCardHidden(false)

      // Play card flip sound when revealing dealer's card
      playSound("cardFlip")

      // Log stand action
      auditLogger.logGameAction("Player Stand", "Blackjack", {
        userId: userData?.id,
        handValue: calculateHandValue(playerHand),
      })

      dealerPlay()
    }
  }

  const dealerPlay = () => {
    const currentDealerHand = [...dealerHand]
    const newDeck = [...deck]

    // Use admin setting for dealer stands on value
    while (calculateHandValue(currentDealerHand) < settings.dealerStandsOn) {
      // 15% chance dealer stops at 16 if player has good hand
      if (
        calculateHandValue(currentDealerHand) === 16 &&
        calculateHandValue(playerHand) >= 19 &&
        Math.random() < 0.15
      ) {
        break
      }

      const newCard = newDeck.pop()!
      currentDealerHand.push(newCard)

      // Log dealer draw
      auditLogger.logGameAction("Dealer Draw", "Blackjack", {
        newCard: `${newCard.value}${newCard.suit[0]}`,
        dealerHandValue: calculateHandValue(currentDealerHand),
      })
    }

    setDealerHand(currentDealerHand)
    setDeck(newDeck)

    // Determine winner
    const playerValue = calculateHandValue(playerHand)
    const dealerValue = calculateHandValue(currentDealerHand)
    let winnings = 0 // Declare winnings variable

    if (dealerValue > 21 || playerValue > dealerValue) {
      // Player wins
      winnings = currentBet * 2

      // Blackjack bonus (21 with 2 cards) - use admin setting for payout
      if (playerValue === 21 && playerHand.length === 2) {
        winnings = Math.floor(currentBet * (1 + settings.blackjackPayout)) // Admin configurable blackjack payout
      }

      setGameResult("win")
      setWinAmount(winnings)
      setConsecutiveLosses(0)
      setWinStreak(winStreak + 1)

      // Update total wins
      const newTotalWins = totalWins + 1
      setTotalWins(newTotalWins)

      // Check for big win (bet >= 50)
      const isBigWin = currentBet >= 50
      setBigWin(isBigWin)

      // Check for Jackpot Win
      const isSuitedBlackjack =
        playerHand.length === 2 && playerValue === 21 && playerHand[0].suit === playerHand[1].suit
      if (isSuitedBlackjack && currentBet >= settings.jackpotMinBet && jackpotAmount > 0) {
        awardJackpot(userData.id, userData.name, jackpotAmount)
        resetJackpot()
        setShowJackpotWinModal(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 8000)
        playSound("bigWin") // Play big win sound for jackpot
      } else {
        // Calculate milestone bonus
        let milestoneBonus = 0
        if (newTotalWins === 1) milestoneBonus = 10
        else if (newTotalWins === 2) milestoneBonus = 15
        else if (newTotalWins === 3) milestoneBonus = 25

        // Add winnings and milestone bonus to balance
        const totalEarnings = winnings + milestoneBonus
        setPlayerBalance(playerBalance + totalEarnings)

        // Log win
        auditLogger.logGameAction("Player Win", "Blackjack", {
          userId: userData?.id,
          betAmount: currentBet,
          winAmount: winnings,
          playerHandValue: playerValue,
          dealerHandValue: dealerValue,
          isBlackjack: playerValue === 21 && playerHand.length === 2,
          milestoneBonus: milestoneBonus,
          totalEarnings: totalEarnings,
          balanceAfter: playerBalance + totalEarnings,
        })

        // Play appropriate win sound
        if (newTotalWins === 1) {
          playSound("firstWin")
        } else if (isBigWin) {
          playSound("bigWin")
        } else {
          playSound("win")
        }

        // Show confetti for wins
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)

        // Show win animation
        setShowWinAnimation(true)

        // Check for milestone achievements (1-3 wins)
        if (newTotalWins <= 3) {
          setTimeout(() => {
            checkMilestone(newTotalWins)
          }, 2000)
        }

        // Special first win celebration
        if (newTotalWins === 1) {
          setIsFirstWin(false)

          // Extra confetti for first win
          setTimeout(() => {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
          }, 1000)

          // Special toast for first win
          setTimeout(() => {
            toast({
              title: "🏆 First Win! 🏆",
              description: "Congratulations on your first win! This is the beginning of your winning journey!",
            })
          }, 1500)
        }

        // Occasionally suggest referring friends after a win
        if (Math.random() > 0.7 && newTotalWins > 3) {
          setTimeout(() => {
            setShowReferralModal(true)
          }, 3500) // Show after win animation
        }

        // Special toast for win streaks
        if (winStreak >= 2) {
          setTimeout(() => {
            toast({
              title: `${winStreak} Win Streak! 🔥`,
              description: "You're on fire! Keep the winning streak going!",
            })
          }, 1000)
        }
      }

      // Lucky bonus system - configurable frequency from admin settings
      if (gameResult === "win" && Math.random() < settings.bonusFrequency) {
        const luckyBonus = Math.floor(winnings * 0.5)
        setPlayerBalance((prev) => prev + luckyBonus)

        // Log lucky bonus
        auditLogger.logGameAction("Lucky Bonus", "Blackjack", {
          userId: userData?.id,
          bonusAmount: luckyBonus,
          balanceAfter: playerBalance + winnings + luckyBonus,
        })

        setTimeout(() => {
          toast({
            title: "🍀 Lucky Bonus! 🍀",
            description: `You got an extra $${luckyBonus} lucky bonus!`,
          })
        }, 2000)
      }
    } else if (dealerValue > playerValue) {
      // Dealer wins
      setGameResult("lose")
      setConsecutiveLosses(consecutiveLosses + 1)
      setWinStreak(0)

      // Log loss
      auditLogger.logGameAction("Player Loss", "Blackjack", {
        userId: userData?.id,
        betAmount: currentBet,
        playerHandValue: playerValue,
        dealerHandValue: dealerValue,
        consecutiveLosses: consecutiveLosses + 1,
      })

      // Play lose sound
      playSound("lose")

      // Set loss animation
      setLossAnimation(true)
      setTimeout(() => setLossAnimation(false), 2000)

      // Set random loss messages
      const newMessages = []
      for (let i = 0; i < 3; i++) {
        newMessages.push(getRandomLossMessage())
      }
      setLossMessages(newMessages)

      // Show deposit suggestion after consecutive losses
      if (consecutiveLosses >= 1 && playerBalance < 20) {
        setTimeout(() => {
          toast({
            title: "Tough Luck!",
            description: "The cards aren't in your favor. Add more funds to turn your luck around!",
            variant: "destructive",
          })
        }, 1500)
      }
    } else {
      // Push - tie
      setGameResult("push")
      setPlayerBalance(playerBalance + currentBet)
      // Don't reset consecutive losses on push, but don't increment either

      // Log push
      auditLogger.logGameAction("Push", "Blackjack", {
        userId: userData?.id,
        betAmount: currentBet,
        playerHandValue: playerValue,
        dealerHandValue: dealerValue,
        balanceAfter: playerBalance + currentBet,
      })

      // Play button click sound for push (neutral sound)
      playSound("buttonClick")
    }

    setGameState("gameOver")
  }

  const calculateHandValue = (hand: CardType[]) => {
    let value = 0
    let aces = 0

    for (const card of hand) {
      value += card.numericValue
      if (card.value === "A") {
        aces++
      }
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }

    return value
  }

  const newGame = () => {
    // Play button click sound
    playSound("buttonClick")

    setPlayerHand([])
    setDealerHand([])
    setCurrentBet(0)
    setGameState("betting")
    setDealerCardHidden(true)
    setGameResult("")
    setShowWinAnimation(false)

    // Log new game
    auditLogger.logGameAction("New Game", "Blackjack", {
      userId: userData?.id,
      currentBalance: playerBalance,
    })

    // Reset and shuffle deck if it's getting low
    if (deck.length < 10) {
      resetDeck()
    }

    // Check if balance is low after a game
    if (playerBalance <= 10) {
      setTimeout(() => {
        setShowLowBalanceModal(true)
      }, 500)
    }
  }

  const handleDeposit = (amount: number) => {
    // Play win sound for deposit (positive sound)
    playSound("win")

    // Process the deposit through the payment system
    processDeposit(userData?.id, amount).then((success) => {
      if (success) {
        setPlayerBalance(playerBalance + amount)
        setHasDeposited(true)

        // Log deposit
        auditLogger.logFinancialAction("Deposit", {
          userId: userData?.id,
          amount: amount,
          method: "casino_banking",
          balanceAfter: playerBalance + amount,
        })

        toast({
          title: "Funds Added",
          description: `$${amount} has been added to your balance to play`,
        })
      } else {
        toast({
          title: "Deposit Failed",
          description: "There was an issue processing your deposit. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleWithdraw = (amount: number) => {
    // Play button click sound
    playSound("buttonClick")

    if (amount <= playerBalance) {
      // Process the withdrawal through the payment system
      processWithdrawal(userData?.id, amount).then((success) => {
        if (success) {
          setPlayerBalance(playerBalance - amount)

          // Log withdrawal
          auditLogger.logFinancialAction("Withdrawal", {
            userId: userData?.id,
            amount: amount,
            method: "casino_banking",
            balanceAfter: playerBalance - amount,
          })

          toast({
            title: "Withdrawal Initiated",
            description: `$${amount} will be sent to your wallet`,
          })
        } else {
          toast({
            title: "Withdrawal Failed",
            description: "There was an issue processing your withdrawal. Please try again.",
            variant: "destructive",
          })
        }
      })
    }
  }

  const openReferralTab = () => {
    // Play button click sound
    playSound("buttonClick")

    setActiveTab("referrals")
    setShowReferralModal(false)
    setShowBankingModal(true)
  }

  const claimMilestoneBonus = () => {
    if (milestoneData) {
      // Play win sound
      playSound("win")

      setShowMilestoneModal(false)

      // Log milestone bonus claim
      auditLogger.logGameAction("Milestone Bonus Claimed", "Blackjack", {
        userId: userData?.id,
        milestoneName: milestoneData.title,
        bonusAmount: milestoneData.bonus,
        balanceAfter: playerBalance,
      })

      toast({
        title: "Milestone Bonus Claimed!",
        description: `$${milestoneData.bonus} has been added to your balance!`,
      })
    }
  }

  // Get win streak badge
  const getWinStreakBadge = () => {
    if (winStreak >= 5) return <Crown className="h-5 w-5 text-yellow-500" />
    if (winStreak >= 3) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (winStreak >= 2) return <Award className="h-5 w-5 text-yellow-500" />
    if (winStreak === 1) return <Star className="h-5 w-5 text-yellow-500" />
    return null
  }

  // Get milestone badge for total wins
  const getMilestoneBadge = () => {
    if (totalWins >= 10) return <Crown className="h-4 w-4 text-purple-500" />
    if (totalWins >= 5) return <Trophy className="h-4 w-4 text-gold-500" />
    if (totalWins >= 3) return <Target className="h-4 w-4 text-blue-500" />
    if (totalWins >= 1) return <Star className="h-4 w-4 text-yellow-500" />
    return null
  }

  // Get random loss message
  const getRandomLossMessage = () => {
    const messages = [
      "Better luck next time!",
      "The house always wins...",
      "So close, yet so far!",
      "That's a tough break!",
      "Don't give up now!",
      "Fortune favors the bold!",
      "Time to change your strategy?",
      "The cards weren't in your favor this time.",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Show maintenance mode message if enabled by admin
  if (settings.isMaintenanceMode) {
    return (
      <div className="w-full max-w-3xl bg-gradient-to-b from-red-800 to-red-700 border-2 border-yellow-600 shadow-xl p-8 rounded-lg text-center">
        <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Game Maintenance</h2>
        <p className="text-white mb-6">{settings.maintenanceMessage}</p>
        <Button onClick={() => (window.location.href = "/")} className="bg-yellow-600 hover:bg-yellow-700">
          Return to Home
        </Button>
      </div>
    )
  }

  if (!userData) {
    return <div className="text-center p-8">Loading game data...</div>
  }

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="absolute top-4 right-4">
        <UserProfile
          userData={userData}
          balance={playerBalance}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />
      </div>

      <Card className="w-full max-w-3xl bg-gradient-to-b from-green-800 to-green-700 border-2 border-yellow-600 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-500 opacity-10 rounded-full -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500 opacity-10 rounded-full translate-x-16 translate-y-16"></div>
        </div>

        <div className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-black text-white px-3 py-1 text-lg border-yellow-500 shadow-md">
                Balance: ${playerBalance}
              </Badge>
              <SoundToggle muted={muted} onToggle={toggleMute} />
            </div>
            <div className="flex items-center gap-2">
              {totalWins > 0 && (
                <Badge variant="outline" className="bg-purple-600 text-white px-3 py-1 flex items-center gap-1">
                  {getMilestoneBadge()}
                  <span>{totalWins} Total Wins</span>
                </Badge>
              )}
              {winStreak >= 1 && (
                <Badge
                  variant="outline"
                  className="bg-yellow-600 text-white px-3 py-1 flex items-center gap-1 animate-pulse"
                >
                  {getWinStreakBadge()}
                  <span>{winStreak} Streak</span>
                </Badge>
              )}
              <Badge variant="outline" className="bg-black text-white px-3 py-1 text-lg border-yellow-500 shadow-md">
                Bet: ${currentBet}
              </Badge>
            </div>
          </div>

          {/* Low balance alert */}
          {playerBalance <= 10 && gameState === "betting" && (
            <Alert variant="destructive" className="mb-4 border-red-500 animate-pulse">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                Your balance is low! Add more funds to continue playing.
              </AlertDescription>
            </Alert>
          )}

          {/* Dealer's cards */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
              <span className="text-yellow-300 mr-2">♠️</span>
              Dealer: {!dealerCardHidden && calculateHandValue(dealerHand)}
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {dealerHand.map((card, index) => (
                <div
                  key={index}
                  className={`transform ${!dealerCardHidden ? "hover:scale-110" : ""} transition-transform duration-200`}
                >
                  <PlayingCard card={card} hidden={index === 1 && dealerCardHidden} />
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4 bg-yellow-600" />

          {/* Player's cards */}
          <div className="mb-8 relative">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
              <span className="text-yellow-300 mr-2">♥️</span>
              Your Hand: {playerHand.length > 0 ? calculateHandValue(playerHand) : ""}
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {playerHand.map((card, index) => (
                <div
                  key={index}
                  className={`transform hover:scale-110 transition-transform duration-200 ${
                    gameResult === "win" ? "animate-bounce" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PlayingCard key={index} card={card} />
                </div>
              ))}
            </div>

            {/* Win animation overlay */}
            {showWinAnimation && gameResult === "win" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-40 rounded-lg p-4 transform animate-bounce shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300 mb-2 flex items-center justify-center">
                      {bigWin ? (
                        <>
                          <Trophy className="h-8 w-8 text-yellow-300 mr-2" />
                          BIG WIN!
                          <Trophy className="h-8 w-8 text-yellow-300 ml-2" />
                        </>
                      ) : totalWins === 1 ? (
                        <>
                          <Star className="h-8 w-8 text-yellow-300 mr-2" />
                          FIRST WIN!
                          <Star className="h-8 w-8 text-yellow-300 ml-2" />
                        </>
                      ) : (
                        <>
                          <Star className="h-6 w-6 text-yellow-300 mr-2" />
                          YOU WIN!
                          <Star className="h-6 w-6 text-yellow-300 ml-2" />
                        </>
                      )}
                    </div>
                    <div className="text-2xl text-white">+${winAmount}</div>
                    {totalWins <= 3 && (
                      <div className="text-sm text-yellow-200 mt-1">Win #{totalWins} - Milestone coming!</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game result message */}
          {gameResult && !showWinAnimation && (
            <div
              className={`text-center mb-4 text-2xl font-bold ${
                gameResult === "win"
                  ? "text-yellow-300 animate-pulse"
                  : gameResult === "lose"
                    ? "text-red-500"
                    : "text-white"
              }`}
            >
              {gameResult === "win" ? (
                <div className="flex items-center justify-center">
                  <Trophy className="h-6 w-6 mr-2" />
                  You Win!
                  <Trophy className="h-6 w-6 ml-2" />
                </div>
              ) : gameResult === "lose" ? (
                <div className={`${lossAnimation ? "animate-shake" : ""}`}>You Lose!</div>
              ) : (
                "Push - Bet Returned"
              )}
            </div>
          )}

          {/* Loss messages */}
          {gameResult === "lose" && lossMessages.length > 0 && (
            <div className="text-center mb-4 space-y-1">
              {lossMessages.map((message, index) => (
                <div
                  key={index}
                  className="text-red-300 text-sm opacity-80"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animation: "fadeInOut 2s ease-in-out",
                  }}
                >
                  {message}
                </div>
              ))}
            </div>
          )}

          {/* Consecutive losses message */}
          {consecutiveLosses >= 2 && gameResult === "lose" && (
            <div className="text-center mb-4 bg-red-900 p-2 rounded-md animate-pulse">
              <div className="flex items-center justify-center gap-2 text-white">
                <TrendingDown className="h-5 w-5" />
                <span>You're on a losing streak! Maybe it's time to add more funds?</span>
              </div>
            </div>
          )}

          {/* Game controls */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {gameState === "betting" && (
              <>
                <div className="flex gap-2 flex-wrap justify-center">
                  <ChipStack
                    value={settings.minBet}
                    onClick={() => placeBet(settings.minBet)}
                    disabled={playerBalance < settings.minBet}
                  />
                  <ChipStack value={25} onClick={() => placeBet(25)} disabled={playerBalance < 25} />
                  <ChipStack value={100} onClick={() => placeBet(100)} disabled={playerBalance < 100} />
                </div>
                <div className="w-full flex justify-center gap-2 mt-4">
                  <Button
                    onClick={resetBet}
                    variant="destructive"
                    disabled={currentBet === 0}
                    className="shadow-md hover:shadow-lg transition-all"
                  >
                    Reset Bet
                  </Button>
                  <Button
                    onClick={dealCards}
                    disabled={currentBet === 0}
                    className="bg-yellow-600 hover:bg-yellow-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Deal
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
                    onClick={() => {
                      playSound("buttonClick")
                      setActiveTab("deposit")
                      setShowBankingModal(true)
                    }}
                  >
                    Banking
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                    onClick={() => {
                      playSound("buttonClick")
                      setActiveTab("referrals")
                      setShowBankingModal(true)
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Refer
                  </Button>
                </div>
              </>
            )}

            {gameState === "playing" && (
              <div className="flex gap-2">
                <Button
                  onClick={hit}
                  className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  Hit
                </Button>
                <Button
                  onClick={stand}
                  className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                >
                  Stand
                </Button>
              </div>
            )}

            {gameState === "gameOver" && (
              <div className="flex gap-2">
                <Button
                  onClick={newGame}
                  className="bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
                >
                  New Game
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
                  onClick={() => {
                    playSound("buttonClick")
                    setActiveTab("deposit")
                    setShowBankingModal(true)
                  }}
                >
                  Banking
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                  onClick={() => {
                    playSound("buttonClick")
                    setActiveTab("referrals")
                    setShowBankingModal(true)
                  }}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Refer
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Milestone Achievement Modal */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
              {milestoneData?.icon}
              {milestoneData?.title}
            </DialogTitle>
            <DialogDescription className="text-center text-lg">{milestoneData?.description}</DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-md border border-yellow-200 dark:border-yellow-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                +${milestoneData?.bonus} BONUS ADDED!
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                This bonus has been added to your balance! New balance: ${playerBalance}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={claimMilestoneBonus}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3"
            >
              <Gift className="mr-2 h-5 w-5" />
              Awesome! Continue Playing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Jackpot Win Modal */}
      <Dialog open={showJackpotWinModal} onOpenChange={setShowJackpotWinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-3xl text-yellow-500">
              <Crown className="h-8 w-8" />
              JACKPOT WINNER!
              <Crown className="h-8 w-8" />
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-white/80">
              Unbelievable! You hit the Progressive Jackpot!
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-md border border-yellow-700 shadow-xl">
            <div className="text-center">
              <div className="text-5xl font-extrabold text-white mb-2 animate-bounce-slow">
                ${jackpotAmount.toFixed(2)}
              </div>
              <p className="text-lg text-yellow-100">Has been added to your balance!</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowJackpotWinModal(false)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3"
            >
              <Star className="mr-2 h-5 w-5" />
              Claim & Keep Playing!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Low Balance Modal */}
      <Dialog open={showLowBalanceModal} onOpenChange={setShowLowBalanceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              Low Balance Warning
            </DialogTitle>
            <DialogDescription>
              Your balance is only ${playerBalance}. Add more funds to enhance your gaming experience!
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">With a higher balance, you can:</p>
            <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              <li>Place larger bets for bigger wins</li>
              <li>Play more rounds without interruption</li>
              <li>Have more flexibility in your betting strategy</li>
            </ul>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                playSound("buttonClick")
                setShowLowBalanceModal(false)
              }}
              className="sm:flex-1"
            >
              Continue with ${playerBalance}
            </Button>
            <Button
              onClick={() => {
                playSound("buttonClick")
                setShowLowBalanceModal(false)
                setActiveTab("deposit")
                setShowBankingModal(true)
              }}
              className="bg-green-600 hover:bg-green-700 sm:flex-1"
            >
              Add Funds Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Promotion Modal */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-500" />
              Share & Earn Rewards!
            </DialogTitle>
            <DialogDescription>
              You're on a winning streak! Share the fun with friends and earn bonuses.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-bold">
              Refer a friend and earn ${settings.referralBonus} when they make their first deposit!
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-blue-700 dark:text-blue-400">
              <li>
                Share your unique referral code: <span className="font-mono font-bold">{userData.referralCode}</span>
              </li>
              <li>Get ${settings.referralBonus} for each friend who deposits</li>
              <li>Your friends get a special welcome bonus too!</li>
            </ul>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                playSound("buttonClick")
                setShowReferralModal(false)
              }}
              className="sm:flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                playSound("buttonClick")
                openReferralTab()
              }}
              className="bg-blue-600 hover:bg-blue-700 sm:flex-1"
            >
              <Users className="mr-2 h-4 w-4" />
              Refer Friends Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banking Modal */}
      {showBankingModal && (
        <BankingModal
          balance={playerBalance}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          open={showBankingModal}
          onOpenChange={(open) => {
            if (!open) playSound("buttonClick")
            setShowBankingModal(open)
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userData={userData}
        />
      )}
    </>
  )
}
