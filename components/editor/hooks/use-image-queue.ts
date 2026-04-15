import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import type { ImageSetting } from "@/types/image-settings"

import type { QueueResult } from "../types"

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useImageQueue
 * ─────────────
 * Manages the full lifecycle of the image queue: file list, per-file settings,
 * the currently selected image, and its processed result.
 *
 * Responsibilities:
 *  - Accept new files (deduplication included).
 *  - Remove individual files from the queue.
 *  - Track which image is currently selected in the preview.
 *  - Sync `localSettings` whenever the selected image or the settings array changes.
 *  - Expose setters so action hooks can push new results into the queue.
 */
export const useImageQueue = () => {
  // ── File list & per-file settings ────────────────────────────────────────

  /** All files currently in the processing queue. */
  const [files, setFiles] = useState<File[]>([])

  /**
   * Per-file settings (format, quality, …).
   * One entry per file, keyed by `file.name`.
   */
  const [settings, setSettings] = useState<ImageSetting[]>([])

  // ── Selection & preview ───────────────────────────────────────────────────

  /** Name of the file currently shown in the compare slider. */
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  /**
   * Settings of the currently selected image.
   * Kept in sync with `settings` via useEffect.
   */
  const [localSettings, setLocalSettings] = useState<ImageSetting | null>(null)

  /** Object URL of the currently selected original image. */
  const [imageData, setImageData] = useState<string | null>(null)

  /** Object URL of the processed result for the selected image (if any). */
  const [resultData, setResultData] = useState<string | null>(null)

  // ── Results store ─────────────────────────────────────────────────────────

  /**
   * Accumulated processed results.
   * Stored as Blob to avoid keeping large base64 strings in memory.
   */
  const [resultsData, setResultsData] = useState<QueueResult[]>([])

  // ── Sync localSettings & resultData when selection changes ───────────────

  useEffect(() => {
    // Mirror the settings entry for the currently selected file.
    setLocalSettings(
      settings.find((s) => s.name === selectedImage) ?? null
    )

    // Reflect the already-processed result if it exists.
    const existing = resultsData.find((r) => r.name === selectedImage)
    setResultData(existing ? URL.createObjectURL(existing.data) : null)
  }, [resultsData, selectedImage, settings])

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Handles files dropped / selected by the user.
   *
   * - Filters out duplicates (by file name) and toasts when all were dupes.
   * - Appends new ImageSetting entries with sensible defaults.
   * - Selects the last file in the batch for immediate preview.
   *
   * @param incoming - Array of File objects from the dropzone, or null.
   */
  const handleDataChange = useCallback(
    (_files: File[] | null) => {
      if (!_files?.length) return

      const duplicates: string[] = []

      // Build settings entries only for genuinely new files.
      const newSettings = _files.reduce((acc: ImageSetting[], file) => {
        if (settings.some((s) => s.name === file.name)) {
          duplicates.push(file.name)
          return acc
        }
        acc.push({ format: "image/webp", name: file.name, quality: 80 })
        return acc
      }, [])

      // All files already existed — nothing to add.
      if (duplicates.length === _files.length) {
        toast(`All selected files already exist: ${duplicates.join(", ")}`)
        return
      }

      if (newSettings.length > 0) {
        setSettings((prev) => [...prev, ...newSettings])
      }

      // Only enqueue files that aren't already present.
      const newFiles = _files.filter(
        (f) => !settings.some((s) => s.name === f.name)
      )
      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles])
      }

      // Auto-select the last dropped file for immediate preview.
      const last = _files[_files.length - 1]
      if (last) {
        setSelectedImage(last.name)
        setImageData(URL.createObjectURL(last))
        setResultData(null)
      }
    },
    [settings]
  )

  /**
   * Removes a single file from the queue along with its settings entry.
   * Does not affect already-computed results.
   *
   * @param file - The File object to remove.
   */
  const handleRemoveFile = useCallback((file: File) => {
    setFiles((prev) => prev.filter((f) => f.name !== file.name))
    setSettings((prev) => prev.filter((s) => s.name !== file.name))
  }, [])

  /**
   * Selects a file for preview by switching `selectedImage`, `imageData`,
   * and loading its result (if already processed).
   *
   * @param url  - Object URL pointing to the original file.
   * @param name - File name used as the unique identifier.
   */
  const handleChangeImage = useCallback(
    (url: string, name: string) => {
      setSelectedImage(name)
      setImageData(url)
      const existing = resultsData.find((r) => r.name === name)
      setResultData(existing ? URL.createObjectURL(existing.data) : null)
    },
    [resultsData]
  )

  /**
   * Resets the entire queue to its initial empty state.
   * Call this when the user clicks "Clear Queue".
   */
  const clearQueue = useCallback(() => {
    setFiles([])
    setSettings([])
    setSelectedImage(null)
    setLocalSettings(null)
    setImageData(null)
    setResultData(null)
    setResultsData([])
  }, [])

  /**
   * Updates the settings entry for the currently selected image.
   * Syncs both `localSettings` (immediate UI feedback) and the `settings` array.
   *
   * @param updated - The new ImageSetting value.
   */
  const updateLocalSettings = useCallback(
    (updated: ImageSetting) => {
      setLocalSettings(updated)
      setSettings((prev) =>
        prev.map((item) => (item.name !== selectedImage ? item : updated))
      )
    },
    [selectedImage]
  )

  return {
    // State
    files,
    settings,
    selectedImage,
    localSettings,
    imageData,
    resultData,
    resultsData,

    // Setters exposed to action hooks
    setResultData,
    setResultsData,

    // Handlers
    handleDataChange,
    handleRemoveFile,
    handleChangeImage,
    clearQueue,
    updateLocalSettings,
  }
}
