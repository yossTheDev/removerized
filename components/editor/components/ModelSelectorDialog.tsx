"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, CloudDownload, Cpu, Target, Zap } from "lucide-react"

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
                  isSelected
                    ? "border-white/20 bg-white/8"
                    : "border-white/[0.06] bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.06]"
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
                {/* Glow ring on selected */}
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

                  {/* Download progress — only for active model while downloading */}
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

                {/* Status badge */}
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

        <p className="pt-1 text-[10px] leading-relaxed text-white/25">
          Models are cached in IndexedDB after first download. Switching models
          does not require re-downloading if already cached.
        </p>
      </DialogContent>
    </Dialog>
  )
}
