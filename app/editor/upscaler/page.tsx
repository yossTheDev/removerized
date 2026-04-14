import { Metadata } from "next"
import { Suspense } from "react"
import { Editor } from "@/components/editor"

export const metadata: Metadata = {
  title: "AI Image Upscaler",
  description: "Enhance image resolution up to 4x with on-device AI. Zero cloud dependency, 100% private.",
  openGraph: {
    title: "AI Image Upscaler — Removerized",
    description: "Super-resolution AI that upscales images locally in your browser.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Removerized AI Image Upscaler",
      },
    ],
  },
}

export default function UpscalerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Removerized Image Upscaler",
    "operatingSystem": "Web",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "description": "Super-resolution AI upscales images up to 4× with on-device AI — zero cloud dependency.",
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
        <Editor initialTool="upscaler" />
      </Suspense>
    </>
  )
}
