import { Metadata } from "next"
import { Suspense } from "react"
import { Editor } from "@/components/editor"

export const metadata: Metadata = {
  title: "AI Background Remover",
  description: "Remove backgrounds from any image with on-device AI. 100% private, free, and works offline.",
  openGraph: {
    title: "AI Background Remover — Removerized",
    description: "Instant and private background removal in your browser.",
    images: [
      {
        url: "/api/og/remover",
        width: 1200,
        height: 630,
        alt: "Removerized AI Background Remover",
      },
    ],
  },
}

export default function RemoverPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Removerized Background Remover",
    "operatingSystem": "Web",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "description": "Professional-grade AI background removal that runs entirely in your browser.",
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
        <Editor initialTool="remover" />
      </Suspense>
    </>
  )
}
