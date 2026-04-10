import { Metadata } from "next"
import { Suspense } from "react"
import { Editor } from "@/components/editor"

export const metadata: Metadata = {
  title: "AI Image Colorizer",
  description: "Restore old black and white photos instantly with AI. Professional results, locally processed.",
  openGraph: {
    title: "AI Image Colorizer — Removerized",
    description: "Deep learning colorization that restores old photos in your browser.",
    images: [
      {
        url: "/api/og/colorizer",
        width: 1200,
        height: 630,
        alt: "Removerized AI Image Colorizer",
      },
    ],
  },
}

export default function ColorizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Removerized Image Colorizer",
    "operatingSystem": "Web",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "description": "Colorize black and white or sepia photographs instantly with AI. Professional results, locally processed.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-[#050505]">
            <p className="text-sm text-white/30">Loading…</p>
          </div>
        }
      >
        <Editor initialTool="colorizer" />
      </Suspense>
    </>
  )
}
