import { Download, Palette, Wand2 } from "lucide-react"

import type { ImageSetting } from "@/types/image-settings"
import { cn } from "@/lib/utils"
import ImageSettings from "@/components/settings/ImageSettings"

interface ColorizerTabProps {
  hasImage: boolean
  hasResult: boolean
  hasColorized: boolean
  onColorize: () => void
  onDownload: () => void
  accentColor: string
  localSettings: ImageSetting | null
  onSettingsChange: (updated: ImageSetting) => void
  onDownloadSingle?: () => void
}

export const ColorizerTab = ({
  hasImage,
  hasResult,
  hasColorized,
  onColorize,
  onDownload,
  accentColor,
  localSettings,
  onSettingsChange,
  onDownloadSingle,
}: ColorizerTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Per-image settings */}
      {localSettings ? (
        <ImageSettings settings={localSettings} onChange={onSettingsChange} onDownload={onDownloadSingle} />
      ) : (
        <p className="py-2 text-center text-xs text-white/30">
          Select an image to edit settings
        </p>
      )}

      {/* Context hint */}
      {hasImage && (
        <p className="text-center text-[10px] leading-relaxed text-white/30">
          {hasResult
            ? "Will colorize the processed result."
            : "Will colorize the original image."}
        </p>
      )}

      {/* Primary CTA */}
      <button
        onClick={onColorize}
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
        <Palette className="size-4" />
        Colorize Image
      </button>

      {/* Info section */}
      <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25">
            Powered by
          </p>
          <p className="text-[11px] font-semibold text-white/55 truncate">
            DeOldify AI
          </p>
          <p className="text-[9px] text-white/25">
            Artistic colorization · MIT license
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center rounded-lg bg-white/[0.04] p-1.5">
          <Wand2 className="size-3.5 text-white/30" />
        </div>
      </div>
    </div>
  )
}
