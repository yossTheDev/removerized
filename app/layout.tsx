import "@/styles/globals.css"
import { Metadata, type Viewport } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"

import { siteConfig } from "@/config/site"
import { fontMuseo, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export const runtime = "edge"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  manifest: "/manifest.json",
  openGraph: {
    images: [{ url: "https://removerized.pages.dev/og.png" }],
  },
  icons: { icon: "/icon.ico" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [{ color: "#050505" }],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head></head>
        <body
          className={cn(
            "min-h-screen bg-[#050505] font-sans antialiased",
            fontSans.variable,
            fontMuseo.variable
          )}
        >
          <TooltipProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
            >
              <main className="relative flex h-screen min-h-screen flex-col overflow-hidden bg-[#050505]">
                <div className="flex-1">{children}</div>
                <Toaster />
              </main>
              <TailwindIndicator />
            </ThemeProvider>
          </TooltipProvider>
        </body>
        <GoogleAnalytics gaId="G-20G8R0K6W9" />
        <Analytics />
      </html>
    </>
  )
}
