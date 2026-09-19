"use client"

import { useEffect, useState } from "react"
import { Check, Copy, ExternalLink, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function WalletConnectButton() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [hasMetaMask, setHasMetaMask] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const provider = window.ethereum
    setHasMetaMask(Boolean(provider))
    if (!provider) return

    const syncAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined
      setAddress(accounts?.[0] ?? null)
    }

    provider.request({ method: "eth_accounts" }).then((accounts) => {
      setAddress((accounts as string[])[0] ?? null)
    }).catch(() => undefined)
    provider.on?.("accountsChanged", syncAccounts)

    return () => provider.removeListener?.("accountsChanged", syncAccounts)
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer")
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[]
      setAddress(accounts[0] ?? null)
      toast({ title: "Wallet connected", description: accounts[0] ? shortenAddress(accounts[0]) : "MetaMask is ready." })
    } catch (error) {
      if ((error as { code?: number }).code !== 4001) {
        toast({ title: "Wallet connection failed", description: "Please unlock MetaMask and try again.", variant: "destructive" })
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
    toast({ title: "Address copied", description: "Wallet address copied to clipboard." })
  }

  if (address) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-950/50 p-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-200/70">Wallet connected</p>
            <p className="truncate font-mono text-xs text-white">{shortenAddress(address)}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={copyAddress} className="h-8 w-8 text-emerald-100 hover:bg-white/10" aria-label="Copy wallet address">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-100 hover:bg-white/10" aria-label="View wallet on Etherscan">
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    )
  }

  return (
    <Button type="button" onClick={connectWallet} disabled={isConnecting} className="w-full justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 font-semibold text-slate-950 hover:from-orange-400 hover:to-amber-400">
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting…" : hasMetaMask ? "Connect MetaMask" : "Install MetaMask"}
    </Button>
  )
}
                    
