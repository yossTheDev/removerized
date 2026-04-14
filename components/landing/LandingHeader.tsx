"use client"

import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Icons.logo className="size-6 text-blue-500" />
          <span className="font-museo text-lg font-bold tracking-tight text-white">
            removerized
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/removerized"
            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            Remover
          </Link>
          <Link
            href="/upscaler"
            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            Upscaler
          </Link>
          <Link
            href="/colorizer"
            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            Colorizer
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/editor">
            <Button variant="outline" className="hidden border-white/10 bg-white/5 text-white hover:bg-white/10 md:inline-flex">
              Open Editor
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
