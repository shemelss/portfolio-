"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, Users, Smile, Trash2, Crown, Shield, Heart, ThumbsUp, Laugh, Angry } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userRole: "player" | "vip" | "admin"
  message: string
  timestamp: Date
  reactions: { [key: string]: string[] } // emoji -> userIds
  isDeleted?: boolean
  deletedBy?: string
}

interface OnlineUser {
  id: string
  name: string
  role: "player" | "vip" | "admin"
  lastSeen: Date
}

interface LiveChatProps {
  userData: any
}

const EMOJI_REACTIONS = [
  { emoji: "❤️", icon: Heart, label: "Love" },
  { emoji: "👍", icon: ThumbsUp, label: "Like" },
  { emoji: "😂", icon: Laugh, label: "Laugh" },
  { emoji: "😠", icon: Angry, label: "Angry" },
]

export default function LiveChat({ userData }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadChatData()
    simulateOnlineUsers()

    // Simulate receiving messages
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance every 5 seconds
        simulateIncomingMessage()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatData = () => {
    try {
      const storedMessages = localStorage.getItem("chatMessages")
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(parsedMessages)
      }
    } catch (error) {
      console.error("Error loading chat messages:", error)
    }
  }

  const saveChatData = (updatedMessages: ChatMessage[]) => {
    try {
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
    } catch (error) {
      console.error("Error saving chat messages:", error)
    }
  }

  const simulateOnlineUsers = () => {
    const mockUsers: OnlineUser[] = [
      { id: "user1", name: "CryptoKing", role: "vip", lastSeen: new Date() },
      { id: "user2", name: "LuckyPlayer", role: "player", lastSeen: new Date() },
      { id: "user3", name: "GameMaster", role: "admin", lastSeen: new Date() },
      { id: "user4", name: "HighRoller", role: "vip", lastSeen: new Date() },
      { id: "user5", name: "NewPlayer", role: "player", lastSeen: new Date() },
    ]
    setOnlineUsers(mockUsers)
  }

  const simulateIncomingMessage = () => {
    const sampleMessages = [
      "Just hit a big win! 🎉",
      "Anyone playing blackjack?",
      "Good luck everyone!",
      "This game is amazing!",
      "Just deposited, ready to play!",
      "Withdrawal processed quickly 👍",
    ]

    const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)]
    if (randomUser && randomUser.id !== userData?.id) {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: randomUser.id,
        userName: randomUser.name,
        userRole: randomUser.role,
        message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        timestamp: new Date(),
        reactions: {},
      }

      const updatedMessages = [...messages, newMsg].slice(-100) // Keep last 100 messages
      setMessages(updatedMessages)
      saveChatData(updatedMessages)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userData?.id || "anonymous",
      userName: userData?.name || "Anonymous",
      userRole: userData?.role || "player",
      message: newMessage.trim(),
      timestamp: new Date(),
      reactions: {},
    }

    const updatedMessages = [...messages, message].slice(-100) // Keep last 100 messages
    setMessages(updatedMessages)
    saveChatData(updatedMessages)
    setNewMessage("")

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    const userId = userData?.id || "anonymous"
    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions }
        if (!reactions[emoji]) {
          reactions[emoji] = []
        }

        if (reactions[emoji].includes(userId)) {
          // Remove reaction
          reactions[emoji] = reactions[emoji].filter((id) => id !== userId)
          if (reactions[emoji].length === 0) {
            delete reactions[emoji]
          }
        } else {
          // Add reaction
          reactions[emoji].push(userId)
        }

        return { ...msg, reactions }
      }
      return msg
    })

    setMessages(updatedMessages)
    saveChatData(updatedMessages)
  }

  const handleDeleteMessage = (messageId: string) => {
    if (userData?.role !== "admin") return

    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        return { ...msg, isDeleted: true, deletedBy: userData?.name }
      }
      return msg
    })

    setMessages(updatedMessages)
    saveChatData(updatedMessages)
    toast({
      title: "Message Deleted",
      description: "The message has been removed from the chat.",
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-yellow-500" />
      case "vip":
        return <Shield className="h-3 w-3 text-purple-500" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-yellow-500 text-black text-xs">Admin</Badge>
      case "vip":
        return <Badge className="bg-purple-500 text-xs">VIP</Badge>
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Player
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Online Users */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-sm">
            <Users className="h-4 w-4 text-green-500" />
            Online Players ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {onlineUsers.slice(0, 8).map((user) => (
              <div key={user.id} className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-white">{user.name}</span>
                {getRoleIcon(user.role)}
              </div>
            ))}
            {onlineUsers.length > 8 && (
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                <span className="text-xs text-white">+{onlineUsers.length - 8} more</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Live Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] px-4">
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No messages yet</p>
                  <p className="text-sm text-white/50">Be the first to start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        {message.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">{message.userName}</span>
                        {getRoleBadge(message.userRole)}
                        <span className="text-xs text-white/50">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {userData?.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {message.isDeleted ? (
                        <div className="text-white/50 italic text-sm">Message deleted by {message.deletedBy}</div>
                      ) : (
                        <>
                          <p className="text-white/90 text-sm break-words">{message.message}</p>

                          {/* Reactions */}
                          <div className="flex items-center gap-1 mt-2">
                            {EMOJI_REACTIONS.map(({ emoji, icon: Icon, label }) => {
                              const reactionCount = message.reactions[emoji]?.length || 0
                              const hasReacted = message.reactions[emoji]?.includes(userData?.id || "anonymous")

                              return (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className={`h-6 px-2 text-xs ${
                                    hasReacted
                                      ? "bg-blue-500/30 text-blue-300"
                                      : "bg-white/10 text-white/70 hover:bg-white/20"
                                  }`}
                                >
                                  <span className="mr-1">{emoji}</span>
                                  {reactionCount > 0 && <span>{reactionCount}</span>}
                                </Button>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator className="bg-white/20" />

          {/* Message Input */}
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                maxLength={500}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-white/50" />
                <span className="text-xs text-white/50">{newMessage.length}/500</span>
              </div>
              {isTyping.length > 0 && (
                <div className="text-xs text-white/50">
                  {isTyping.join(", ")} {isTyping.length === 1 ? "is" : "are"} typing...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Rules */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <h4 className="font-semibold text-white mb-2 text-sm">Chat Rules</h4>
          <ul className="text-xs text-white/70 space-y-1">
            <li>• Be respectful to all players</li>
            <li>• No spam or excessive messaging</li>
            <li>• No sharing of personal information</li>
            <li>• No advertising or promotional content</li>
            <li>• Admins may remove inappropriate messages</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
