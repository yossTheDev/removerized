"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  CloudDownload,
  Cpu,
  ExternalLink,
  Weight,
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
import type { ActiveTool, ModelKey, ModelStatus } from "../types"

interface ModelSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTool: ActiveTool
  selectedModel: ModelKey
  modelStatus: ModelStatus
  downloadProgress: number
  onModelChange: (key: ModelKey) => void
  accentColor: string
}

/**
 * Returns an icon based on model size string (e.g., "~44 MB")
 */
const getModelIcon = (sizeStr: string) => {
  const size = parseInt(sizeStr.replace(/[^0-9]/g, ""))
  if (size < 40) return Zap // Ultra light
  if (size < 60) return Cpu // Standard
  return Weight // Heavy/High-res
}

export const ModelSelectorDialog = ({
  open,
  onOpenChange,
  activeTool,
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

    const keys = Object.keys(MODELS) as ModelKey[]

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

  // Info for the footer credit section based on currently selected model
  const currentModelInfo = MODELS[selectedModel]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-[#0a0a0a]/95 text-white shadow-2xl backdrop-blur-2xl sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-white">
            Select AI Model
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 pt-1">
          {(Object.keys(MODELS) as ModelKey[])
            .filter((mk) => MODELS[mk].tool === activeTool)
            .map((mk) => {
              const model = MODELS[mk]
              const Icon = getModelIcon(model.size)
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
                  {isSelected && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                      style={{
                        background: `radial-gradient(ellipse at top left, ${accentColor}40, transparent 60%)`,
                      }}
                    />
                  )}

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

                  <div className="relative flex flex-1 flex-col gap-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {model.label}
                      </span>
                      <span className="shrink-0 text-[10px] text-white/35">
                        {model.size}
                      </span>
                    </div>
                    <span className="text-xs text-white/45 line-clamp-1">
                      {model.description}
                    </span>

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

        <div className="h-px w-full bg-white/[0.06]" />

        {/* Dynamic Model Info Section */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Selected Model Info
            </p>
            <p className="text-xs font-semibold text-white/70 truncate">
              {currentModelInfo?.title}
            </p>
            <p className="text-[10px] text-white/35">
              by{" "}
              <span className="font-medium text-white/50">
                {currentModelInfo?.author}
              </span>
              {" · "}
              <span className="text-white/35">{currentModelInfo?.license}</span>
            </p>
          </div>

          <a
            href={currentModelInfo?.hfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-2 text-[10px] font-medium text-white/45 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white/80"
          >
            <ExternalLink className="size-3" />
            HF
          </a>
        </div>

        <p className="text-[10px] leading-relaxed text-white/20">
          Models are cached in IndexedDB — switching between cached models is
          instant. Input type:{" "}
          <code className="text-white/40">{currentModelInfo?.inputType}</code>.
        </p>
      </DialogContent>
    </Dialog>
  )
}
