import "@/styles/globals.css"
import { Metadata, type Viewport } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { siteConfig } from "@/config/site"
import { fontMuseo, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  metadataBase: new URL("https://removerized.pages.dev"),
  title: {
    default: `${siteConfig.name} — AI BG Remover, Upscaler & Colorizer`,
    template: `%s — ${siteConfig.name}`,
  },
  description:
    "Free, private, and on-device AI tools to remove backgrounds, upscale images up to 4×, and colorize old photos. No uploads, no servers, 100% client-side.",
  keywords: [
    "background remover",
    "image upscaler",
    "photo colorizer",
    "AI image editor",
    "private AI",
    "on-device AI",
    "free background removal",
  ],
  authors: [{ name: "yossthedev", url: "https://github.com/yossTheDev" }],
  creator: "yossthedev",
  publisher: "Removerizer",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://removerized.pages.dev",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — All-in-One AI Image Lab`,
    description:
      "Instant, private, and free AI tools: Background Removal, 4× Upscaling, and Photo Colorization. All running in your browser.",
    images: [
      {
        url: "https://removerized.pages.dev/og.png",
        width: 1200,
        height: 630,
        alt: "Removerizer AI Image Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Private AI Image Tools`,
    description:
      "Remove backgrounds, upscale, and colorize images locally with AI. No data leaves your device.",
    images: ["https://removerized.pages.dev/og.png"],
    creator: "@yossthedev",
  },
  icons: { icon: "/icon.ico" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <SpeedInsights />
      </html>
    </>
  )
}
