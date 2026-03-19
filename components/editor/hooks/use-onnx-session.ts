import { useCallback, useRef, useState } from "react"

import { MODELS } from "../constants"
import { checkAndDownloadModel } from "../lib/idb"
import { applyMaskAsAlpha, preprocessImage } from "../lib/onnx-pipeline"
import type { ModelKey, ModelStatus, ProgressCallback } from "../types"

type Ort = typeof import("onnxruntime-web")
type InferenceSession = Awaited<ReturnType<Ort["InferenceSession"]["create"]>>

/** Hook return contract */
export interface UseOnnxSessionReturn {
  modelStatus: ModelStatus
  downloadProgress: number
  runInference: (
    imgEl: HTMLImageElement,
    modelKey: ModelKey,
    onUpdate: ProgressCallback
  ) => Promise<Blob>
  setModelStatus: (status: ModelStatus) => void
}

/**
 * Manages ONNX Runtime sessions on the client.
 *
 * - Avoids SSR issues by using a lazy-loaded ortRef
 * - Caches sessions per model
 * - Handles download + inference pipeline
 */
export const useOnnxSession = (
  ortRef: React.RefObject<Ort | null>
): UseOnnxSessionReturn => {
  /** In-memory session cache per model */
  const sessionCache = useRef<Partial<Record<ModelKey, InferenceSession>>>({})

  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle")
  const [downloadProgress, setDownloadProgress] = useState(0)

  /**
   * Get cached session or create a new one.
   */
  const getOrCreateSession = useCallback(
    async (
      modelKey: ModelKey,
      onUpdate: ProgressCallback
    ): Promise<InferenceSession> => {
      const ort = ortRef.current
      if (!ort) throw new Error("ONNX Runtime not initialized")

      // Fast path: cached session
      if (sessionCache.current[modelKey]) {
        return sessionCache.current[modelKey]!
      }

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

      onUpdate("Loading session…", 100)

      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      })

      sessionCache.current[modelKey] = session
      setModelStatus("ready")

      return session
    },
    [ortRef]
  )

  /**
   * Run full inference pipeline for an image.
   */
  const runInference = useCallback(
    async (
      imgEl: HTMLImageElement,
      modelKey: ModelKey,
      onUpdate: ProgressCallback
    ): Promise<Blob> => {
      // Check if the session is ready before running inference
      if (!ortRef.current) {
        throw new Error("ONNX Runtime not initialized")
      }

      const session = await getOrCreateSession(modelKey, onUpdate)

      onUpdate("Pre-processing…", 0)
      const inputTensor = preprocessImage(imgEl, ortRef.current)

      onUpdate("Running inference…", 0)
      const inputType = MODELS[modelKey].inputType
      const results = await session.run({ [inputType]: inputTensor })

      onUpdate("Post-processing…", 0)
      const maskTensor = results[session.outputNames[0]]
      const blob = await applyMaskAsAlpha(maskTensor, imgEl)

      inputTensor.dispose()
      maskTensor.dispose()

      return blob
    },
    [getOrCreateSession]
  )

  return { modelStatus, downloadProgress, runInference, setModelStatus }
}
