/* eslint-disable @next/next/no-img-element */
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as ort from "onnxruntime-web"
import { sendGAEvent } from "@next/third-parties/google"

import { MODELS, WASM_CDN_BASE } from "./constants"
import { isModelCached } from "./lib/idb"
import { base64ToBlob, compositeOnColor, loadImage } from "./lib/image-utils"
import { useImageQueue } from "./hooks/use-image-queue"
import { useOnnxSession } from "./hooks/use-onnx-session"
import { useProcessingDialog } from "./hooks/use-processing-dialog"
import { EditorCanvas } from "./components/EditorCanvas"
import { EditorToolbar } from "./components/EditorToolbar"
import { EditorProcessingDialog } from "./components/EditorProcessingDialog"
import { EditorLeftPanel } from "./components/panels/EditorLeftPanel"
import { EditorQueuePanel } from "./components/panels/EditorQueuePanel"
import type { ActiveTool, ModelKey } from "./types"
import InfiniteViewer from "react-infinite-viewer"

/**
 * Editor
 * ──────
 * Root orchestrator for the Removerized editor page.
 *
 * Responsibilities:
 *  - Initialises the onnxruntime-web WASM environment once on mount.
 *  - Composes the three core hooks:
 *      • useImageQueue    — file / settings queue management
 *      • useOnnxSession   — ONNX session lifecycle + inference pipeline
 *      • useProcessingDialog — modal open/close/update state
 *  - Owns the cross-cutting action functions (remove, process, upscale)
 *    that require state from multiple hooks simultaneously.
 *  - Passes strictly-typed props down to each presentational sub-component;
 *    no component below this level reads from context or owns async logic.
 *
 * Component tree:
 *  Editor
 *  ├── EditorCanvas          (pannable viewport + compare slider)
 *  ├── EditorToolbar         (bottom floating bar)
 *  ├── EditorLeftPanel       (tab switcher → RemoverTab | UpscalerTab)
 *  ├── EditorQueuePanel      (right panel file queue)
 *  └── EditorProcessingDialog (blocking progress modal)
 */
export const Editor = () => {
  // ── Viewport ref ────────────────────────────────────────────────────────────
  /** Forwarded to EditorCanvas and EditorToolbar for zoom/pan control. */
  const editorRef = useRef<InfiniteViewer>(null)

  // ── Core hooks ───────────────────────────────────────────────────────────────
  const queue = useImageQueue()
  const onnx = useOnnxSession()
  const { dialog, openDialog, updateDialog, closeDialog } = useProcessingDialog()

  // ── Dust-effect trigger ──────────────────────────────────────────────────────
  /**
   * Briefly set to `true` after a result arrives to trigger the DustEffect
   * particle animation, then immediately reset to `false`.
   */
  const [showDust, setShowDust] = useState(false)

  // ── Active tool tab ──────────────────────────────────────────────────────────
  const [activeTool, setActiveTool] = useState<ActiveTool>("remover")

  // ── ONNX model selection ─────────────────────────────────────────────────────
  const [selectedModel, setSelectedModel] = useState<ModelKey>("quantized")

  // ── Solid background ─────────────────────────────────────────────────────────
  const [applyBgColor, setApplyBgColor] = useState(false)
  const [bgColor, setBgColor] = useState("#ffffff")

  // ── Upscaler result ──────────────────────────────────────────────────────────
  /** base64 data URL of the upscaled image, or null before first upscale. */
  const [upscaledData, setUpscaledData] = useState<string | null>(null)

  // ── WASM environment init (once per page load) ───────────────────────────────
  useEffect(() => {
    // Point onnxruntime-web to CDN-hosted WASM binaries.
    // numThreads=1 avoids the SharedArrayBuffer / COOP header requirement.
    ort.env.wasm.wasmPaths = WASM_CDN_BASE
    ort.env.wasm.numThreads = 1
  }, [])

  // ── IDB cache check on model switch ─────────────────────────────────────────
  /**
   * When the user selects a different model variant, check IndexedDB to see
   * if it is already cached and update the status badge accordingly.
   * The in-memory session cache is checked first as a fast path.
   */
  useEffect(() => {
    isModelCached(selectedModel)
      .then((cached) => onnx.setModelStatus(cached ? "ready" : "idle"))
      .catch(() => onnx.setModelStatus("idle"))
  }, [selectedModel]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /**
   * Triggers the dust-effect animation once then resets.
   * The 100 ms timeout matches DustEffect's minimum display time.
   */
  const triggerDust = useCallback(() => {
    setShowDust(true)
    setTimeout(() => setShowDust(false), 100)
  }, [])

  /**
   * Optionally composites a solid colour behind a transparent-PNG Blob.
   * Returns the original Blob unchanged when `applyBgColor` is false.
   *
   * @param blob - Transparent PNG Blob produced by inference.
   * @returns    - Blob with solid background applied (if enabled).
   */
  const maybeComposite = useCallback(
    async (blob: Blob): Promise<Blob> => {
      if (!applyBgColor) return blob
      const objUrl = URL.createObjectURL(blob)
      const composited = await compositeOnColor(objUrl, bgColor)
      URL.revokeObjectURL(objUrl)
      return base64ToBlob(composited)
    },
    [applyBgColor, bgColor]
  )

  // ── Actions ───────────────────────────────────────────────────────────────────

  /**
   * Removes the background from the currently selected image.
   *
   * Flow:
   *  1. Load the original image element.
   *  2. Run the full ONNX inference pipeline (download model if needed).
   *  3. Optionally composite a solid background colour.
   *  4. Push the result into the queue and refresh the preview.
   */
  const remove = useCallback(async () => {
    if (!queue.imageData) return

    const start = performance.now()
    openDialog("Starting…")

    try {
      const imgEl = await loadImage(queue.imageData)

      const rawBlob = await onnx.runInference(
        imgEl,
        selectedModel,
        updateDialog
      )

      const blob = await maybeComposite(rawBlob)
      const url = URL.createObjectURL(blob)

      queue.setResultsData((prev) => [
        ...prev.filter((r) => r.name !== queue.selectedImage),
        { data: blob, name: queue.selectedImage! },
      ])
      queue.setResultData(url)
      triggerDust()

      sendGAEvent({ event: "remove-background", value: "success" })
      const elapsed = Math.floor((performance.now() - start) / 1000)
      const { toast } = await import("sonner")
      toast.success(`🚀 Done in ${elapsed} s`)
    } catch (err) {
      console.error("[remove]", err)
      onnx.setModelStatus("error")
      const { toast } = await import("sonner")
      toast.error("Background removal failed. Check the console for details.")
    } finally {
      closeDialog()
    }
  }, [
    queue,
    onnx,
    selectedModel,
    updateDialog,
    openDialog,
    closeDialog,
    maybeComposite,
    triggerDust,
  ])

  /**
   * Processes every image in the queue sequentially.
   *
   * The ONNX session is acquired once (first iteration) and reused for all
   * subsequent images in the same batch, making repeated inference much faster
   * once the model is loaded.
   */
  const process = useCallback(async () => {
    if (!queue.files.length) return

    const start = performance.now()
    let accumulated: { data: Blob; name: string }[] = []

    openDialog("Starting batch…")

    try {
      for (let i = 0; i < queue.settings.length; i++) {
        const setting = queue.settings[i]
        const file = queue.files.find((f) => f.name === setting.name)
        if (!file) continue

        const label = setting.name.slice(0, 22)
        const imgEl = await loadImage(URL.createObjectURL(file))

        const rawBlob = await onnx.runInference(
          imgEl,
          selectedModel,
          (text, pct) => {
            updateDialog(`[${i + 1}/${queue.settings.length}] ${label} — ${text}`, pct)
          }
        )

        const blob = await maybeComposite(rawBlob)

        accumulated = [...accumulated, { data: blob, name: setting.name }]
        queue.setResultsData(accumulated)
        queue.setResultData(URL.createObjectURL(blob))
        triggerDust()

        sendGAEvent({ event: "remove-background", value: "success" })
      }

      const elapsed = Math.floor((performance.now() - start) / 1000)
      const { toast } = await import("sonner")
      toast.success(`🚀 Batch done in ${elapsed} s`)
    } catch (err) {
      console.error("[process]", err)
      const { toast } = await import("sonner")
      toast.error("Batch processing failed.")
    } finally {
      closeDialog()
    }
  }, [
    queue,
    onnx,
    selectedModel,
    updateDialog,
    openDialog,
    closeDialog,
    maybeComposite,
    triggerDust,
  ])

  /**
   * Upscales the current result (or original if no result exists) using
   * UpscalerJS (TensorFlow.js).
   *
   * The upscaler is imported dynamically to keep it out of the initial bundle
   * and to avoid any SSR incompatibilities.
   */
  const upscale = useCallback(async () => {
    const source = queue.resultData || queue.imageData
    if (!source) return

    const start = performance.now()
    openDialog("Initializing upscaler…")

    try {
      const { default: Upscaler } = await import("upscaler")
      const instance = new Upscaler()

      const upscaled = await instance.upscale(source, {
        output: "base64",
        patchSize: 64,
        padding: 2,
        progress: (amount: number) => {
          const pct = Math.round(amount * 100)
          updateDialog(`Upscaling… ${pct}%`, pct)
        },
      })

      setUpscaledData(upscaled)
      queue.setResultData(upscaled)

      sendGAEvent({ event: "upscale-image", value: "success" })
      const elapsed = Math.floor((performance.now() - start) / 1000)
      const { toast } = await import("sonner")
      toast.success(`🚀 Upscaled in ${elapsed} s`)
    } catch (err) {
      console.error("[upscale]", err)
      const { toast } = await import("sonner")
      toast.error("Upscaling failed.")
    } finally {
      closeDialog()
    }
  }, [queue, updateDialog, openDialog, closeDialog])

  /**
   * Downloads the current result to the user's machine.
   *
   * - In "upscaler" mode: downloads the upscaled base64 image.
   * - In "remover" mode: downloads the processed Blob from the results store.
   */
  const handleDownload = useCallback(() => {
    const link = document.createElement("a")

    if (activeTool === "upscaler" && upscaledData) {
      link.href = upscaledData
      link.download = `removerized-upscaled-${Date.now()}.png`
      link.click()
      return
    }

    const result = queue.resultsData.find((r) => r.name === queue.selectedImage)
    if (result) {
      link.href = URL.createObjectURL(result.data)
      link.download = `removerized-${Date.now()}.png`
      link.click()
    }
  }, [activeTool, upscaledData, queue.resultsData, queue.selectedImage])

  // ── Derived state ─────────────────────────────────────────────────────────────

  /**
   * Whether the download button in the toolbar should be enabled.
   * Depends on the active tab and whether a result is available.
   */
  const canDownload =
    activeTool === "upscaler"
      ? !!upscaledData
      : !!queue.resultsData.find((r) => r.name === queue.selectedImage)

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Pannable / zoomable canvas with before/after slider */}
      <EditorCanvas
        editorRef={editorRef}
        imageData={queue.imageData}
        resultData={queue.resultData}
        showDust={showDust}
      />

      {/* Full-screen transparent overlay for all floating UI */}
      <div className="pointer-events-none absolute z-20 h-screen w-screen">

        {/* Bottom-center floating toolbar */}
        <EditorToolbar
          editorRef={editorRef}
          canDownload={canDownload}
          onProcess={process}
          onDownload={handleDownload}
        />

        {/* Side panels layout */}
        <div className="pointer-events-none flex h-screen w-screen">
          <div className="pointer-events-none flex w-full items-center p-4">

            {/* Left panel: tool tabs (Remover / Upscaler) */}
            <EditorLeftPanel
              activeTool={activeTool}
              onToolChange={setActiveTool}
              localSettings={queue.localSettings}
              onSettingsChange={queue.updateLocalSettings}
              selectedModel={selectedModel}
              onModelChange={(key) => {
                setSelectedModel(key)
                setUpscaledData(null)
              }}
              modelStatus={onnx.modelStatus}
              downloadProgress={onnx.downloadProgress}
              applyBgColor={applyBgColor}
              onToggleBgColor={() => setApplyBgColor((v) => !v)}
              bgColor={bgColor}
              onBgColorChange={setBgColor}
              hasImage={!!queue.imageData}
              onRemove={remove}
              hasResult={!!queue.resultData}
              hasUpscaled={!!upscaledData}
              onUpscale={upscale}
              onDownload={handleDownload}
            />

            {/* Right panel: file queue */}
            <EditorQueuePanel
              files={queue.files}
              settings={queue.settings}
              selectedImage={queue.selectedImage}
              resultsData={queue.resultsData}
              onFilesChange={queue.handleDataChange}
              onRemoveFile={queue.handleRemoveFile}
              onSelectImage={queue.handleChangeImage}
              onClearQueue={() => {
                queue.clearQueue()
                setUpscaledData(null)
              }}
            />
          </div>
        </div>
      </div>

      {/* Blocking progress modal (non-dismissable during inference) */}
      <EditorProcessingDialog dialog={dialog} />
    </>
  )
}
