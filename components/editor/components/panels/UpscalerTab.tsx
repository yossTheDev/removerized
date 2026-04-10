import {
  Download,
  ExternalLink,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { UPSCALER_MODELS } from "../../constants"
import type { UpscalerModelKey } from "../../types"

interface UpscalerTabProps {
  hasImage: boolean
  hasResult: boolean
  hasUpscaled: boolean
  onUpscale: () => void
  onDownload: () => void
  accentColor: string
  selectedUpscalerSettings: UpscalerModelKey
  onUpscalerSettingsChange: (key: UpscalerModelKey) => void
}

const MODEL_ICONS: Record<UpscalerModelKey, React.ElementType> = {
  performance: Zap,
  balanced: Star,
  quality: Shield,
}

export const UpscalerTab = ({
  hasImage,
  hasResult,
  hasUpscaled,
  onUpscale,
  onDownload,
  accentColor,
  selectedUpscalerSettings,
  onUpscalerSettingsChange,
}: UpscalerTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Model selector */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Processing Mode
        </p>

        <div className="flex flex-col gap-1.5">
          {(Object.keys(UPSCALER_MODELS) as UpscalerModelKey[]).map((mk) => {
            const model = UPSCALER_MODELS[mk]
            const Icon = MODEL_ICONS[mk]
            const isSelected = selectedUpscalerSettings === mk

            return (
              <button
                key={mk}
                onClick={() => onUpscalerSettingsChange(mk)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                  !isSelected &&
                    "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.06]"
                )}
                style={
                  isSelected
                    ? {
                        borderColor: `${accentColor}50`,
                        backgroundColor: `${accentColor}12`,
                        boxShadow: `0 0 16px ${accentColor}12`,
                      }
                    : undefined
                }
              >
                <div
                  className="flex shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors"
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
                  <Icon className="size-3.5" />
                </div>

                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-white/80">
                      {model.label}
                    </span>
                    <span
                      className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] text-white/30"
                      style={
                        isSelected
                          ? {
                              backgroundColor: `${accentColor}20`,
                              color: `${accentColor}cc`,
                            }
                          : { backgroundColor: "rgba(255,255,255,0.04)" }
                      }
                    >
                      {model.detail}
                    </span>
                  </div>
                  <span className="text-[10px] leading-tight text-white/35">
                    {model.description}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Context hint */}
      {hasImage && (
        <p className="text-center text-[10px] leading-relaxed text-white/30">
          {hasResult
            ? "Will upscale the processed result."
            : "Will upscale the original image."}
        </p>
      )}

      {/* Primary CTA */}
      <button
        onClick={onUpscale}
        disabled={!hasImage}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200",
          hasImage
            ? "cursor-pointer hover:brightness-110 active:scale-[0.98]"
            : "cursor-not-allowed opacity-25"
        )}
        style={
          hasImage
            ? {
                background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}99)`,
                borderColor: `${accentColor}60`,
                boxShadow: `0 0 20px ${accentColor}30, 0 4px 12px rgba(0,0,0,0.3)`,
              }
            : {
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: "transparent",
              }
        }
      >
        <Sparkles className="size-4" />
        Upscale Image
      </button>

      {/* Download — after successful upscale */}
      {hasUpscaled && (
        <button
          onClick={onDownload}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
        >
          <Download className="size-4" />
          Download Upscaled
        </button>
      )}

      {/* ONNX credits */}
      <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25">
            Powered by
          </p>
          <p className="text-[11px] font-semibold text-white/55 truncate">
            ONNX Runtime Web
          </p>
          <p className="text-[9px] text-white/25">
            4× Swin2SR super-resolution · Apache-2.0
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center rounded-lg bg-white/[0.04] p-1.5">
          <Sparkles className="size-3.5 text-white/30" />
        </div>
      </div>
    </div>
  )
}
