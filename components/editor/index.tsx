/* eslint-disable @next/next/no-img-element */
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { sendGAEvent } from "@next/third-parties/google"
import * as ort from "onnxruntime-web"
import InfiniteViewer from "react-infinite-viewer"

import { EditorCanvas } from "./components/EditorCanvas"
import { EditorProcessingDialog } from "./components/EditorProcessingDialog"
import { EditorToolbar } from "./components/EditorToolbar"
import { EditorLeftPanel } from "./components/panels/EditorLeftPanel"
import { EditorRightPanel } from "./components/panels/EditorRightPanel"
import { MODELS, TOOL_ACCENTS, WASM_CDN_BASE } from "./constants"
import { useImageQueue } from "./hooks/use-image-queue"
import { useOnnxSession } from "./hooks/use-onnx-session"
import { useProcessingDialog } from "./hooks/use-processing-dialog"
import { isModelCached } from "./lib/idb"
import { base64ToBlob, compositeOnColor, loadImage } from "./lib/image-utils"
import type { ActiveTool, ModelKey } from "./types"

const VALID_TOOLS: ActiveTool[] = ["remover", "upscaler"]
const VALID_MODELS = Object.keys(MODELS) as ModelKey[]

export const Editor = () => {
  const editorRef = useRef<InfiniteViewer>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const queue = useImageQueue()
  const onnx = useOnnxSession()
  const { dialog, openDialog, updateDialog, closeDialog } =
    useProcessingDialog()

  const [showDust, setShowDust] = useState(false)
  const [activeTool, setActiveTool] = useState<ActiveTool>("remover")
  const [selectedModel, setSelectedModel] = useState<ModelKey>("quantized")
  const [applyBgColor, setApplyBgColor] = useState(false)
  const [bgColor, setBgColor] = useState("#ffffff")
  const [upscaledData, setUpscaledData] = useState<string | null>(null)

  // ── WASM init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    ort.env.wasm.wasmPaths = WASM_CDN_BASE
    ort.env.wasm.numThreads = 1
  }, [])

  // ── URL → state (once on mount) ───────────────────────────────────────────
  useEffect(() => {
    const toolParam = searchParams.get("tool") as ActiveTool | null
    const modelParam = searchParams.get("model") as ModelKey | null

    if (toolParam && VALID_TOOLS.includes(toolParam)) {
      setActiveTool(toolParam)
    }
    if (modelParam && VALID_MODELS.includes(modelParam)) {
      setSelectedModel(modelParam)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── IDB cache check on model switch ─────────────────────────────────────────
  useEffect(() => {
    isModelCached(selectedModel)
      .then((cached) => onnx.setModelStatus(cached ? "ready" : "idle"))
      .catch(() => onnx.setModelStatus("idle"))
  }, [selectedModel]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── URL sync helpers ─────────────────────────────────────────────────────────
  const pushUrl = useCallback(
    (tool: ActiveTool, model: ModelKey) => {
      router.replace(`?tool=${tool}&model=${model}`, { scroll: false })
    },
    [router]
  )

  const handleToolChange = useCallback(
    (tool: ActiveTool) => {
      setActiveTool(tool)
      pushUrl(tool, selectedModel)
    },
    [selectedModel, pushUrl]
  )

  const handleModelChange = useCallback(
    (key: ModelKey) => {
      setSelectedModel(key)
      setUpscaledData(null)
      pushUrl(activeTool, key)
    },
    [activeTool, pushUrl]
  )

  // ── Dust trigger ─────────────────────────────────────────────────────────────
  const triggerDust = useCallback(() => {
    setShowDust(true)
    setTimeout(() => setShowDust(false), 100)
  }, [])

  // ── Background composite ──────────────────────────────────────────────────────
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

  // ── Remove background ─────────────────────────────────────────────────────────
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
      toast.error("Background removal failed.")
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

  // ── Batch process ─────────────────────────────────────────────────────────────
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
            updateDialog(
              `[${i + 1}/${queue.settings.length}] ${label} — ${text}`,
              pct
            )
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

  // ── Upscale ───────────────────────────────────────────────────────────────────
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

  // ── Download ──────────────────────────────────────────────────────────────────
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

  // ── Derived ───────────────────────────────────────────────────────────────────
  const canDownload =
    activeTool === "upscaler"
      ? !!upscaledData
      : !!queue.resultsData.find((r) => r.name === queue.selectedImage)

  const accentColor = TOOL_ACCENTS[activeTool]
  const bgImage = queue.resultData || queue.imageData

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex h-screen w-screen overflow-hidden bg-[#050505]"
      style={{ "--tool-accent": accentColor } as React.CSSProperties}
    >
      {/* Full-screen frosted background layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 scale-110 transition-opacity duration-700"
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(72px) brightness(0.13) saturate(1.6)",
          opacity: bgImage ? 1 : 0,
        }}
      />

      {/* Static dark noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Accent ambient glow — top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 opacity-20 transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${accentColor}40, transparent)`,
        }}
      />

      {/* ── Left SEO Sidebar ── */}
      <aside className="relative z-10 hidden w-60 shrink-0 lg:flex">
        <EditorLeftPanel activeTool={activeTool} accentColor={accentColor} />
      </aside>

      {/* ── Center Canvas ── */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <EditorCanvas
          editorRef={editorRef}
          imageData={queue.imageData}
          resultData={queue.resultData}
          showDust={showDust}
        />
        <EditorToolbar
          editorRef={editorRef}
          canDownload={canDownload}
          onProcess={process}
          onDownload={handleDownload}
          accentColor={accentColor}
        />
      </main>

      {/* ── Right Controls + Queue Sidebar ── */}
      <aside className="relative z-10 w-[19rem] shrink-0">
        <EditorRightPanel
          activeTool={activeTool}
          onToolChange={handleToolChange}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          modelStatus={onnx.modelStatus}
          downloadProgress={onnx.downloadProgress}
          localSettings={queue.localSettings}
          onSettingsChange={queue.updateLocalSettings}
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
          accentColor={accentColor}
        />
      </aside>

      {/* Blocking inference modal */}
      <EditorProcessingDialog dialog={dialog} />
    </div>
  )
}
