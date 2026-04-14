"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-32 md:pb-32">
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 opacity-20 blur-[120px]"
           style={{ background: "radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)" }} />

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400">
            100% On-Device AI
          </span>
          <h1 className="mt-8 font-museo text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-7xl">
            Professional Image Editing, <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Right in Your Browser.
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl">
            Free, private, and powerful. Remove backgrounds, upscale images, and colorize photos without uploading a single byte to the cloud.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/editor">
              <Button size="lg" className="h-14 rounded-2xl bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700">
                Start Editing Now
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Link href="#tools">
              <Button size="lg" variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/5 px-8 text-base font-semibold text-white hover:bg-white/10">
                Explore Tools
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
