import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { GameProvider } from "@/contexts/game-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { LiveNotificationProvider } from "@/contexts/live-notification-context"
import { PaymentProvider } from "@/contexts/payment-context"
import { KYCProvider } from "@/contexts/kyc-context"
import { AdminActivityProvider } from "@/contexts/admin-activity-context"
import { SecurityMonitoringProvider } from "@/contexts/security-monitoring-context"
import { AuditProvider } from "@/contexts/audit-context"
import { JackpotProvider } from "@/contexts/jackpot-context"
import NotificationSoundManager from "@/components/notification-sound-manager"
import { InternationalizationProvider } from "@/contexts/internationalization-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Casino Royale",
  description: "A modern online casino experience.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <InternationalizationProvider>
            <NotificationProvider>
              <AdminActivityProvider>
                <LiveNotificationProvider>
                  <SecurityMonitoringProvider>
                    <AuditProvider>
                      <GameProvider>
                        <PaymentProvider>
                          <KYCProvider>
                            <JackpotProvider>
                              {children}
                              <NotificationSoundManager />
                            </JackpotProvider>
                          </KYCProvider>
                        </PaymentProvider>
                      </GameProvider>
                    </AuditProvider>
                  </SecurityMonitoringProvider>
                </LiveNotificationProvider>
              </AdminActivityProvider>
            </NotificationProvider>
          </InternationalizationProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
