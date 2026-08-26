"use client"

import { useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type ReferralQRCodeProps = {
  referralCode: string
  size?: number
  includeControls?: boolean
  className?: string
}

export default function ReferralQRCode({
  referralCode,
  size = 200,
  includeControls = true,
  className = "",
}: ReferralQRCodeProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate the full referral URL
  const referralUrl = `${window.location.origin}?ref=${referralCode}`

  const downloadQRCode = async () => {
    if (!qrRef.current) return

    try {
      setIsDownloading(true)

      // Create a canvas from the SVG
      const svgElement = qrRef.current.querySelector("svg")
      if (!svgElement) return

      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      if (!context) return

      // Set canvas dimensions
      const svgRect = svgElement.getBoundingClientRect()
      canvas.width = svgRect.width
      canvas.height = svgRect.height

      // Add some padding and background
      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Convert SVG to a data URL
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create an image from the SVG
      const img = new Image()
      img.crossOrigin = "anonymous"

      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = svgUrl
      })

      // Draw the image on the canvas
      context.drawImage(img, 0, 0)
      URL.revokeObjectURL(svgUrl)

      // Convert canvas to a data URL and download
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `referral-code-${referralCode}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "QR Code Downloaded",
        description: "Your referral QR code has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading your QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const shareQRCode = async () => {
    try {
      // Check if running in a secure context (required for some Web APIs)
      const isSecureContext = window.isSecureContext

      // Use Web Share API if available and in a secure context
      if (isSecureContext && navigator.share) {
        try {
          await navigator.share({
            title: "Join me on Blackjack Casino",
            text: `Join me on Blackjack Casino and get a bonus! Use my referral code: ${referralCode}`,
            url: referralUrl,
          })
          toast({
            title: "Sharing Initiated",
            description: "Thanks for sharing your referral!",
          })
          return // Exit if sharing was successful
        } catch (shareError) {
          console.log("Web Share API error, falling back to clipboard:", shareError)
          // Fall through to clipboard method if sharing fails
        }
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(referralUrl)
      toast({
        title: "Link Copied",
        description: "Referral link copied to clipboard. You can now share it manually.",
      })
    } catch (error) {
      console.error("Error handling share/copy:", error)

      // Final fallback - show the link to the user
      toast({
        title: "Manual Copy Required",
        description: "Copy this link manually: " + referralUrl,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4 flex flex-col items-center">
        <div ref={qrRef} className="bg-white p-3 rounded-lg">
          <QRCodeSVG
            value={referralUrl}
            size={size}
            level="H" // High error correction
            includeMargin={true}
            imageSettings={{
              src: "/placeholder.svg?height=40&width=40",
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        {includeControls && (
          <div className="flex gap-2 mt-4 w-full">
            <Button variant="outline" size="sm" className="flex-1" onClick={downloadQRCode} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={shareQRCode}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}

        <div className="text-xs text-center mt-2 text-muted-foreground">
          Scan to join with code: <span className="font-mono font-bold">{referralCode}</span>
        </div>
      </CardContent>
    </Card>
  )
}
