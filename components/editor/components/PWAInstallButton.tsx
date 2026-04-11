"use client"

import { useEffect, useState } from "react"

interface PWAInstallButtonProps {
  accentColor: string
}

export const PWAInstallButton = ({ accentColor }: PWAInstallButtonProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    if (typeof globalThis === "undefined") return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }

    globalThis.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    globalThis.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      globalThis.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      globalThis.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  if (!isInstallable) return null

  return (
    <button
      onClick={handleInstallPWA}
      className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/50 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/10 hover:text-white"
      style={{
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06), 0 0 40px ${accentColor}10`,
      }}
      title="Install app"
    >
      Install App
    </button>
  )
}
