import { Download, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

// ── Types ─────────────────────────────────────────────────────────────────────

interface UpscalerTabProps {
  /** Whether an image is currently selected in the queue */
  hasImage: boolean
  /** Whether a processed result is currently displayed (upscales the result) */
  hasResult: boolean
  /** Whether an upscaled version is available for download */
  hasUpscaled: boolean
  /** Called when the user triggers an upscale operation */
  onUpscale: () => void
  /** Called when the user downloads the upscaled image */
  onDownload: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * UpscalerTab
 * ───────────
 * Content panel rendered inside the left sidebar when the "Upscaler" tab
 * is active.
 *
 * Behaviour:
 *  - When no image is selected, a placeholder message guides the user.
 *  - When an image is selected, an "Upscale Image" button is shown.
 *    The description adapts to tell the user whether the original or the
 *    already-processed result will be upscaled.
 *  - After a successful upscale, a secondary "Download Upscaled" button
 *    appears so the user can save the result without switching tabs.
 *
 * This component is intentionally stateless — all logic lives in the
 * parent orchestrator (Editor/index.tsx).
 */
export const UpscalerTab = ({
  hasImage,
  hasResult,
  hasUpscaled,
  onUpscale,
  onDownload,
}: UpscalerTabProps) => {
  if (!hasImage) {
    return (
      <p className="mt-2 text-center text-sm text-neutral-400">
        Select an image to upscale
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Contextual description */}
      <p className="text-center text-xs leading-relaxed text-neutral-400">
        Enhances and upscales using AI (TensorFlow.js).{" "}
        {hasResult
          ? "Will upscale the processed result."
          : "Will upscale the original image."}
      </p>

      {/* Primary action */}
      <Button onClick={onUpscale} className="w-full">
        <Sparkles className="mr-2 size-4" />
        Upscale Image
      </Button>

      {/* Secondary action — only visible after a successful upscale */}
      {hasUpscaled && (
        <Button onClick={onDownload} variant="outline" className="w-full">
          <Download className="mr-2 size-4" />
          Download Upscaled
        </Button>
      )}
    </div>
  )
}
