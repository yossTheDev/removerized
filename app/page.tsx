import { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { Hero } from "@/components/landing/Hero"
import { MiniEditor } from "@/components/landing/MiniEditor"
import { Trash2, Maximize, Palette, Shield, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Removerized — All-in-One AI Image Lab",
  description: "Free, private, and on-device AI tools: Background Removal, 4× Upscaling, and Photo Colorization. No uploads, no servers, 100% client-side.",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />

      <main className="flex-1">
        <Hero />

        {/* Tools Section */}
        <section id="tools" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="font-museo text-3xl font-bold md:text-5xl">One Suite. Three Powerful Tools.</h2>
              <p className="mt-4 text-white/50">Everything you need to enhance your images, simplified.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <ToolCard
                title="Background Remover"
                description="Instantly remove backgrounds from your photos with professional precision."
                icon={Trash2}
                color="blue"
                href="/removerized"
              />
              <ToolCard
                title="Image Upscaler"
                description="Increase resolution up to 4x using advanced super-resolution AI."
                icon={Maximize}
                color="purple"
                href="/upscaler"
              />
              <ToolCard
                title="Photo Colorizer"
                description="Breathe life into old black and white photos with realistic AI colorization."
                icon={Palette}
                color="pink"
                href="/colorizer"
              />
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="bg-white/[0.02] px-6 py-24">
          <div className="mx-auto max-w-7xl text-center">
             <div className="mb-16">
                <h2 className="font-museo text-3xl font-bold md:text-5xl">Experience the Power</h2>
                <p className="mt-4 text-white/50">Our editor is designed to be fast, intuitive, and secure.</p>
             </div>
             <div className="flex justify-center">
                <MiniEditor tool="remover" />
             </div>
             <div className="mt-12 flex justify-center">
                <Link href="/editor">
                  <Button size="lg" className="rounded-2xl px-12 h-14 bg-white text-black hover:bg-white/90">
                    Launch Full Editor
                  </Button>
                </Link>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-3">
              <FeatureItem
                icon={Shield}
                title="100% Private"
                description="Your images never leave your computer. All AI processing happens locally in your browser."
              />
              <FeatureItem
                icon={Zap}
                title="Lightning Fast"
                description="Built on ONNX Runtime Web for near-native performance on almost any device."
              />
              <FeatureItem
                icon={Sparkles}
                title="Free & No Limits"
                description="No subscriptions, no credits, and no hidden fees. Use it as much as you want."
              />
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}

function ToolCard({ title, description, icon: Icon, color, href }: { title: string, description: string, icon: any, color: string, href: string }) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    pink: "text-pink-500 bg-pink-500/10 border-pink-500/20",
  }

  return (
    <Link href={href} className="group relative rounded-3xl border border-white/5 bg-white/[0.03] p-8 transition-all hover:bg-white/[0.06] hover:border-white/10">
      <div className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl border ${colors[color]}`}>
        <Icon className="size-7" />
      </div>
      <h3 className="mb-3 text-2xl font-bold">{title}</h3>
      <p className="mb-6 text-white/40 leading-relaxed">{description}</p>
      <div className="flex items-center gap-2 font-semibold text-white/60 group-hover:text-white">
        Learn more <ArrowRight className="size-4" />
      </div>
    </Link>
  )
}

function FeatureItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-white/5 text-white md:mx-0 mx-auto">
        <Icon className="size-6" />
      </div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  )
}
