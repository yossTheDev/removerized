import * as ort from "onnxruntime-web"
import { useCallback, useRef, useState } from "react"

import { MODELS, WASM_CDN_BASE } from "../constants"
import { checkAndDownloadModel } from "../lib/idb"
import { applyMaskAsAlpha, preprocessImage } from "../lib/onnx-pipeline"
import type { ModelKey, ModelStatus, ProgressCallback } from "../types"

// ── Types ─────────────────────────────────────────────────────────────────────

/** Public interface returned by the useOnnxSession hook */
export interface UseOnnxSessionReturn {
  /** Current lifecycle state of the selected model */
  modelStatus: ModelStatus
  /** Download percentage (0–100) while modelStatus === "downloading" */
  downloadProgress: number
  /**
   * Runs the full background-removal inference pipeline for a single image.
   * Internally acquires (or reuses) the cached ONNX session.
   *
   * @param imgEl      - Loaded HTMLImageElement to process.
   * @param modelKey   - Which model variant to use.
   * @param onUpdate   - Progress callback forwarded to the dialog.
   * @returns          - Transparent PNG as a Blob.
   */
  runInference: (
    imgEl: HTMLImageElement,
    modelKey: ModelKey,
    onUpdate: ProgressCallback
  ) => Promise<Blob>
  /**
   * Imperatively sets the model status.
   * Exposed so the parent can reset to "idle" on model selector change.
   */
  setModelStatus: (status: ModelStatus) => void
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useOnnxSession
 * ──────────────
 * Manages the lifecycle of one or more onnxruntime-web InferenceSession objects.
 *
 * Responsibilities:
 *  - Initialises ort WASM paths and disables threading on mount (via the
 *    caller's useEffect) so the consumer only needs to call runInference.
 *  - Caches sessions in a ref keyed by ModelKey so the expensive
 *    `InferenceSession.create` call only happens once per model per page load.
 *  - Exposes `modelStatus` and `downloadProgress` so the UI can reflect the
 *    current model state (idle / downloading / ready / error).
 *  - Provides `runInference`, a single entry-point that orchestrates:
 *      download → session creation → pre-process → inference → post-process
 */
export const useOnnxSession = (): UseOnnxSessionReturn => {
  // In-memory session cache keyed by model variant.
  // Using a ref ensures the cache survives re-renders without triggering them.
  const sessionCache = useRef<Partial<Record<ModelKey, ort.InferenceSession>>>({})

  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle")
  const [downloadProgress, setDownloadProgress] = useState(0)

  // ── Session acquisition ─────────────────────────────────────────────────

  /**
   * Returns an existing cached session or creates a new one.
   *
   * Flow:
   *  1. Return the cached session immediately if available (fast path).
   *  2. Mark state as "downloading" and stream the model from HuggingFace
   *     (or serve it from IndexedDB on subsequent calls).
   *  3. Create a single-threaded WASM InferenceSession from the ArrayBuffer.
   *  4. Cache the session and mark state as "ready".
   *
   * @param modelKey  - Which model variant to load.
   * @param onUpdate  - Forwarded to the dialog so the user sees download progress.
   */
  const getOrCreateSession = useCallback(
    async (
      modelKey: ModelKey,
      onUpdate: ProgressCallback
    ): Promise<ort.InferenceSession> => {
      // ── Fast path: already in memory ─────────────────────────────────
      if (sessionCache.current[modelKey]) {
        return sessionCache.current[modelKey]!
      }

      // ── Slow path: download + create session ──────────────────────────
      setModelStatus("downloading")
      onUpdate("Checking model cache…", 0)

      const buffer = await checkAndDownloadModel(modelKey, (pct) => {
        setDownloadProgress(pct)
        onUpdate(
          pct < 100
            ? `Downloading ${MODELS[modelKey].label}… ${pct}%`
            : "Finalizing download…",
          pct
        )
      })

      onUpdate("Loading WASM session…", 100)

      // numThreads=1 avoids the need for SharedArrayBuffer / COOP headers
      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      })

      sessionCache.current[modelKey] = session
      setModelStatus("ready")

      return session
    },
    [] // no external dependencies — sessionCache is a stable ref
  )

  // ── Inference pipeline ──────────────────────────────────────────────────

  /**
   * Full end-to-end pipeline:
   *  1. Acquire (or reuse) the ONNX session for the requested model.
   *  2. Pre-process: resize → CHW Float32 → ImageNet normalise → ort.Tensor.
   *  3. Run `session.run({ pixel_values: tensor })`.
   *  4. Post-process: extract mask → bilinear resize → apply as alpha channel.
   *  5. Dispose tensors to free WASM heap memory.
   *
   * @param imgEl     - The source image element (already loaded).
   * @param modelKey  - Which ONNX model variant to use.
   * @param onUpdate  - Progress callback used to update the processing dialog.
   * @returns         - Transparent PNG Blob ready to display or download.
   */
  const runInference = useCallback(
    async (
      imgEl: HTMLImageElement,
      modelKey: ModelKey,
      onUpdate: ProgressCallback
    ): Promise<Blob> => {
      // Step 1 – session
      const session = await getOrCreateSession(modelKey, onUpdate)

      // Step 2 – pre-process
      onUpdate("Pre-processing image…", 0)
      const inputTensor = preprocessImage(imgEl)

      // Step 3 – inference
      // The model expects a single named input "pixel_values" with shape
      // [1, 3, 1024, 1024] (batch, channels, height, width).
      onUpdate("Running inference…", 0)
      const results = await session.run({ pixel_values: inputTensor })

      // Step 4 – post-process
      onUpdate("Applying mask…", 0)
      const maskTensor = results[session.outputNames[0]]
      const blob = await applyMaskAsAlpha(maskTensor, imgEl)

      // Step 5 – free WASM heap memory
      inputTensor.dispose()
      maskTensor.dispose()

      return blob
    },
    [getOrCreateSession]
  )

  // ── WASM environment bootstrap ──────────────────────────────────────────
  // Callers should invoke this once in a useEffect([]) on the host component:
  //
  //   useEffect(() => {
  //     ort.env.wasm.wasmPaths = WASM_CDN_BASE
  //     ort.env.wasm.numThreads = 1
  //   }, [])
  //
  // It is kept outside this hook intentionally so ort is not imported here
  // at module-evaluation time (avoids SSR issues in Next.js App Router).

  return { modelStatus, downloadProgress, runInference, setModelStatus }
}
