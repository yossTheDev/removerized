import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <LandingHeader />
      <main className="flex-1 px-6 py-20">
        <div className="mx-auto max-w-3xl prose prose-invert prose-blue">
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
