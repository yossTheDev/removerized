import type { ModelKey } from "./types"

// ── Model registry ────────────────────────────────────────────────────────────

/**
 * Registry of available ONNX background-removal models.
 * Each entry maps a ModelKey to its download URL, IndexedDB cache key,
 * and a human-readable label shown in the UI.
 */
export const MODELS: Record<
  ModelKey,
  { url: string; cacheKey: string; label: string }
> = {
  quantized: {
    url: "https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_quantized.onnx",
    cacheKey: "ormbg_quantized_v1",
    label: "Standard (~44 MB)",
  },
  fp16: {
    url: "https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_fp16.onnx",
    cacheKey: "ormbg_fp16_v1",
    label: "High-Res (~88 MB)",
  },
}

// ── IndexedDB ─────────────────────────────────────────────────────────────────

/** Name of the IndexedDB database used to cache model weights. */
export const IDB_NAME = "RemoverizerModelDB"

/** Object store name inside the database. */
export const IDB_STORE = "models"

/** Schema version – bump when adding new object stores. */
export const IDB_VERSION = 1

// ── ONNX inference ────────────────────────────────────────────────────────────

/**
 * Square pixel size used to resize images before feeding them
 * to the ONNX model.  Must match the model's expected input shape.
 */
export const INFERENCE_SIZE = 1024

// ── Runtime ───────────────────────────────────────────────────────────────────

/**
 * CDN base URL for onnxruntime-web WASM binaries.
 * Pinned to the exact installed version to guarantee compatibility.
 */
export const WASM_CDN_BASE =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/"
