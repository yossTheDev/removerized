"use client"

import { motion } from "framer-motion"
import { LucideIcon, ImageIcon, Maximize, Palette, Trash2, Download, ZoomIn, Settings } from "lucide-react"

interface MiniEditorProps {
  tool?: "remover" | "upscaler" | "colorizer"
}

export function MiniEditor({ tool = "remover" }: MiniEditorProps) {
  const accents = {
    remover: "#3b82f6",
    upscaler: "#a855f7",
    colorizer: "#ec4899",
  }

  const accent = accents[tool]

  return (
    <div
      className="group relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
      style={{ "--tool-accent": accent } as any}
    >
      <div className="flex h-12 items-center justify-between border-b border-white/5 bg-white/[0.02] px-4">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-red-500/50" />
          <div className="size-2 rounded-full bg-yellow-500/50" />
          <div className="size-2 rounded-full bg-green-500/50" />
        </div>
        <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-1 text-[10px] text-white/30">
          removerized.com/editor
        </div>
        <div className="size-4" />
      </div>

      <div className="flex h-[calc(100%-3rem)]">
        <div className="flex w-16 flex-col items-center gap-4 border-r border-white/5 pt-6">
          <div className={`flex size-10 items-center justify-center rounded-xl transition-all ${tool === "remover" ? "bg-white/10" : "hover:bg-white/5"}`}>
            <Trash2 className="size-5" style={{ color: tool === "remover" ? "#3b82f6" : "rgba(255,255,255,0.2)" }} />
          </div>
          <div className={`flex size-10 items-center justify-center rounded-xl transition-all ${tool === "upscaler" ? "bg-white/10" : "hover:bg-white/5"}`}>
            <Maximize className="size-5" style={{ color: tool === "upscaler" ? "#a855f7" : "rgba(255,255,255,0.2)" }} />
          </div>
          <div className={`flex size-10 items-center justify-center rounded-xl transition-all ${tool === "colorizer" ? "bg-white/10" : "hover:bg-white/5"}`}>
            <Palette className="size-5" style={{ color: tool === "colorizer" ? "#ec4899" : "rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center bg-black/40 p-12">
           <div className="relative aspect-square w-full max-w-sm rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="flex flex-col items-center gap-3"
              >
                <ImageIcon className="size-12 text-white/10" />
                <p className="text-xs font-medium text-white/20">Drop image here</p>
              </motion.div>

              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--tool-accent)] to-transparent opacity-50"
              />
           </div>

           <div className="absolute bottom-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md">
              <div className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10">
                <ZoomIn className="size-4 text-white/40" />
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10">
                <Download className="size-4 text-white/40" />
              </div>
           </div>
        </div>

        <div className="hidden w-64 flex-col border-l border-white/5 p-4 lg:flex">
          <div className="mb-4 h-4 w-24 rounded bg-white/10" />
          <div className="space-y-3">
            <div className="h-20 w-full rounded-xl bg-white/[0.03] border border-white/5" />
            <div className="h-8 w-full rounded-lg bg-white/[0.05]" />
            <div className="h-8 w-full rounded-lg bg-white/[0.05]" />
          </div>
          <div className="mt-auto flex h-12 items-center justify-center rounded-xl font-bold text-sm tracking-wide"
               style={{ backgroundColor: accent, color: "white" }}>
            RUN {tool.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
