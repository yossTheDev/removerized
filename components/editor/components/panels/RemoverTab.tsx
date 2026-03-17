import { AlertCircle, CheckCircle2, CloudDownload, Eraser } from "lucide-react"

import type { ImageSetting } from "@/types/image-settings"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import ImageSettings from "@/components/settings/ImageSettings"

import { MODELS } from "../../constants"
import type { ModelKey, ModelStatus } from "../../types"

// ── Types ─────────────────────────────────────────────────────────────────────

interface RemoverTabProps {
  /** Settings of the currently selected image, or null if none selected */
  localSettings: ImageSetting | null
  /** Called when the user edits any per-image setting */
  onSettingsChange: (updated: ImageSetting) => void

  /** Currently selected ONNX model variant */
  selectedModel: ModelKey
  /** Called when the user switches model variant */
  onModelChange: (key: ModelKey) => void
  /** Current download / load state of the selected model */
  modelStatus: ModelStatus
  /** Download percentage shown while modelStatus === "downloading" */
  downloadProgress: number

  /** Whether the solid-background overlay is enabled */
  applyBgColor: boolean
  /** Called when the user toggles the solid-background switch */
  onToggleBgColor: () => void
  /** Current hex colour value for the background overlay */
  bgColor: string
  /** Called when the user picks a new colour */
  onBgColorChange: (color: string) => void

  /** Whether an image is currently loaded (enables the Remove button) */
  hasImage: boolean
  /** Called when the user clicks "Remove Background" */
  onRemove: () => void
}

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * ModelStatusBadge
 * ────────────────
 * Compact inline badge that reflects the ONNX model's current lifecycle state.
 *
 * States:
 *  - ready       → green "Cached" with checkmark
 *  - downloading → amber "N%" with cloud-download icon
 *  - error       → red "Error" with alert icon
 *  - idle        → muted "Not downloaded"
 */
const ModelStatusBadge = ({
  status,
  downloadProgress,
}: {
  status: ModelStatus
  downloadProgress: number
}) => {
  if (status === "ready")
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-green-500">
        <CheckCircle2 className="size-3" />
        Cached
      </span>
    )

  if (status === "downloading")
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500">
        <CloudDownload className="size-3" />
        {downloadProgress}%
      </span>
    )

  if (status === "error")
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
        <AlertCircle className="size-3" />
        Error
      </span>
    )

  return <span className="text-[10px] text-neutral-400">Not downloaded</span>
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * RemoverTab
 * ──────────
 * Content panel rendered inside the left sidebar when the "BG Remover" tool
 * tab is active.
 *
 * Sections (top → bottom):
 *  1. **Model selector** – segmented control to choose between Standard
 *     (quantized, ~44 MB) and High-Res (fp16, ~88 MB) ONNX models, plus a
 *     status badge showing whether the model is cached / downloading / errored.
 *  2. **Per-image settings** – delegates to the shared `ImageSettings` form
 *     (format, quality). Hidden with a placeholder when no image is selected.
 *  3. **Solid background** – toggle switch + colour picker that composites a
 *     solid colour behind the transparent PNG after removal.
 *  4. **Remove Background button** – triggers the inference pipeline for the
 *     currently selected image.
 *
 * This component is purely presentational: all state and callbacks come from
 * the parent via props.
 */
export const RemoverTab = ({
  localSettings,
  onSettingsChange,
  selectedModel,
  onModelChange,
  modelStatus,
  downloadProgress,
  applyBgColor,
  onToggleBgColor,
  bgColor,
  onBgColorChange,
  hasImage,
  onRemove,
}: RemoverTabProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* ── 1. Model selector ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">AI Model</span>
          {/* Reflects the cached / downloading / error / idle state */}
          <ModelStatusBadge
            status={modelStatus}
            downloadProgress={downloadProgress}
          />
        </div>

        {/* Segmented pill control — one button per ModelKey */}
        <div className="flex gap-1 rounded-md bg-neutral-100 p-0.5 dark:bg-neutral-800">
          {(["quantized", "fp16"] as ModelKey[]).map((mk) => (
            <button
              key={mk}
              onClick={() => onModelChange(mk)}
              className={cn(
                "flex flex-1 flex-col items-center rounded px-2 py-1.5 text-center text-[10px] transition-all",
                selectedModel === mk
                  ? "bg-white font-semibold text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              <span className="font-medium">
                {mk === "quantized" ? "Standard" : "High-Res"}
              </span>
              {/* Show only the size portion of the label */}
              <span className="opacity-60">
                {mk === "quantized" ? "~44 MB" : "~88 MB"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Per-image settings ── */}
      {localSettings ? (
        <ImageSettings settings={localSettings} onChange={onSettingsChange} />
      ) : (
        <p className="mt-2 text-center text-sm text-neutral-400">
          Select an image to edit
        </p>
      )}

      {/* ── 3. Solid background colour ── */}
      <div className="flex flex-col gap-3 border-t pt-4 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Solid Background</span>

          {/* Custom accessible toggle switch */}
          <button
            role="switch"
            aria-checked={applyBgColor}
            onClick={onToggleBgColor}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none",
              applyBgColor
                ? "bg-[#FF2587]"
                : "bg-neutral-300 dark:bg-neutral-600"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                applyBgColor ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Colour picker — only visible when the toggle is on */}
        {applyBgColor && (
          <div className="flex items-center gap-2">
            {/* Native colour wheel */}
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange(e.target.value)}
              className="size-9 cursor-pointer rounded border border-neutral-200 p-0.5 dark:border-neutral-700"
            />
            {/* Hex text input for precision entry */}
            <input
              type="text"
              value={bgColor}
              maxLength={7}
              onChange={(e) => onBgColorChange(e.target.value)}
              className="flex-1 rounded-md border border-neutral-200 bg-transparent px-3 py-1.5 font-mono text-sm dark:border-neutral-700"
            />
          </div>
        )}
      </div>

      {/* ── 4. Remove Background CTA ── */}
      <Button onClick={onRemove} disabled={!hasImage} className="w-full">
        <Eraser className="mr-2 size-4" />
        Remove Background
      </Button>
    </div>
  )
}
