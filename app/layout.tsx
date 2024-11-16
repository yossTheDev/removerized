import "@/styles/globals.css"
import { Metadata, type Viewport } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"

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
    statusBarStyle: "default",
    title: siteConfig.name,
    // startUpImage: [],
  },
  manifest: "/manifest.json",
  openGraph: {
    images: [
      {
        url: "https://removerized.pages.dev/og.png",
      },
    ],
  },
  icons: {
    icon: "/icon.ico",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "white" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMuseo.variable
          )}
        >
          <TooltipProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <main className="relative flex h-screen min-h-screen flex-col overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <div className="flex-1">{children}</div>
                <Toaster></Toaster>
              </main>
              <TailwindIndicator />
            </ThemeProvider>
          </TooltipProvider>
        </body>
        <GoogleAnalytics gaId="G-20G8R0K6W9" />
      </html>
    </>
  )
}
