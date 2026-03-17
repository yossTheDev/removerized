import { Eraser, Sparkles } from "lucide-react"

import type { ImageSetting } from "@/types/image-settings"
import { cn } from "@/lib/utils"
import AdBanner from "@/components/ads/ad-banner"

import type { ActiveTool, ModelKey, ModelStatus } from "../../types"
import { RemoverTab } from "./RemoverTab"
import { UpscalerTab } from "./UpscalerTab"

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditorLeftPanelProps {
  // ── Tab control ────────────────────────────────────────────────────────────
  /** Currently active tool tab */
  activeTool: ActiveTool
  /** Called when the user clicks a tab button */
  onToolChange: (tool: ActiveTool) => void

  // ── RemoverTab props ───────────────────────────────────────────────────────
  /** Settings for the currently selected image */
  localSettings: ImageSetting | null
  /** Called when the user edits a per-image setting */
  onSettingsChange: (updated: ImageSetting) => void

  /** Currently selected ONNX model variant */
  selectedModel: ModelKey
  /** Called when the user selects a different model */
  onModelChange: (key: ModelKey) => void
  /** Lifecycle state of the selected model */
  modelStatus: ModelStatus
  /** Download byte percentage while modelStatus === "downloading" */
  downloadProgress: number

  /** Whether the solid-background overlay is active */
  applyBgColor: boolean
  /** Toggles the solid-background switch on/off */
  onToggleBgColor: () => void
  /** Current hex colour value for the solid background */
  bgColor: string
  /** Called when the user picks a new colour */
  onBgColorChange: (color: string) => void

  /** Whether an image is loaded (enables the Remove Background button) */
  hasImage: boolean
  /** Triggers background removal for the selected image */
  onRemove: () => void

  // ── UpscalerTab props ──────────────────────────────────────────────────────
  /** Whether a processed result is available (upscales result instead of original) */
  hasResult: boolean
  /** Whether an upscaled image has been generated */
  hasUpscaled: boolean
  /** Triggers the upscaling operation */
  onUpscale: () => void
  /** Downloads the upscaled image */
  onDownload: () => void
}

// ── Tab definitions ───────────────────────────────────────────────────────────

/**
 * Static configuration for the two tool tabs.
 * Keeps the tab-switcher rendering loop declarative.
 */
const TABS: { key: ActiveTool; label: string; Icon: React.ElementType }[] = [
  { key: "remover", label: "BG Remover", Icon: Eraser },
  { key: "upscaler", label: "Upscaler", Icon: Sparkles },
]

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * EditorLeftPanel
 * ───────────────
 * The left floating sidebar of the editor.
 *
 * Structure:
 *  1. **Tab switcher** — a pill-style segmented control that toggles between
 *     "BG Remover" and "Upscaler" tabs.
 *  2. **Tab content** — conditionally renders either `RemoverTab` or
 *     `UpscalerTab` depending on `activeTool`.
 *  3. **AdBanner** — always visible at the bottom of the panel.
 *
 * This component acts as a layout shell — it owns no state of its own.
 * All data and callbacks flow in via props and are forwarded to the
 * appropriate child tab.
 */
export const EditorLeftPanel = ({
  activeTool,
  onToolChange,
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
  hasResult,
  hasUpscaled,
  onUpscale,
  onDownload,
}: EditorLeftPanelProps) => {
  return (
    <div className="pointer-events-auto h-fit max-h-[calc(100vh-6rem)] w-[22rem] overflow-y-auto rounded-md bg-white p-4 shadow-md backdrop-blur-3xl transition-all dark:bg-neutral-900/80">
      {/* ── Tab switcher ── */}
      <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onToolChange(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              activeTool === key
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Active tab content ── */}
      {activeTool === "remover" && (
        <RemoverTab
          localSettings={localSettings}
          onSettingsChange={onSettingsChange}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          modelStatus={modelStatus}
          downloadProgress={downloadProgress}
          applyBgColor={applyBgColor}
          onToggleBgColor={onToggleBgColor}
          bgColor={bgColor}
          onBgColorChange={onBgColorChange}
          hasImage={hasImage}
          onRemove={onRemove}
        />
      )}

      {activeTool === "upscaler" && (
        <UpscalerTab
          hasImage={hasImage}
          hasResult={hasResult}
          hasUpscaled={hasUpscaled}
          onUpscale={onUpscale}
          onDownload={onDownload}
        />
      )}

      {/* ── Ad banner — always rendered at the bottom ── */}
      <div className="mt-4">
        <AdBanner />
      </div>
    </div>
  )
}
