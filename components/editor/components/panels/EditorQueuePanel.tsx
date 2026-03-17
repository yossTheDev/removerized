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

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditorQueuePanelProps {
  /** All files currently in the processing queue */
  files: File[]
  /** Per-file settings array — used only to know the queue length */
  settings: ImageSetting[]
  /** Name of the currently selected/previewed image */
  selectedImage: string | null
  /** Processed results — used to show the ✓ badge on completed items */
  resultsData: QueueResult[]
  /** Called when the user drops or selects new files */
  onFilesChange: (files: File[] | null) => void
  /** Called when the user clicks the remove button on a queue item */
  onRemoveFile: (file: File) => void
  /** Called when the user clicks a thumbnail to preview that image */
  onSelectImage: (url: string, name: string) => void
  /** Called when the user clicks "Clear Queue" */
  onClearQueue: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * EditorQueuePanel
 * ────────────────
 * The right-side floating panel that displays the image processing queue.
 *
 * Sections (top → bottom):
 *  1. **Header** — "Queue" label + red count badge when files are present.
 *  2. **Dropzone** — `FileUploader` / `FileInput` area; accepts PNG, JPG, WebP
 *     (max 10 files). Delegates file acceptance to `onFilesChange`.
 *  3. **Thumbnail list** — scrollable column of image thumbnails.
 *     - Active image is highlighted with a `#FF2587` border.
 *     - Completed items show a green ✓ badge.
 *     - A trash button appears on hover to remove individual items.
 *  4. **Clear Queue** — destructive button that removes all files from the queue.
 *
 * This component is purely presentational — all state lives in the parent
 * `Editor` orchestrator and is passed in via props.
 */
export const EditorQueuePanel = ({
  files,
  selectedImage,
  resultsData,
  onFilesChange,
  onRemoveFile,
  onSelectImage,
  onClearQueue,
}: EditorQueuePanelProps) => {
  return (
    <div className="pointer-events-auto ml-auto h-fit w-60 rounded-md bg-white p-4 backdrop-blur-3xl transition-all dark:bg-neutral-900/80">
      {/* ── Header ── */}
      <div className="flex items-center justify-center gap-2 p-2">
        <Layers className="size-4" />
        <span className="text-sm font-semibold">Queue</span>

        {/* Item count badge — only shown when the queue is non-empty */}
        {files.length > 0 && (
          <span className="flex items-center justify-center rounded-xl bg-red-600 px-2 text-xs font-semibold text-white">
            {files.length}
          </span>
        )}
      </div>

      {/* ── Dropzone ── */}
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
        className="relative max-w-xs space-y-1 rounded-xl bg-neutral-300 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-900"
      >
        <FileInput>
          {/* Upload icon centred inside the drop area */}
          <Icons.SolarCloudUploadBoldDuotone className="mx-auto my-8 size-10 text-neutral-700 dark:text-neutral-400" />
        </FileInput>
        <FileUploaderContent />
      </FileUploader>

      {/* ── Thumbnail list ── */}
      <div className="mt-4 flex h-fit max-h-80 flex-col gap-4 overflow-x-hidden overflow-y-scroll">
        {files.map((file, index) => {
          // Create a stable object URL for the thumbnail.
          // Note: these URLs are not explicitly revoked here because the file
          // reference is stable for the lifetime of the queue entry.
          const url = URL.createObjectURL(file)
          const isDone = resultsData.some((r) => r.name === file.name)
          const isSelected = selectedImage === file.name

          return (
            <div
              key={file.name + index}
              className={cn(
                "group relative h-32 cursor-pointer rounded border-2 bg-slate-500 transition-all",
                isSelected
                  ? "border-[#FF2587]"
                  : "border-neutral-900 dark:border-neutral-300"
              )}
            >
              {/* Thumbnail image — clicking selects this file for preview */}
              <img
                className="h-32 w-full rounded object-cover"
                alt={`Queue item ${index + 1}: ${file.name}`}
                src={url}
                onClick={() => onSelectImage(url, file.name)}
              />

              {/* ✓ badge shown once the image has been processed */}
              {isDone && (
                <span className="absolute bottom-1 right-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  ✓
                </span>
              )}

              {/* Remove button — appears on hover */}
              <Button
                onClick={() => onRemoveFile(file)}
                className="absolute left-1 top-1 rounded-full bg-neutral-800 text-neutral-100 opacity-0 transition-all group-hover:opacity-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950"
                variant="ghost"
                size="icon"
                title={`Remove ${file.name}`}
              >
                <Trash />
              </Button>
            </div>
          )
        })}
      </div>

      {/* ── Clear Queue ── */}
      <div className="mt-4 flex flex-col gap-2">
        <Button
          onClick={onClearQueue}
          disabled={files.length === 0}
          variant="surface"
        >
          <Trash className="mr-2 size-4" />
          Clear Queue
        </Button>
      </div>
    </div>
  )
}
