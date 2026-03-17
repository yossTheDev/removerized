/** Active tool tab displayed in the left panel */
export type ActiveTool = "remover" | "upscaler"

/** ONNX model variant selected by the user */
export type ModelKey = "quantized" | "fp16"

/**
 * Lifecycle state of the ONNX model.
 * - idle        → not yet downloaded
 * - downloading → fetch in progress (stored in IndexedDB after)
 * - ready       → session is loaded and cached in memory
 * - error       → download or session creation failed
 */
export type ModelStatus = "idle" | "downloading" | "ready" | "error"

/** A single processed image stored in the results queue */
export interface QueueResult {
  /** Original file name — used as the unique key across all queues */
  name: string
  /** Processed image data as a transparent PNG Blob */
  data: Blob
}

/**
 * Callback signature used throughout the inference pipeline to report
 * progress back to the UI.
 *
 * @param text - Human-readable status message shown in the dialog
 * @param pct  - Progress percentage in the range [0, 100]
 */
export type ProgressCallback = (text: string, pct: number) => void

/** State object managed by useProcessingDialog */
export interface DialogState {
  /** Whether the modal is currently open */
  open: boolean
  /** Message shown inside the dialog */
  text: string
  /** Current progress value in [0, 100]; 0 renders a spinner instead */
  progress: number
}
