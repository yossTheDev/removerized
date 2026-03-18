/* eslint-disable @next/next/no-img-element */
import { Layers, Trash } from "lucide-react"

import type { ImageSetting } from "@/types/image-settings"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
} from "@/components/ui/file-uploader"
import { Icons } from "@/components/icons"

import type { QueueResult } from "../../types"

interface EditorQueuePanelProps {
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

export const EditorQueuePanel = ({
  files,
  selectedImage,
  resultsData,
  onFilesChange,
  onRemoveFile,
  onSelectImage,
  onClearQueue,
  accentColor,
}: EditorQueuePanelProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Layers className="size-3.5 text-white/40" />
        <span className="text-xs font-semibold text-white/70">Queue</span>
        {files.length > 0 && (
          <span
            className="ml-auto flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {files.length}
          </span>
        )}
      </div>

      {/* Dropzone */}
      <FileUploader
        value={files}
        dropzoneOptions={{
          maxFiles: 10,
          accept: {
            "image/png": [".png"],
            "image/jpg": [".jpg", ".jpeg"],
            "image/webp": [".webp"],
          },
        }}
        onValueChange={onFilesChange}
        className="relative rounded-xl border border-dashed border-white/10 bg-white/[0.03] transition-all hover:border-white/20 hover:bg-white/[0.06]"
      >
        <FileInput>
          <Icons.SolarCloudUploadBoldDuotone className="mx-auto my-6 size-8 text-white/20" />
        </FileInput>
        <FileUploaderContent />
      </FileUploader>

      {/* Thumbnail list */}
      {files.length > 0 && (
        <div className="flex max-h-72 flex-col gap-2.5 overflow-y-auto pr-0.5">
          {files.map((file, index) => {
            const url = URL.createObjectURL(file)
            const isDone = resultsData.some((r) => r.name === file.name)
            const isSelected = selectedImage === file.name

            return (
              <div
                key={file.name + index}
                className={cn(
                  "group relative h-24 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200",
                  isSelected ? "border-2 shadow-lg" : "border-transparent"
                )}
                style={
                  isSelected
                    ? {
                        borderColor: accentColor,
                        boxShadow: `0 0 16px ${accentColor}30`,
                      }
                    : { borderColor: "rgba(255,255,255,0.06)" }
                }
              >
                <img
                  className="h-full w-full rounded-[10px] object-cover"
                  alt={`Queue item ${index + 1}: ${file.name}`}
                  src={url}
                  onClick={() => onSelectImage(url, file.name)}
                />

                {/* Gradient overlay */}
                <div className="pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/40 to-transparent" />

                {/* Filename */}
                <span className="pointer-events-none absolute bottom-1.5 left-2 max-w-[70%] truncate text-[9px] font-medium text-white/60">
                  {file.name}
                </span>

                {/* Done badge */}
                {isDone && (
                  <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-green-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    ✓
                  </span>
                )}

                {/* Remove button */}
                <Button
                  onClick={() => onRemoveFile(file)}
                  className="absolute right-1.5 top-1.5 size-6 rounded-full bg-black/60 p-0 text-white/70 opacity-0 transition-all hover:bg-black/80 hover:text-white group-hover:opacity-100"
                  variant="ghost"
                  size="icon"
                  title={`Remove ${file.name}`}
                >
                  <Trash className="size-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Clear Queue */}
      {files.length > 0 && (
        <Button
          onClick={onClearQueue}
          variant="ghost"
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] text-xs text-white/40 transition-all hover:border-white/10 hover:bg-white/[0.06] hover:text-white/70"
        >
          <Trash className="mr-2 size-3" />
          Clear Queue
        </Button>
      )}
    </div>
  )
}
