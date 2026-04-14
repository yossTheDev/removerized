import { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { Hero } from "@/components/landing/Hero"
import { MiniEditor } from "@/components/landing/MiniEditor"
import { Trash2, Maximize, Palette, Shield, Zap, Sparkles, ArrowRight, HelpCircle, Lock, Cpu, Monitor } from "lucide-react"
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

        {/* Privacy Deep Dive */}
        <section className="px-6 py-24">
           <div className="mx-auto max-w-7xl">
              <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8 md:p-16">
                 <div className="grid gap-12 lg:grid-cols-2 items-center">
                    <div>
                       <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                          <Lock className="size-7" />
                       </div>
                       <h2 className="text-3xl font-bold font-museo mb-6 md:text-5xl">Privacy by architecture</h2>
                       <p className="text-white/60 text-lg leading-relaxed mb-8">
                          Traditional AI tools upload your sensitive photos to remote servers. We don't. By running models locally via ONNX Runtime Web, your data never leaves your browser.
                       </p>
                       <div className="space-y-4">
                          <PrivacyItem icon={Shield} text="Your images stay on your RAM/CPU/GPU" />
                          <PrivacyItem icon={Cpu} text="No registration required to use tools" />
                          <PrivacyItem icon={Sparkles} text="Works even when you're offline" />
                       </div>
                    </div>
                    <div className="relative aspect-video rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                       {/* Abstract privacy visualization */}
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0,transparent_100%)]" />
                       <div className="flex h-full w-full items-center justify-center">
                          <div className="flex flex-col items-center gap-4">
                             <div className="relative">
                                <Monitor className="size-16 text-white/20" />
                                <div className="absolute -top-2 -right-2 size-6 rounded-full bg-green-500 flex items-center justify-center border-4 border-[#050505]">
                                   <div className="size-1.5 rounded-full bg-white animate-pulse" />
                                </div>
                             </div>
                             <div className="text-xs font-mono text-white/30 uppercase tracking-[0.2em]">Local execution only</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-24 bg-white/[0.02]">
           <div className="mx-auto max-w-3xl">
              <div className="text-center mb-16">
                 <h2 className="font-museo text-3xl font-bold md:text-5xl">Common Questions</h2>
              </div>
              <div className="space-y-6">
                 <FAQItem
                   question="Is it really free?"
                   answer="Yes. We don't have server costs for processing since your computer does the work. You can use it as much as you want without limits."
                 />
                 <FAQItem
                   question="Which browsers are supported?"
                   answer="Any modern browser that supports WebAssembly and WebGL/WebGPU. We recommend Chrome, Edge, or Brave for the best performance."
                 />
                 <FAQItem
                   question="Do you store any of my data?"
                   answer="Absolutely not. We don't even have a database for your images. All processing is 100% ephemeral and local."
                 />
                 <FAQItem
                   question="How fast is the processing?"
                   answer="It depends on your hardware. High-end CPUs and GPUs will process images in seconds, while older mobile devices might take a bit longer."
                 />
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

function PrivacyItem({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-4">
       <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
          <Icon className="size-3" />
       </div>
       <span className="text-white/70 font-medium">{text}</span>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
       <div className="flex gap-4">
          <HelpCircle className="size-6 text-blue-500 flex-shrink-0" />
          <div>
             <h3 className="text-lg font-bold mb-2">{question}</h3>
             <p className="text-white/40 leading-relaxed text-sm">{answer}</p>
          </div>
       </div>
    </div>
  )
}
