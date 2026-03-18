export type ActiveTool = "remover" | "upscaler"

export type ModelKey =
  | "ormbg_quantized"
  | "ormbg_fp16"
  | "isnet_quantized"
  | "isnet_fp16"
  | "birefnet_lite_quantized"
  | "birefnet_lite_fp16"
  | "rmbg_1_4_quantized"
  | "rmbg_1_4_fp16"
  | "modnet_quantized"

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
