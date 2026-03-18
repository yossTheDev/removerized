export type ActiveTool = "remover" | "upscaler"

export type ModelKey = "quantized" | "fp16" | "int8"

export type UpscalerModelKey = "performance" | "balanced" | "quality"

export type ModelStatus = "idle" | "downloading" | "ready" | "error"

export interface QueueResult {
  name: string
  data: Blob
}

export type ProgressCallback = (text: string, pct: number) => void

export interface DialogState {
  open: boolean
  text: string
  progress: number
}
