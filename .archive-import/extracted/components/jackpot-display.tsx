"use client"

import { useJackpot } from "@/contexts/jackpot-context"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

export default function JackpotDisplay() {
  const { jackpotAmount } = useJackpot()

  return (
    <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-600 shadow-lg animate-pulse-slow">
      <CardContent className="flex items-center justify-center p-4 gap-3">
        <DollarSign className="h-8 w-8 text-white" />
        <div className="text-3xl font-extrabold tracking-tight">PROGRESSIVE JACKPOT: ${jackpotAmount.toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}
