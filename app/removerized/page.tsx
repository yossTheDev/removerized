import { Metadata } from "next"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { MiniEditor } from "@/components/landing/MiniEditor"
import { Button } from "@/components/ui/button"
import { Trash2, Shield, Zap, CheckCircle2, ImageIcon, Ghost } from "lucide-react"

export const metadata: Metadata = {
  title: "AI Background Remover — Free, Private & Offline",
  description: "Remove backgrounds from any image instantly with our browser-based AI. 100% private, no uploads, pro-quality results.",
}

export default function RemoverizedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />

      <main className="flex-1">
        {/* Tool Hero */}
        <section className="px-6 pt-20 pb-12 text-center">
           <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                <Trash2 className="size-8" />
              </div>
              <h1 className="font-museo text-4xl font-bold md:text-6xl">AI Background Remover</h1>
              <p className="mt-6 text-lg text-white/50 md:text-xl max-w-2xl mx-auto">
                Remove backgrounds with professional precision in seconds. Entirely in your browser, keeping your data safe.
              </p>
              <div className="mt-10 flex flex-center justify-center">
                <MiniEditor tool="remover" />
              </div>
              <div className="mt-12">
                <Link href="/editor/removerized">
                  <Button size="lg" className="h-14 rounded-2xl bg-blue-600 px-12 text-lg font-bold hover:bg-blue-700">
                    Try Remover Now
                  </Button>
                </Link>
              </div>
           </div>
        </section>

        {/* Use Cases Section */}
        <section className="px-6 py-24 bg-white/[0.02]">
           <div className="mx-auto max-w-7xl">
              <h2 className="text-center font-museo text-3xl font-bold mb-16">Perfect for every project</h2>
              <div className="grid gap-8 md:grid-cols-3">
                 <UseCaseCard
                   icon={ImageIcon}
                   title="E-commerce"
                   description="Create clean product photos for Amazon, Shopify, or Instagram in seconds."
                 />
                 <UseCaseCard
                   icon={Ghost}
                   title="Graphic Design"
                   description="Isolate subjects for logos, banners, and complex compositions without the manual work."
                 />
                 <UseCaseCard
                   icon={Zap}
                   title="Social Media"
                   description="Make your portraits pop by adding custom backgrounds or using transparent cutouts."
                 />
              </div>
           </div>
        </section>

        {/* Info Section */}
        <section className="px-6 py-24">
           <div className="mx-auto max-w-7xl">
              <div className="grid gap-16 md:grid-cols-2 items-center">
                 <div>
                    <h2 className="text-3xl font-bold mb-6">How it works</h2>
                    <p className="text-white/50 mb-8 leading-relaxed">
                      Our Background Remover uses state-of-the-art AI models (like ORMBG) converted to ONNX format to run locally on your device. When you select an image, the AI analyzes it and generates a precise mask to separate the subject from the background.
                    </p>
                    <ul className="space-y-4">
                       <ListItem text="Professional edge detection" />
                       <ListItem text="Supports complex subjects like hair" />
                       <ListItem text="Batch processing available" />
                       <ListItem text="Export as transparent PNG" />
                    </ul>
                 </div>
                 <div className="grid gap-6 sm:grid-cols-2">
                    <FeatureCard
                      icon={Shield}
                      title="100% Private"
                      description="Your photos stay on your device. Perfect for sensitive or internal projects."
                    />
                    <FeatureCard
                      icon={Zap}
                      title="Instant Results"
                      description="No waiting for server queues. Get your background-free image in seconds."
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
      <CheckCircle2 className="size-5 text-blue-500" />
      <span className="text-white/70">{text}</span>
    </li>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
      <Icon className="size-8 text-blue-500 mb-4" />
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  )
}

function UseCaseCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="text-center p-8 rounded-3xl border border-white/5 bg-white/[0.03]">
      <Icon className="size-10 mx-auto text-blue-500 mb-6" />
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm">{description}</p>
    </div>
  )
}
