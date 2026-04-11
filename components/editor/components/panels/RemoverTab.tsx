import { Eraser } from "lucide-react"

import type { ImageSetting } from "@/types/image-settings"
import { cn } from "@/lib/utils"
import ImageSettings from "@/components/settings/ImageSettings"

interface RemoverTabProps {
  localSettings: ImageSetting | null
  onSettingsChange: (updated: ImageSetting) => void
  applyBgColor: boolean
  onToggleBgColor: () => void
  bgColor: string
  onBgColorChange: (color: string) => void
  hasImage: boolean
  onRemove: () => void
  accentColor: string
}

export const RemoverTab = ({
  localSettings,
  onSettingsChange,
  applyBgColor,
  onToggleBgColor,
  bgColor,
  onBgColorChange,
  hasImage,
  onRemove,
  accentColor,
}: RemoverTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Per-image settings */}
      {localSettings ? (
        <ImageSettings settings={localSettings} onChange={onSettingsChange} />
      ) : (
        <p className="py-2 text-center text-xs text-white/30">
          Select an image to edit settings
        </p>
      )}

      {/* Solid background */}
      <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/70">
            Solid Background
          </span>

          <button
            role="switch"
            aria-checked={applyBgColor}
            onClick={onToggleBgColor}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none"
            )}
            style={{
              backgroundColor: applyBgColor
                ? accentColor
                : "rgba(255,255,255,0.12)",
            }}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
                applyBgColor ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {applyBgColor && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange((e.target as any).value)}
              className="size-9 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
            />
            <input
              type="text"
              value={bgColor}
              maxLength={7}
              onChange={(e) => onBgColorChange((e.target as any).value)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/80 focus:outline-none focus:border-white/20"
            />
          </div>
        )}
      </div>

      {/* Remove Background CTA */}
      <button
        onClick={onRemove}
        disabled={!hasImage}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200",
          hasImage
            ? "cursor-pointer hover:opacity-90 active:scale-[0.98]"
            : "cursor-not-allowed opacity-30"
        )}
        style={
          hasImage
            ? {
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              boxShadow: `0 4px 20px ${accentColor}40`,
            }
            : { backgroundColor: "rgba(255,255,255,0.08)" }
        }
      >
        <Eraser className="size-4" />
        Remove Background
      </button>
    </div>
  )
}
