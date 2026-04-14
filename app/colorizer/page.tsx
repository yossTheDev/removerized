import { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { MiniEditor } from "@/components/landing/MiniEditor"
import { Button } from "@/components/ui/button"
import { Palette, Shield, Zap, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "AI Photo Colorizer — Bring Old Photos to Life",
  description: "Colorize black and white photos instantly with AI. High-quality, natural results, and 100% private processing in your browser.",
}

export default function ColorizerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />
      <main className="flex-1">
        <section className="px-6 pt-20 pb-12 text-center">
           <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-pink-500">
                <Palette className="size-8" />
              </div>
              <h1 className="font-museo text-4xl font-bold md:text-6xl">AI Photo Colorizer</h1>
              <p className="mt-6 text-lg text-white/50 md:text-xl max-w-2xl mx-auto">
                Breathe life into history. Our AI automatically adds vibrant, realistic colors to your old black and white photographs.
              </p>
              <div className="mt-10 flex flex-center justify-center">
                <MiniEditor tool="colorizer" />
              </div>
              <div className="mt-12">
                <Link href="/editor/colorizer">
                  <Button size="lg" className="h-14 rounded-2xl bg-pink-600 px-12 text-lg font-bold hover:bg-pink-700">
                    Colorize Photos Now
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
