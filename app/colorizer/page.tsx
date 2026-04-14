import { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { MiniEditor } from "@/components/landing/MiniEditor"
import { Button } from "@/components/ui/button"
import { Palette, Shield, Zap, CheckCircle2, History, Users, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "AI Photo Colorizer — Bring Old Photos to Life",
  description: "Colorize black and white photos instantly with AI. High-quality, natural results, and 100% private processing in your browser.",
}

export default function ColorizerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />

      <main className="flex-1">
        {/* Tool Hero */}
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

        {/* Use Cases Section */}
        <section className="px-6 py-24 bg-white/[0.02]">
           <div className="mx-auto max-w-7xl">
              <h2 className="text-center font-museo text-3xl font-bold mb-16">See the past in color</h2>
              <div className="grid gap-8 md:grid-cols-3">
                 <UseCaseCard
                   icon={History}
                   title="Family Archives"
                   description="Relive your family history by colorizing photos of ancestors and childhood memories."
                 />
                 <UseCaseCard
                   icon={Users}
                   title="Historical Research"
                   description="Gain a new perspective on historical events and figures with realistic colorization."
                 />
                 <UseCaseCard
                   icon={Heart}
                   title="Sentimental Gifts"
                   description="Create unique and emotional gifts by restoring and colorizing cherished old photos."
                 />
              </div>
           </div>
        </section>

        {/* Info Section */}
        <section className="px-6 py-24">
           <div className="mx-auto max-w-7xl">
              <div className="grid gap-16 md:grid-cols-2 items-center">
                 <div>
                    <h2 className="text-3xl font-bold mb-6">Historical Accuracy</h2>
                    <p className="text-white/50 mb-8 leading-relaxed">
                      Using DeOldify, one of the most advanced colorization models, our tool identifies objects, textures, and contexts to apply the most plausible and natural colors to your vintage images.
                    </p>
                    <ul className="space-y-4">
                       <ListItem text="Natural skin tones" />
                       <ListItem text="Deep learning for complex scenes" />
                       <ListItem text="Preserves original image details" />
                       <ListItem text="Perfect for family archives" />
                    </ul>
                 </div>
                 <div className="grid gap-6 sm:grid-cols-2">
                    <FeatureCard
                      icon={Shield}
                      title="Privacy First"
                      description="Keep your personal memories private. No images are ever uploaded to a server."
                    />
                    <FeatureCard
                      icon={Zap}
                      title="Instant Preview"
                      description="See your photos come to life in real-time as the AI processes them."
                    />
                 </div>
              </div>
           </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className="size-5 text-pink-500" />
      <span className="text-white/70">{text}</span>
    </li>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
      <Icon className="size-8 text-pink-500 mb-4" />
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  )
}

function UseCaseCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="text-center p-8 rounded-3xl border border-white/5 bg-white/[0.03]">
      <Icon className="size-10 mx-auto text-pink-500 mb-6" />
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm">{description}</p>
    </div>
  )
}
