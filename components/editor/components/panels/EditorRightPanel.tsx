"use client"

import { useState } from "react"
import { Eraser, Palette, Sparkles } from "lucide-react"

import type { ImageSetting } from "@/types/image-settings"
import { cn } from "@/lib/utils"

import { MODELS } from "../../constants"
import type {
  ActiveTool,
  ModelKey,
  ModelStatus,
  QueueResult,
  UpscalerModelKey,
} from "../../types"
import { ModelSelectorDialog } from "../ModelSelectorDialog"
import { ColorizerTab } from "./ColorizerTab"
import { EditorQueuePanel } from "./EditorQueuePanel"
import { RemoverTab } from "./RemoverTab"
import { UpscalerTab } from "./UpscalerTab"

interface EditorRightPanelProps {
  activeTool: ActiveTool
  onToolChange: (tool: ActiveTool) => void
  selectedModel: ModelKey
  onModelChange: (key: ModelKey) => void
  modelStatus: ModelStatus
  downloadProgress: number
  localSettings: ImageSetting | null
  onSettingsChange: (updated: ImageSetting) => void
  applyBgColor: boolean
  onToggleBgColor: () => void
  bgColor: string
  onBgColorChange: (color: string) => void
  hasImage: boolean
  onRemove: () => void
  hasResult: boolean
  hasUpscaled: boolean
  onUpscale: () => void
  hasColorized: boolean
  onColorize: () => void
  onDownload: () => void
  onDownloadSingle: () => void
  selectedUpscalerSettings: UpscalerModelKey
  onUpscalerSettingsChange: (key: UpscalerModelKey) => void
  upscalerModel: ModelKey
  colorizerModel: ModelKey
  files: File[]
  settings: ImageSetting[]
  selectedImage: string | null
  resultsData: QueueResult[]
  onFilesChange: (files: File[] | null) => void
  onRemoveFile: (file: File) => void
  onSelectImage: (url: string, name: string) => void
  onClearQueue: () => void
  accentColor: string
}

const TABS: { key: ActiveTool; label: string; Icon: React.ElementType }[] = [
  { key: "remover", label: "BG Remover", Icon: Eraser },
  { key: "upscaler", label: "Upscaler", Icon: Sparkles },
  { key: "colorizer", label: "Colorizer", Icon: Palette },
]

const MODEL_STATUS_DOT: Record<ModelStatus, string> = {
  ready: "bg-green-400",
  downloading: "bg-amber-400 animate-pulse",
  error: "bg-red-400",
  idle: "bg-white/20",
}

export const EditorRightPanel = ({
  activeTool,
  onToolChange,
  selectedModel,
  onModelChange,
  modelStatus,
  downloadProgress,
  localSettings,
  onSettingsChange,
  applyBgColor,
  onToggleBgColor,
  bgColor,
  onBgColorChange,
  hasImage,
  onRemove,
  hasResult,
  hasUpscaled,
  onUpscale,
  hasColorized,
  onColorize,
  onDownload,
  onDownloadSingle,
  selectedUpscalerSettings,
  onUpscalerSettingsChange,
  upscalerModel,
  colorizerModel,
  files,
  settings,
  selectedImage,
  resultsData,
  onFilesChange,
  onRemoveFile,
  onSelectImage,
  onClearQueue,
  accentColor,
}: EditorRightPanelProps) => {
  const [modelDialogOpen, setModelDialogOpen] = useState(false)

  return (
    <>
      <div className="glass-panel flex h-full flex-col border-l border-white/[0.06]">
        {/* Tab switcher */}
        <div className="flex shrink-0 gap-1.5 border-b border-white/[0.06] p-3">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => onToolChange(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              )}
              style={
                activeTool === key
                  ? {
                    backgroundColor: `${accentColor}18`,
                    borderColor: `${accentColor}45`,
                    color: "#fff",
                    boxShadow: `0 0 14px ${accentColor}18`,
                  }
                  : {
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    color: "rgba(255,255,255,0.35)",
                  }
              }
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Model selector button */}
          {(() => {
            const currentModelKey =
              activeTool === "remover"
                ? selectedModel
                : activeTool === "upscaler"
                  ? upscalerModel
                  : colorizerModel
            const currentModel = MODELS[currentModelKey]

            return (
              <>
                <button
                  onClick={() => setModelDialogOpen(true)}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3 text-left transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.06]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
                      AI Model
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {currentModel?.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-white/25">
                      {currentModel?.size}
                    </span>
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        MODEL_STATUS_DOT[modelStatus]
                      )}
                    />
                  </div>
                </button>
                {/* Accent divider */}
                <div
                  className="h-px w-full rounded-full opacity-30"
                  style={{
                    background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
                  }}
                />
              </>
            )
          })()}

          {/* Tool-specific controls */}
          {activeTool === "remover" && (
            <RemoverTab
              localSettings={localSettings}
              onSettingsChange={onSettingsChange}
              applyBgColor={applyBgColor}
              onToggleBgColor={onToggleBgColor}
              bgColor={bgColor}
              onBgColorChange={onBgColorChange}
              hasImage={hasImage}
              onRemove={onRemove}
              accentColor={accentColor}
              onDownload={onDownloadSingle}
            />
          )}
          {activeTool === "upscaler" && (
            <UpscalerTab
              hasImage={hasImage}
              hasResult={hasResult}
              hasUpscaled={hasUpscaled}
              onUpscale={onUpscale}
              onDownload={onDownload}
              accentColor={accentColor}
              selectedUpscalerSettings={selectedUpscalerSettings}
              onUpscalerSettingsChange={onUpscalerSettingsChange}
              localSettings={localSettings}
              onSettingsChange={onSettingsChange}
              onDownloadSingle={onDownloadSingle}
            />
          )}
          {activeTool === "colorizer" && (
            <ColorizerTab
              hasImage={hasImage}
              hasResult={hasResult}
              hasColorized={hasColorized}
              onColorize={onColorize}
              onDownload={onDownload}
              accentColor={accentColor}
              localSettings={localSettings}
              onSettingsChange={onSettingsChange}
              onDownloadSingle={onDownloadSingle}
            />
          )}

          {/* Queue section */}
          <div className="border-t border-white/[0.06] pt-4">
            <EditorQueuePanel
              files={files}
              settings={settings}
              selectedImage={selectedImage}
              resultsData={resultsData}
              onFilesChange={onFilesChange}
              onRemoveFile={onRemoveFile}
              onSelectImage={onSelectImage}
              onClearQueue={onClearQueue}
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>

      <ModelSelectorDialog
        open={modelDialogOpen}
        onOpenChange={setModelDialogOpen}
        activeTool={activeTool}
        selectedModel={
          activeTool === "remover"
            ? selectedModel
            : activeTool === "upscaler"
              ? upscalerModel
              : colorizerModel
        }
        modelStatus={modelStatus}
        downloadProgress={downloadProgress}
        onModelChange={onModelChange}
        accentColor={accentColor}
      />
    </>
  )
}
