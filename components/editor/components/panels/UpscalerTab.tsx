import { Download, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

interface UpscalerTabProps {
  hasImage: boolean
  hasResult: boolean
  hasUpscaled: boolean
  onUpscale: () => void
  onDownload: () => void
  accentColor: string
}

export const UpscalerTab = ({
  hasImage,
  hasResult,
  hasUpscaled,
  onUpscale,
  onDownload,
  accentColor,
}: UpscalerTabProps) => {
  if (!hasImage) {
    return (
      <p className="mt-2 text-center text-sm text-white/30">
        Select an image to upscale
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs leading-relaxed text-white/35">
        Enhances and upscales using AI (TensorFlow.js).{" "}
        {hasResult
          ? "Will upscale the processed result."
          : "Will upscale the original image."}
      </p>

      <button
        onClick={onUpscale}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        )}
        style={{
          background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}99)`,
          borderColor: `${accentColor}60`,
          boxShadow: `0 0 20px ${accentColor}30, 0 4px 12px rgba(0,0,0,0.3)`,
        }}
      >
        <Sparkles className="size-4" />
        Upscale Image
      </button>

      {hasUpscaled && (
        <button
          onClick={onDownload}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
        >
          <Download className="size-4" />
          Download Upscaled
        </button>
      )}
    </div>
  )
}
