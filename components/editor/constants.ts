import type { ActiveTool, ModelKey, UpscalerModelKey } from "./types"

export const MODELS: Record<
  ModelKey,
  {
    url: string
    cacheKey: string
    label: string
    description: string
    size: string
  }
> = {
  quantized: {
    url: "https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_quantized.onnx",
    cacheKey: "ormbg_quantized_v1",
    label: "Balanced",
    description: "Optimized for web performance",
    size: "~44 MB",
  },
  fp16: {
    url: "https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_fp16.onnx",
    cacheKey: "ormbg_fp16_v1",
    label: "High Precision",
    description: "Best for complex details",
    size: "~88 MB",
  },
  int8: {
    url: "https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_quantized.onnx",
    cacheKey: "ormbg_int8_v1",
    label: "Fast / Mobile",
    description: "Priority on speed",
    size: "~44 MB",
  },
}

export const UPSCALER_MODELS: Record<
  UpscalerModelKey,
  {
    label: string
    description: string
    patchSize: number
    padding: number
    detail: string
  }
> = {
  performance: {
    label: "Performance",
    description: "Fastest processing, lower memory usage",
    patchSize: 32,
    padding: 1,
    detail: "patch 32 · pad 1",
  },
  balanced: {
    label: "Balanced",
    description: "Best speed/quality tradeoff",
    patchSize: 64,
    padding: 2,
    detail: "patch 64 · pad 2",
  },
  quality: {
    label: "Quality",
    description: "Maximum detail, slower processing",
    patchSize: 128,
    padding: 4,
    detail: "patch 128 · pad 4",
  },
}

export const TOOL_ACCENTS: Record<ActiveTool, string> = {
  remover: "#A855F7",
  upscaler: "#3B82F6",
}

export const SEO_CONTENT: Record<
  ActiveTool,
  { heading: string; subheading: string; body: string; features: string[] }
> = {
  remover: {
    heading: "AI Background Removal",
    subheading: "Instant & Private",
    body: "Remove backgrounds from any image with on-device AI. No uploads, no server, fully offline-capable.",
    features: [
      "100% Client-Side",
      "WebAssembly Accelerated",
      "Transparent PNG Output",
      "Batch Processing",
    ],
  },
  upscaler: {
    heading: "AI Image Upscaler",
    subheading: "Enhance Resolution",
    body: "Super-resolution AI upscales images up to 4× with TensorFlow.js — zero cloud dependency.",
    features: [
      "4× Super Resolution",
      "TensorFlow.js Powered",
      "Edge-Preserving Detail",
      "Works Offline",
    ],
  },
}

export const IDB_NAME = "RemoverizerModelDB"

export const IDB_STORE = "models"

export const IDB_VERSION = 1

export const INFERENCE_SIZE = 1024

export const WASM_CDN_BASE =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/"
