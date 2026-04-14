import Link from "next/link"
import { Icons } from "@/components/icons"

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2.5">
            <Icons.logo className="size-6 text-blue-500" />
            <span className="font-museo text-lg font-bold tracking-tight text-white">
              removerized
            </span>
          </div>

          <div className="flex gap-8 text-sm text-white/40">
            <Link href="/removerized" className="hover:text-white">Remover</Link>
            <Link href="/upscaler" className="hover:text-white">Upscaler</Link>
            <Link href="/colorizer" className="hover:text-white">Colorizer</Link>
            <Link href="/blog" className="hover:text-white">Blog</Link>
          </div>

          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Removerized. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
