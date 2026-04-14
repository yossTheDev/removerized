import { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { MiniEditor } from "@/components/landing/MiniEditor"
import { Button } from "@/components/ui/button"
import { Maximize, Shield, Zap, CheckCircle2, Search, Camera, Monitor, Sparkles, ImageDown, Cpu, Expand } from "lucide-react"

export const metadata: Metadata = {
  title: "AI Image Upscaler — 4x Super Resolution",
  description: "Enhance your images with 4x AI upscaling. Sharp details, low noise, and completely private browser-based processing.",
}

export default function UpscalerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />

      <main className="flex-1">
        {/* Tool Hero */}
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

        {/* Use Cases Section */}
        <section className="px-6 py-24 bg-white/[0.02]">
           <div className="mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-center font-museo text-3xl font-bold md:text-5xl">Breathe new life into your images</h2>
                <p className="text-white/40 mt-4">Professional super-resolution for every need.</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                 <UseCaseCard
                   icon={Search}
                   title="Restore Old Photos"
                   description="Recover lost details in blurry family photos and historical archives. Reconstruct textures that were lost to time."
                 />
                 <UseCaseCard
                   icon={Monitor}
                   title="HD Wallpapers"
                   description="Upscale small web images to fit high-resolution monitors and 4K displays without pixelation."
                 />
                 <UseCaseCard
                   icon={Camera}
                   title="Print Ready"
                   description="Increase DPI for printing low-res mobile photos. Get crisp prints even from old smartphone shots."
                 />
              </div>
           </div>
        </section>

        {/* Comparison Section Placeholder */}
        <section className="px-6 py-24 border-y border-white/5">
           <div className="mx-auto max-w-5xl text-center">
              <h2 className="text-3xl font-bold font-museo mb-12 md:text-5xl">Unmatched quality</h2>
              <div className="grid gap-8 md:grid-cols-2">
                 <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8">
                    <div className="mb-4 text-sm font-semibold text-white/40 uppercase tracking-widest">Standard Resize</div>
                    <div className="aspect-square w-full rounded-2xl bg-white/5 flex items-center justify-center text-white/10 italic">
                       Blury and pixelated result
                    </div>
                 </div>
                 <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-8">
                    <div className="mb-4 text-sm font-semibold text-purple-400 uppercase tracking-widest">Removerized AI</div>
                    <div className="aspect-square w-full rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold italic">
                       Sharp and detailed reconstruction
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Info Section */}
        <section className="px-6 py-24">
           <div className="mx-auto max-w-7xl">
              <div className="grid gap-16 md:grid-cols-2 items-center">
                 <div>
                    <h2 className="text-3xl font-bold mb-6 font-museo">Beyond simple interpolation</h2>
                    <p className="text-white/50 mb-8 leading-relaxed">
                      Unlike traditional resizing, our AI Upscaler (powered by Swin2SR models) reconstructs missing details and reduces noise, resulting in a much sharper and clearer image at 4 times the original size.
                    </p>
                    <ul className="space-y-4">
                       <ListItem text="4x resolution increase with AI super-sampling" />
                       <ListItem text="Intelligent noise and compression artifact reduction" />
                       <ListItem text="Preserves natural textures like skin, fabric, and nature" />
                       <ListItem text="Supports batch processing for entire collections" />
                       <ListItem text="Optimized for photos, illustrations, and anime" />
                    </ul>
                 </div>
                 <div className="grid gap-6 sm:grid-cols-2">
                    <FeatureCard
                      icon={Cpu}
                      title="GPU Accelerated"
                      description="Uses your device's hardware for fast inference via ONNX Runtime."
                    />
                    <FeatureCard
                      icon={ImageDown}
                      title="Lossless Export"
                      description="Save your enhanced images in high-quality PNG format."
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
      <CheckCircle2 className="size-5 text-purple-500" />
      <span className="text-white/70">{text}</span>
    </li>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
      <Icon className="size-8 text-purple-500 mb-4" />
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  )
}

function UseCaseCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="text-center p-8 rounded-3xl border border-white/5 bg-white/[0.03]">
      <Icon className="size-10 mx-auto text-purple-500 mb-6" />
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm">{description}</p>
    </div>
  )
}
