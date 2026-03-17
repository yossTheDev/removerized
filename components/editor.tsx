/* eslint-disable @next/next/no-img-element */
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { sendGAEvent } from "@next/third-parties/google"
import {
  AlertCircle,
  CheckCircle2,
  CloudDownload,
  Download,
  Eraser,
  Layers,
  LoaderIcon,
  ScanEye,
  Sparkles,
  Trash,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import * as ort from "onnxruntime-web"
import { ReactCompareSlider } from "react-compare-slider"
import DustEffect from "react-dust-effect"
import InfiniteViewer from "react-infinite-viewer"
import { toast } from "sonner"

import { ImageSetting } from "@/types/image-settings"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
} from "@/components/ui/file-uploader"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { Loader } from "@/components/loader"

import AdBanner from "./ads/ad-banner"
import ImageSettings from "./settings/ImageSettings"
import { ThemeToggle } from "./theme-toggle"

// ── types ─────────────────────────────────────────────────────────────────────

type ActiveTool = "remover" | "upscaler"
type ModelKey = "quantized" | "fp16"
type ModelStatus = "idle" | "downloading" | "ready" | "error"

// ── model registry ────────────────────────────────────────────────────────────

const MODELS: Record<ModelKey, { url: string; cacheKey: string; label: string }> = {
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

const IDB_NAME = "RemoverizerModelDB"
const IDB_STORE = "models"
const IDB_VERSION = 1
const INFERENCE_SIZE = 1024

// ── IndexedDB helpers ─────────────────────────────────────────────────────────

const openModelDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const getFromIDB = (db: IDBDatabase, key: string): Promise<ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key)
    req.onsuccess = () => resolve((req.result as ArrayBuffer) ?? null)
    req.onerror = () => reject(req.error)
  })

const saveToIDB = (db: IDBDatabase, key: string, buf: ArrayBuffer): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put(buf, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })

// ── model download + cache ────────────────────────────────────────────────────

const checkAndDownloadModel = async (
  modelKey: ModelKey,
  onProgress: (pct: number) => void
): Promise<ArrayBuffer> => {
  const { url, cacheKey } = MODELS[modelKey]
  const db = await openModelDB()
  const cached = await getFromIDB(db, cacheKey)
  if (cached) {
    onProgress(100)
    return cached
  }

  const res = await fetch(url, { headers: { Accept: "*/*" } })
  if (!res.ok) throw new Error(`Model download failed: ${res.status} ${res.statusText}`)

  const total = parseInt(res.headers.get("Content-Length") ?? "0", 10)
  const reader = res.body!.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (total > 0) onProgress(Math.min(99, Math.round((received / total) * 100)))
  }

  // Assemble into single ArrayBuffer
  const merged = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }

  const arrayBuffer = merged.buffer
  await saveToIDB(db, cacheKey, arrayBuffer)
  onProgress(100)
  return arrayBuffer
}

// ── image helpers ─────────────────────────────────────────────────────────────

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const base64ToBlob = (base64: string): Blob => {
  const [header, data] = base64.split(";base64,")
  const contentType = header.split(":")[1]
  const raw = atob(data)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return new Blob([arr], { type: contentType })
}

const compositeOnColor = (base64: string, color: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/png"))
    }
    img.src = base64
  })

// ── ONNX pre-processing ───────────────────────────────────────────────────────

const preprocessImage = (imgEl: HTMLImageElement): ort.Tensor => {
  const S = INFERENCE_SIZE
  const canvas = document.createElement("canvas")
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(imgEl, 0, 0, S, S)
  const { data } = ctx.getImageData(0, 0, S, S)

  // CHW Float32 with ImageNet normalisation
  const mean = [0.485, 0.456, 0.406]
  const std = [0.229, 0.224, 0.225]
  const float32 = new Float32Array(3 * S * S)

  for (let i = 0; i < S * S; i++) {
    float32[i] = (data[i * 4] / 255 - mean[0]) / std[0]           // R
    float32[S * S + i] = (data[i * 4 + 1] / 255 - mean[1]) / std[1] // G
    float32[S * S * 2 + i] = (data[i * 4 + 2] / 255 - mean[2]) / std[2] // B
  }

  return new ort.Tensor("float32", float32, [1, 3, S, S])
}

// ── ONNX post-processing ──────────────────────────────────────────────────────

const applyMaskAsAlpha = (
  maskTensor: ort.Tensor,
  imgEl: HTMLImageElement
): Promise<Blob> =>
  new Promise((resolve) => {
    const ow = imgEl.naturalWidth
    const oh = imgEl.naturalHeight

    // Extract mask dims – shape is typically [1, 1, H, W]
    const mH = (maskTensor.dims[2] as number) ?? INFERENCE_SIZE
    const mW = (maskTensor.dims[3] as number) ?? INFERENCE_SIZE
    const maskData = maskTensor.data as Float32Array

    // Build grayscale ImageData from mask
    const grayPx = new Uint8ClampedArray(mW * mH * 4)
    for (let i = 0; i < mH * mW; i++) {
      const v = Math.round(Math.max(0, Math.min(1, maskData[i])) * 255)
      grayPx[i * 4] = v
      grayPx[i * 4 + 1] = v
      grayPx[i * 4 + 2] = v
      grayPx[i * 4 + 3] = 255
    }

    // Paint mask at original model output size
    const maskCanvas = document.createElement("canvas")
    maskCanvas.width = mW
    maskCanvas.height = mH
    maskCanvas.getContext("2d")!.putImageData(new ImageData(grayPx, mW, mH), 0, 0)

    // Resize mask to original image dimensions via drawImage interpolation
    const resCanvas = document.createElement("canvas")
    resCanvas.width = ow
    resCanvas.height = oh
    const resCtx = resCanvas.getContext("2d")!
    resCtx.drawImage(maskCanvas, 0, 0, ow, oh)
    const resizedMask = resCtx.getImageData(0, 0, ow, oh)

    // Get original pixels
    const origCanvas = document.createElement("canvas")
    origCanvas.width = ow
    origCanvas.height = oh
    const origCtx = origCanvas.getContext("2d")!
    origCtx.drawImage(imgEl, 0, 0)
    const origPx = origCtx.getImageData(0, 0, ow, oh)

    // Apply R channel of resized mask as alpha
    for (let i = 0; i < ow * oh; i++) {
      origPx.data[i * 4 + 3] = resizedMask.data[i * 4]
    }

    const outCanvas = document.createElement("canvas")
    outCanvas.width = ow
    outCanvas.height = oh
    outCanvas.getContext("2d")!.putImageData(origPx, 0, 0)
    outCanvas.toBlob((blob) => resolve(blob!), "image/png")
  })

// ── component ─────────────────────────────────────────────────────────────────

export const Editor = () => {
  const editorRef = useRef<InfiniteViewer>(null)
  const sessionCache = useRef<Partial<Record<ModelKey, ort.InferenceSession>>>({})

  const [show, setShow] = useState(false)
  const [activeTool, setActiveTool] = useState<ActiveTool>("remover")

  const [files, setFiles] = useState<File[] | null>([])
  const [settings, setSettings] = useState<ImageSetting[]>([])

  const [showDialog, setShowDialog] = useState(false)
  const [dialogText, setDialogText] = useState("")
  const [dialogProgress, setDialogProgress] = useState(0)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [localSettings, setLocalSettings] = useState<ImageSetting | null>(null)

  const [imageData, setImageData] = useState<string | null>(null)
  const [resultData, setResultData] = useState<string | null>(null)
  const [resultsData, setResultsData] = useState<{ data: Blob; name: string }[]>([])

  // ONNX model state
  const [selectedModel, setSelectedModel] = useState<ModelKey>("quantized")
  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle")
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Solid background
  const [applyBgColor, setApplyBgColor] = useState(false)
  const [bgColor, setBgColor] = useState("#ffffff")

  // Upscaler
  const [upscaledData, setUpscaledData] = useState<string | null>(null)

  // ── WASM env init (once) ────────────────────────────────────────────────────

  useEffect(() => {
    ort.env.wasm.wasmPaths =
      "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/"
    ort.env.wasm.numThreads = 1
  }, [])

  // ── session management ──────────────────────────────────────────────────────

  const getOrCreateSession = useCallback(
    async (
      modelKey: ModelKey,
      onUpdate: (text: string, pct: number) => void
    ): Promise<ort.InferenceSession> => {
      if (sessionCache.current[modelKey]) return sessionCache.current[modelKey]!

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
      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      })

      sessionCache.current[modelKey] = session
      setModelStatus("ready")
      return session
    },
    []
  )

  // ── core inference pipeline ─────────────────────────────────────────────────

  const runInference = useCallback(
    async (
      imgEl: HTMLImageElement,
      modelKey: ModelKey,
      onUpdate: (text: string, pct: number) => void
    ): Promise<Blob> => {
      const session = await getOrCreateSession(modelKey, onUpdate)

      onUpdate("Pre-processing image…", 0)
      const inputTensor = preprocessImage(imgEl)

      onUpdate("Running inference…", 0)
      const feeds: Record<string, ort.Tensor> = { pixel_values: inputTensor }
      const results = await session.run(feeds)

      onUpdate("Applying mask…", 0)
      const outputName = session.outputNames[0]
      const maskTensor = results[outputName]
      const blob = await applyMaskAsAlpha(maskTensor, imgEl)

      inputTensor.dispose()
      maskTensor.dispose()

      return blob
    },
    [getOrCreateSession]
  )

  // ── file queue ──────────────────────────────────────────────────────────────

  const handleDataChange = (_files: File[] | null) => {
    if (!_files) return

    const duplicates: string[] = []
    const newSettings = _files.reduce((acc: ImageSetting[], file) => {
      if (settings.some((s) => s.name === file.name)) {
        duplicates.push(file.name)
        return acc
      }
      acc.push({ format: "image/png", name: file.name, quality: 100 })
      return acc
    }, [])

    if (duplicates.length === _files.length) {
      toast(`All selected files already exist: ${duplicates.join(", ")}`)
      return
    }

    if (newSettings.length > 0) setSettings((p) => [...p, ...newSettings])

    const newFiles = _files.filter((f) => !settings.some((s) => s.name === f.name))
    if (newFiles.length > 0) setFiles((p) => [...(p ?? []), ...newFiles])

    const last = _files[_files.length - 1]
    if (last) {
      setSelectedImage(last.name)
      setImageData(URL.createObjectURL(last))
      setResultData(null)
      setUpscaledData(null)
    }
  }

  const handleRemoveFile = (file: File) => {
    setFiles((p) => p?.filter((f) => f.name !== file.name) ?? [])
    setSettings((p) => p.filter((s) => s.name !== file.name))
  }

  const handleChangeImage = (url: string, name: string) => {
    setSelectedImage(name)
    setImageData(url)
    setUpscaledData(null)
    const r = resultsData.find((item) => item.name === name)
    setResultData(r ? URL.createObjectURL(r.data) : null)
  }

  // ── download ────────────────────────────────────────────────────────────────

  const handleDownload = () => {
    const link = document.createElement("a")

    if (activeTool === "upscaler" && upscaledData) {
      link.href = upscaledData
      link.download = `removerized-upscaled-${Date.now()}.png`
      link.click()
      return
    }

    const result = resultsData.find((r) => r.name === selectedImage)
    if (result) {
      link.href = URL.createObjectURL(result.data)
      link.download = `removerized-${Date.now()}.png`
      link.click()
    }
  }

  // ── single remove ───────────────────────────────────────────────────────────

  const remove = async () => {
    if (!imageData) return

    const start = performance.now()
    setDialogProgress(0)
    setDialogText("Starting…")
    setShowDialog(true)

    try {
      const imgEl = await loadImage(imageData)

      let blob = await runInference(imgEl, selectedModel, (text, pct) => {
        setDialogText(text)
        setDialogProgress(pct)
      })

      if (applyBgColor) {
        const url = URL.createObjectURL(blob)
        const composited = await compositeOnColor(url, bgColor)
        blob = base64ToBlob(composited)
      }

      const url = URL.createObjectURL(blob)
      setResultsData((p) => [
        ...p.filter((r) => r.name !== selectedImage),
        { data: blob, name: selectedImage! },
      ])
      setResultData(url)
      setShow(true)
      setTimeout(() => setShow(false), 100)

      sendGAEvent({ event: "remove-background", value: "success" })
      toast.success(
        `🚀 Done in ${Math.floor((performance.now() - start) / 1000)} s`
      )
    } catch (err) {
      console.error(err)
      setModelStatus("error")
      toast.error("Background removal failed. Check console for details.")
    } finally {
      setShowDialog(false)
    }
  }

  // ── batch process ───────────────────────────────────────────────────────────

  const process = async () => {
    if (!files?.length) return

    const start = performance.now()
    let accumulated: { data: Blob; name: string }[] = []

    setDialogProgress(0)
    setDialogText("Starting batch…")
    setShowDialog(true)

    try {
      for (let i = 0; i < settings.length; i++) {
        const setting = settings[i]
        const file = files.find((f) => f.name === setting.name)
        if (!file) continue

        const label = setting.name.slice(0, 22)
        const imgEl = await loadImage(URL.createObjectURL(file))

        let blob = await runInference(imgEl, selectedModel, (text, pct) => {
          setDialogProgress(pct)
          setDialogText(`[${i + 1}/${settings.length}] ${label} — ${text}`)
        })

        if (applyBgColor) {
          const url = URL.createObjectURL(blob)
          const composited = await compositeOnColor(url, bgColor)
          blob = base64ToBlob(composited)
        }

        accumulated = [...accumulated, { data: blob, name: setting.name }]
        setResultsData(accumulated)
        setResultData(URL.createObjectURL(blob))
        setShow(true)
        setTimeout(() => setShow(false), 100)

        sendGAEvent({ event: "remove-background", value: "success" })
      }

      toast.success(
        `🚀 Batch done in ${Math.floor((performance.now() - start) / 1000)} s`
      )
    } catch (err) {
      console.error(err)
      toast.error("Batch processing failed.")
    } finally {
      setShowDialog(false)
    }
  }

  // ── upscale ─────────────────────────────────────────────────────────────────

  const upscale = async () => {
    const source = resultData || imageData
    if (!source) return

    const start = performance.now()
    setDialogProgress(0)
    setDialogText("Initializing upscaler…")
    setShowDialog(true)

    try {
      const { default: Upscaler } = await import("upscaler")
      const upscalerInstance = new Upscaler()

      const upscaled = await upscalerInstance.upscale(source, {
        output: "base64",
        patchSize: 64,
        padding: 2,
        progress: (amount: number) => {
          const pct = Math.round(amount * 100)
          setDialogProgress(pct)
          setDialogText(`Upscaling… ${pct}%`)
        },
      })

      setUpscaledData(upscaled)
      setResultData(upscaled)
      sendGAEvent({ event: "upscale-image", value: "success" })
      toast.success(
        `🚀 Upscaled in ${Math.floor((performance.now() - start) / 1000)} s`
      )
    } catch (err) {
      console.error(err)
      toast.error("Upscaling failed.")
    } finally {
      setShowDialog(false)
    }
  }

  // ── prefetch model status from IDB ─────────────────────────────────────────

  useEffect(() => {
    openModelDB()
      .then((db) => getFromIDB(db, MODELS[selectedModel].cacheKey))
      .then((buf) => setModelStatus(buf ? "ready" : "idle"))
      .catch(() => setModelStatus("idle"))
  }, [selectedModel])

  // ── sync local settings ─────────────────────────────────────────────────────

  useEffect(() => {
    setLocalSettings(settings.find((s) => s.name === selectedImage) ?? null)
    const r = resultsData.find((item) => item.name === selectedImage)
    setResultData(r ? URL.createObjectURL(r.data) : null)
  }, [resultsData, selectedImage, settings])

  // ── derived ─────────────────────────────────────────────────────────────────

  const canDownload =
    activeTool === "upscaler"
      ? !!upscaledData
      : !!resultsData.find((r) => r.name === selectedImage)

  const ModelStatusBadge = () => {
    if (modelStatus === "ready")
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-green-500">
          <CheckCircle2 className="size-3" />
          Cached
        </span>
      )
    if (modelStatus === "downloading")
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500">
          <CloudDownload className="size-3" />
          {downloadProgress}%
        </span>
      )
    if (modelStatus === "error")
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
          <AlertCircle className="size-3" />
          Error
        </span>
      )
    return (
      <span className="text-[10px] text-neutral-400">Not downloaded</span>
    )
  }

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Canvas viewport ── */}
      <InfiniteViewer
        ref={editorRef}
        className="viewer my-2 h-screen w-screen"
        margin={0}
        threshold={0}
        useMouseDrag
        useAutoZoom
        useGesture
        useResizeObserver
        useWheelScroll
        useWheelPinch
        useTransform
        zoom={0.8}
      >
        <div className="viewport">
          <div className="rounded-2xl p-4">
            <div className="flex size-full items-center justify-center gap-16 p-4">
              <ReactCompareSlider
                className="max-w-xl rounded-xl"
                itemOne={
                  imageData ? (
                    <Image
                      width={300}
                      height={150}
                      className="flex max-h-80 w-full rounded-xl"
                      src={imageData}
                      alt="Original"
                    />
                  ) : (
                    <div className="flex h-80 w-[36rem] items-center justify-center rounded-xl bg-neutral-400 dark:bg-neutral-900">
                      <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-700" />
                    </div>
                  )
                }
                itemTwo={
                  resultData ? (
                    <div className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-neutral-500 dark:bg-neutral-900">
                      <Image
                        width={300}
                        height={150}
                        className="grid-pattern flex max-h-80 w-full rounded-xl"
                        src={resultData}
                        alt="Processed"
                      />
                      <DustEffect
                        className="absolute flex max-h-80 w-full rounded-xl"
                        src={imageData!}
                        show={show}
                        option={{ baseDuration: 100, blur: 2 }}
                      />
                    </div>
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-xl bg-neutral-400 dark:bg-neutral-900">
                      <div className="grid-pattern flex size-full items-center justify-center">
                        <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-700" />
                      </div>
                    </div>
                  )
                }
              />
            </div>
          </div>
        </div>
      </InfiniteViewer>

      {/* ── Overlay ── */}
      <div className="pointer-events-none absolute z-20 h-screen w-screen">
        {/* Bottom toolbar */}
        <div className="pointer-events-none absolute z-20 flex h-screen w-screen items-center justify-center">
          <div className="pointer-events-auto mb-10 mt-auto flex h-fit gap-2 rounded-md bg-white px-4 py-2 backdrop-blur-3xl dark:bg-neutral-900/80">
            <div className="my-auto flex items-center">
              <Icons.logo className="size-8 text-[#FF2587]" />
            </div>

            <Button
              onClick={process}
              size="icon"
              variant="ghost"
              title="Process all in queue"
            >
              <LoaderIcon />
            </Button>

            <div className="my-auto h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

            <Button
              disabled={!canDownload}
              onClick={handleDownload}
              size="icon"
              variant="ghost"
              title="Download result"
            >
              <Download />
            </Button>

            <Button
              onClick={() =>
                editorRef.current?.setZoom(editorRef.current.getZoom() + 0.2)
              }
              size="icon"
              variant="ghost"
            >
              <ZoomIn />
            </Button>

            <Button
              onClick={() =>
                editorRef.current?.setZoom(editorRef.current.getZoom() - 0.2)
              }
              size="icon"
              variant="ghost"
            >
              <ZoomOut />
            </Button>

            <Button
              onClick={() => {
                editorRef.current?.setZoom(1)
                editorRef.current?.scrollCenter()
              }}
              size="icon"
              variant="ghost"
            >
              <ScanEye />
            </Button>

            <div className="my-auto h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

            <ThemeToggle />
          </div>
        </div>

        {/* Side panels */}
        <div className="pointer-events-none flex h-screen w-screen">
          <div className="pointer-events-none flex w-full items-center p-4">
            {/* ── Left panel ── */}
            <div className="pointer-events-auto h-fit max-h-[calc(100vh-6rem)] w-[22rem] overflow-y-auto rounded-md bg-white p-4 backdrop-blur-3xl transition-all dark:bg-neutral-900/80">

              {/* Tool tabs */}
              <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                {(['remover', 'upscaler'] as ActiveTool[]).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      activeTool === tool
                        ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    )}
                  >
                    {tool === 'remover' ? <Eraser className="size-3.5" /> : <Sparkles className="size-3.5" />}
                    {tool === 'remover' ? 'BG Remover' : 'Upscaler'}
                  </button>
                ))}
              </div>

              {/* BG Remover tab */}
              {activeTool === 'remover' && (
                <div className="flex flex-col gap-4">

                  {/* Model selector */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Model</span>
                      {modelStatus === 'ready' && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-green-500">
                          <CheckCircle2 className="size-3" /> Cached
                        </span>
                      )}
                      {modelStatus === 'downloading' && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500">
                          <CloudDownload className="size-3" /> {downloadProgress}%
                        </span>
                      )}
                      {modelStatus === 'error' && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
                          <AlertCircle className="size-3" /> Error
                        </span>
                      )}
                      {modelStatus === 'idle' && (
                        <span className="text-[10px] text-neutral-400">Not downloaded</span>
                      )}
                    </div>
                    <div className="flex gap-1 rounded-md bg-neutral-100 p-0.5 dark:bg-neutral-800">
                      {(['quantized', 'fp16'] as ModelKey[]).map((mk) => (
                        <button
                          key={mk}
                          onClick={() => setSelectedModel(mk)}
                          className={cn(
                            'flex flex-1 flex-col items-center rounded px-2 py-1.5 text-center text-[10px] transition-all',
                            selectedModel === mk
                              ? 'bg-white font-semibold text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                          )}
                        >
                          <span className="font-medium">{mk === 'quantized' ? 'Standard' : 'High-Res'}</span>
                          <span className="opacity-60">{MODELS[mk].label.replace('Standard ', '').replace('High-Res ', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Per-image settings */}
                  {localSettings ? (
                    <ImageSettings
                      settings={localSettings}
                      onChange={(s) => {
                        setLocalSettings(s)
                        setSettings((p) => p.map((item) => (item.name !== selectedImage ? item : s)))
                      }}
                    />
                  ) : (
                    <p className="mt-2 text-center text-sm text-neutral-400">
                      Select an image to edit
                    </p>
                  )}

                  {/* Solid background */}
                  <div className="flex flex-col gap-3 border-t pt-4 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Solid Background</span>
                      <button
                        role="switch"
                        aria-checked={applyBgColor}
                        onClick={() => setApplyBgColor((v) => !v)}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                          applyBgColor ? 'bg-[#FF2587]' : 'bg-neutral-300 dark:bg-neutral-600'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                            applyBgColor ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                    {applyBgColor && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="size-9 cursor-pointer rounded border border-neutral-200 p-0.5 dark:border-neutral-700"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          maxLength={7}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="flex-1 rounded-md border border-neutral-200 bg-transparent px-3 py-1.5 font-mono text-sm dark:border-neutral-700"
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={remove} disabled={!imageData} className="w-full">
                    <Eraser className="mr-2 size-4" />
                    Remove Background
                  </Button>
                </div>
              )}

              {/* Upscaler tab */}
              {activeTool === 'upscaler' && (
                <div className="flex flex-col gap-4">
                  {imageData ? (
                    <>
                      <p className="text-center text-xs leading-relaxed text-neutral-400">
                        Enhances and upscales using AI (TensorFlow.js).
                        {resultData ? ' Will upscale the processed result.' : ' Will upscale the original.'}
                      </p>
                      <Button onClick={upscale} className="w-full">
                        <Sparkles className="mr-2 size-4" />
                        Upscale Image
                      </Button>
                      {upscaledData && (
                        <Button onClick={handleDownload} variant="outline" className="w-full">
                          <Download className="mr-2 size-4" />
                          Download Upscaled
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-sm text-neutral-400">Select an image to upscale</p>
                  )}
                </div>
              )}

              <div className="mt-4">
                <AdBanner />
              </div>
            </div>

            {/* Right panel - Queue */}
            <div className="pointer-events-auto ml-auto h-fit w-60 rounded-md bg-white p-4 backdrop-blur-3xl transition-all dark:bg-neutral-900/80">
              <div className="flex items-center justify-center gap-2 p-2">
                <Layers className="size-4" />
                <span className="text-sm font-semibold">Queue</span>
                {(files?.length ?? 0) > 0 && (
                  <span className="flex items-center justify-center rounded-xl bg-red-600 px-2 text-xs font-semibold text-white">
                    {files?.length}
                  </span>
                )}
              </div>
              <FileUploader
                value={files}
                dropzoneOptions={{ maxFiles: 10, accept: { "image/png": [".png"], "image/jpg": [".jpg", ".jpeg"], "image/webp": [".webp"] } }}
                onValueChange={handleDataChange}
                className="relative max-w-xs space-y-1 rounded-xl bg-neutral-300 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-900"
              >
                <FileInput>
                  <Icons.SolarCloudUploadBoldDuotone className="mx-auto my-8 size-10 text-neutral-700 dark:text-neutral-400" />
                </FileInput>
                <FileUploaderContent />
              </FileUploader>
              <div className="mt-4 flex h-fit max-h-80 flex-col gap-4 overflow-x-hidden overflow-y-scroll">
                {files?.map((file, index) => {
                  const url = URL.createObjectURL(file)
                  const isDone = resultsData.some((r) => r.name === file.name)
                  return (
                    <div
                      key={"img-" + index}
                      className={cn(
                        "group relative h-32 cursor-pointer rounded border-2 bg-slate-500 transition-all",
                        selectedImage === file.name ? "border-[#FF2587]" : "border-neutral-900 dark:border-neutral-300"
                      )}
                    >
                      <img className="h-32 w-full rounded object-cover" alt={"image-" + index} src={url} onClick={() => handleChangeImage(url, file.name)} />
                      {isDone && (
                        <span className="absolute bottom-1 right-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          &#10003;
                        </span>
                      )}
                      <Button onClick={() => handleRemoveFile(file)} className="absolute left-1 top-1 rounded-full bg-neutral-800 text-neutral-100 opacity-0 transition-all group-hover:opacity-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950" variant="ghost" size="icon">
                        <Trash />
                      </Button>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  onClick={() => { setFiles([]); setSettings([]); setSelectedImage(null); setLocalSettings(null); setImageData(null); setResultData(null); setResultsData([]); setUpscaledData(null) }}
                  disabled={(files?.length ?? 0) === 0}
                  variant="surface"
                >
                  <Trash className="mr-2 size-4" />
                  Clear Queue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing dialog */}
      <AlertDialog open={showDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processing</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-2">
              <p className="text-sm">{dialogText}</p>
              {dialogProgress > 0 ? (
                <div className="flex flex-col gap-1">
                  <Progress value={dialogProgress} />
                  <span className="text-right text-xs text-neutral-400">{dialogProgress}%</span>
                </div>
              ) : (
                <Loader />
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
