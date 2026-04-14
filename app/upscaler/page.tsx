import { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { MiniEditor } from "@/components/landing/MiniEditor"
import { Button } from "@/components/ui/button"
import { Maximize, Shield, Zap, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "AI Image Upscaler — 4x Super Resolution",
  description: "Enhance your images with 4x AI upscaling. Sharp details, low noise, and completely private browser-based processing.",
}

export default function UpscalerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />
      <main className="flex-1">
        <section className="px-6 pt-20 pb-12 text-center">
           <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-500">
                <Maximize className="size-8" />
              </div>
              <h1 className="font-museo text-4xl font-bold md:text-6xl">AI Image Upscaler</h1>
              <p className="mt-6 text-lg text-white/50 md:text-xl max-w-2xl mx-auto">
                Turn low-resolution images into high-definition masterpieces with 4x super-resolution AI.
              </p>
              <div className="mt-10 flex flex-center justify-center">
                <MiniEditor tool="upscaler" />
              </div>
              <div className="mt-12">
                <Link href="/editor/upscaler">
                  <Button size="lg" className="h-14 rounded-2xl bg-purple-600 px-12 text-lg font-bold hover:bg-purple-700">
                    Upscale Image Now
                  </Button>
                </Link>
              </div>
           </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
