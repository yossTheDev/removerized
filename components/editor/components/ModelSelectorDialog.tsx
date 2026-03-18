"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  CloudDownload,
  Cpu,
  ExternalLink,
  Target,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { MODELS } from "../constants"
import { isModelCached } from "../lib/idb"
import type { ModelKey, ModelStatus } from "../types"

interface ModelSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedModel: ModelKey
  modelStatus: ModelStatus
  downloadProgress: number
  onModelChange: (key: ModelKey) => void
  accentColor: string
}

const MODEL_ICONS: Record<ModelKey, React.ElementType> = {
  quantized: Target,
  fp16: Cpu,
  int8: Zap,
}

export const ModelSelectorDialog = ({
  open,
  onOpenChange,
  selectedModel,
  modelStatus,
  downloadProgress,
  onModelChange,
  accentColor,
}: ModelSelectorDialogProps) => {
  const [cachedModels, setCachedModels] = useState<
    Partial<Record<ModelKey, boolean>>
  >({})

  useEffect(() => {
    if (!open) return
    const keys: ModelKey[] = ["quantized", "fp16", "int8"]
    Promise.all(
      keys.map(async (k): Promise<readonly [ModelKey, boolean]> => {
        try {
          const cached = await isModelCached(k)
          return [k, cached] as const
        } catch {
          return [k, false] as const
        }
      })
    ).then((results) => {
      const map: Partial<Record<ModelKey, boolean>> = {}
      results.forEach(([k, v]) => {
        map[k] = v
      })
      setCachedModels(map)
    })
  }, [open])

  const handleSelect = (mk: ModelKey) => {
    onModelChange(mk)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-[#0a0a0a]/95 text-white shadow-2xl backdrop-blur-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-white">
            Select AI Model
          </DialogTitle>
        </DialogHeader>

        {/* Model cards */}
        <div className="flex flex-col gap-2.5 pt-1">
          {(Object.keys(MODELS) as ModelKey[]).map((mk) => {
            const model = MODELS[mk]
            const Icon = MODEL_ICONS[mk]
            const isCached = cachedModels[mk] ?? false
            const isSelected = selectedModel === mk
            const isDownloading = isSelected && modelStatus === "downloading"
            const isReady = isSelected && modelStatus === "ready"

            return (
              <button
                key={mk}
                onClick={() => handleSelect(mk)}
                className={cn(
                  "group relative flex items-start gap-3.5 overflow-hidden rounded-xl border p-4 text-left transition-all duration-200",
                  !isSelected &&
                    "border-white/[0.06] bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.06]"
                )}
                style={
                  isSelected
                    ? {
                        borderColor: `${accentColor}50`,
                        backgroundColor: `${accentColor}10`,
                        boxShadow: `0 0 20px ${accentColor}15, inset 0 0 20px ${accentColor}05`,
                      }
                    : undefined
                }
              >
                {/* Radial glow on selected */}
                {isSelected && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                    style={{
                      background: `radial-gradient(ellipse at top left, ${accentColor}40, transparent 60%)`,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className="relative mt-0.5 flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors"
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${accentColor}25`,
                          color: accentColor,
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.35)",
                        }
                  }
                >
                  <Icon className="size-4" />
                </div>

                {/* Text */}
                <div className="relative flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">
                      {model.label}
                    </span>
                    <span className="shrink-0 text-[10px] text-white/35">
                      {model.size}
                    </span>
                  </div>
                  <span className="text-xs text-white/45">
                    {model.description}
                  </span>

                  {/* Download progress bar */}
                  {isDownloading && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${downloadProgress}%`,
                            backgroundColor: accentColor,
                            boxShadow: `0 0 8px ${accentColor}`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-amber-400">
                        Downloading… {downloadProgress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Status icon */}
                <div className="relative ml-1 shrink-0 self-center">
                  {isCached || isReady ? (
                    <CheckCircle2 className="size-4 text-green-400" />
                  ) : isDownloading ? (
                    <CloudDownload className="size-4 animate-pulse text-amber-400" />
                  ) : (
                    <CloudDownload className="size-4 text-white/20" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* ORMBG credits + HuggingFace link */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Powered by
            </p>
            <p className="text-xs font-semibold text-white/70 truncate">
              ORMBG — Object Removal from Background
            </p>
            <p className="text-[10px] text-white/35">
              by{" "}
              <span className="font-medium text-white/50">onnx-community</span>
              {" · "}
              <span className="text-white/35">Apache-2.0 license</span>
            </p>
          </div>

          <a
            href="https://huggingface.co/onnx-community/ormbg-ONNX"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-2 text-[10px] font-medium text-white/45 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white/80"
          >
            <ExternalLink className="size-3" />
            HuggingFace
          </a>
        </div>

        {/* Cache hint */}
        <p className="text-[10px] leading-relaxed text-white/20">
          Models are cached in IndexedDB after the first download — switching
          between cached models is instant.
        </p>
      </DialogContent>
    </Dialog>
  )
}
