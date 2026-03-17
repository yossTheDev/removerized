/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { sendGAEvent } from "@next/third-parties/google"
import {
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

type ActiveTool = "remover" | "upscaler"

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── component ─────────────────────────────────────────────────────────────────

export const Editor = () => {
  const editor = useRef<InfiniteViewer>(null)

  const [show, setShow] = useState(false)
  const [activeTool, setActiveTool] = useState<ActiveTool>("remover")

  const [files, setFiles] = useState<File[] | null>([])
  const [settings, setSettings] = useState<ImageSetting[]>([])

  const [showDialog, setShowDialog] = useState(false)
  const [dialogText, setDialogText] = useState("")
  const [dialogProgress, setDialogProgress] = useState(0)
  const [dialogTotal, setDialogTotal] = useState(100)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [localSettings, setLocalSettings] = useState<ImageSetting | null>(null)

  const [imageData, setImageData] = useState<string | null>(null)
  const [resultData, setResultData] = useState<string | null>(null)
  const [resultsData, setResultsData] = useState<
    { data: Blob; name: string }[]
  >([])

  // solid background
  const [applyBgColor, setApplyBgColor] = useState(false)
  const [bgColor, setBgColor] = useState("#ffffff")

  // upscaler
  const [upscaledData, setUpscaledData] = useState<string | null>(null)

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

    if (newSettings.length > 0) {
      setSettings((prev) => [...prev, ...newSettings])
    }

    const newFiles = _files.filter(
      (f) => !settings.some((s) => s.name === f.name)
    )
    if (newFiles.length > 0) {
      setFiles((prev) => [...(prev ?? []), ...newFiles])
    }

    const last = _files[_files.length - 1]
    if (last) {
      setSelectedImage(last.name)
      setImageData(URL.createObjectURL(last))
      setResultData(null)
      setUpscaledData(null)
    }
  }

  const handleRemoveFile = (file: File) => {
    setFiles((prev) => prev?.filter((f) => f.name !== file.name) ?? [])
    setSettings((prev) => prev.filter((s) => s.name !== file.name))
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

    const result = resultsData.find((item) => item.name === selectedImage)
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
    setDialogText("Starting...")
    setShowDialog(true)

    try {
      const { default: SimpleBackgroundRemover } = await import(
        "simple-background-remover"
      )
      const remover = new SimpleBackgroundRemover()
      const imgEl = await loadImage(imageData)

      let result = (await remover.removeBackground(imgEl, {
        return: "base64",
        onProgress: (percent: number, message: string) => {
          setDialogProgress(percent)
          setDialogTotal(100)
          setDialogText(message || `Processing… ${percent}%`)
        },
      })) as string

      if (applyBgColor) {
        result = await compositeOnColor(result, bgColor)
      }

      const blob = base64ToBlob(result)
      const url = URL.createObjectURL(blob)

      setResultsData((prev) => [
        ...prev.filter((r) => r.name !== selectedImage),
        { data: blob, name: selectedImage! },
      ])
      setResultData(url)
      setShow(true)
      setTimeout(() => setShow(false), 100)

      sendGAEvent({ event: "remove-background", value: "success" })
      toast.success(
        `🚀 Done in ${Math.floor((performance.now() - start) / 1000)} s`
      )
    } catch {
      toast.error("Background removal failed")
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
      const { default: SimpleBackgroundRemover } = await import(
        "simple-background-remover"
      )

      for (let i = 0; i < settings.length; i++) {
        const setting = settings[i]
        const file = files.find((f) => f.name === setting.name)
        if (!file) continue

        const label = setting.name.slice(0, 22)
        setDialogText(`[${i + 1}/${settings.length}] ${label}`)

        const imgEl = await loadImage(URL.createObjectURL(file))

        let result = (await new SimpleBackgroundRemover().removeBackground(
          imgEl,
          {
            return: "base64",
            onProgress: (percent: number, message: string) => {
              setDialogProgress(percent)
              setDialogTotal(100)
              setDialogText(
                message ||
                  `[${i + 1}/${settings.length}] ${label} — ${percent}%`
              )
            },
          }
        )) as string

        if (applyBgColor) {
          result = await compositeOnColor(result, bgColor)
        }

        const blob = base64ToBlob(result)
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
    } catch {
      toast.error("Batch processing failed")
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
          setDialogTotal(100)
          setDialogText(`Upscaling… ${pct}%`)
        },
      })

      setUpscaledData(upscaled)
      setResultData(upscaled)
      sendGAEvent({ event: "upscale-image", value: "success" })
      toast.success(
        `🚀 Upscaled in ${Math.floor((performance.now() - start) / 1000)} s`
      )
    } catch {
      toast.error("Upscaling failed")
    } finally {
      setShowDialog(false)
    }
  }

  // ── sync local settings ─────────────────────────────────────────────────────

  useEffect(() => {
    setLocalSettings(settings.find((s) => s.name === selectedImage) ?? null)
    const r = resultsData.find((item) => item.name === selectedImage)
    setResultData(r ? URL.createObjectURL(r.data) : null)
  }, [resultsData, selectedImage, settings])

  // ── render ──────────────────────────────────────────────────────────────────

  const canDownload =
    activeTool === "upscaler"
      ? !!upscaledData
      : !!resultsData.find((item) => item.name === selectedImage)

  return (
    <>
      {/* ── Canvas ── */}
      <InfiniteViewer
        ref={editor}
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
                      alt="Original image"
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
                        alt="Processed image"
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
              title="Process all images in queue"
            >
              <LoaderIcon />
            </Button>

            <div className="my-auto rounded-full bg-neutral-950/40 p-1" />

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
                editor.current?.setZoom(editor.current.getZoom() + 0.2)
              }
              size="icon"
              variant="ghost"
            >
              <ZoomIn />
            </Button>

            <Button
              onClick={() =>
                editor.current?.setZoom(editor.current.getZoom() - 0.2)
              }
              size="icon"
              variant="ghost"
            >
              <ZoomOut />
            </Button>

            <Button
              onClick={() => {
                editor.current?.setZoom(1)
                editor.current?.scrollCenter()
              }}
              size="icon"
              variant="ghost"
            >
              <ScanEye />
            </Button>

            <div className="my-auto rounded-full bg-neutral-950/40 p-1" />

            <ThemeToggle />
          </div>
        </div>

        {/* Side panels */}
        <div className="pointer-events-none flex h-screen w-screen">
          <div className="pointer-events-none flex w-full items-center p-4">
            {/* ── Left panel ── */}
            <div className="pointer-events-auto h-fit max-h-[calc(100vh-6rem)] w-[21rem] overflow-y-auto rounded-md bg-white p-4 backdrop-blur-3xl transition-all dark:bg-neutral-900/80">
              {/* Tab switcher */}
              <div className="mb-4 flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                <button
                  onClick={() => setActiveTool("remover")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    activeTool === "remover"
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  )}
                >
                  <Eraser className="size-3.5" />
                  BG Remover
                </button>
                <button
                  onClick={() => setActiveTool("upscaler")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    activeTool === "upscaler"
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  )}
                >
                  <Sparkles className="size-3.5" />
                  Upscaler
                </button>
              </div>

              {/* ── BG Remover tab ── */}
              {activeTool === "remover" && (
                <div className="flex flex-col gap-4">
                  {localSettings ? (
                    <ImageSettings
                      settings={localSettings}
                      onChange={(s) => {
                        setLocalSettings(s)
                        setSettings((prev) =>
                          prev.map((item) =>
                            item.name !== selectedImage ? item : s
                          )
                        )
                      }}
                    />
                  ) : (
                    <p className="mt-2 text-center text-sm text-neutral-400">
                      Select an image to edit
                    </p>
                  )}

                  {/* Solid background color */}
                  <div className="flex flex-col gap-3 border-t pt-4 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Solid Background
                      </span>
                      <button
                        role="switch"
                        aria-checked={applyBgColor}
                        onClick={() => setApplyBgColor((v) => !v)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none",
                          applyBgColor
                            ? "bg-[#FF2587]"
                            : "bg-neutral-300 dark:bg-neutral-600"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                            applyBgColor ? "translate-x-4" : "translate-x-0"
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

                  <Button
                    onClick={remove}
                    disabled={!imageData}
                    className="w-full"
                  >
                    <Eraser className="mr-2 size-4" />
                    Remove Background
                  </Button>
                </div>
              )}

              {/* ── Upscaler tab ── */}
              {activeTool === "upscaler" && (
                <div className="flex flex-col gap-4">
                  {imageData ? (
                    <>
                      <p className="text-center text-xs leading-relaxed text-neutral-400">
                        Uses AI (TensorFlow.js) to enhance and upscale the
                        current image.{" "}
                        {resultData
                          ? "Will upscale the processed result."
                          : "Will upscale the original."}
                      </p>

                      <Button onClick={upscale} className="w-full">
                        <Sparkles className="mr-2 size-4" />
                        Upscale Image
                      </Button>

                      {upscaledData && (
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="mr-2 size-4" />
                          Download Upscaled
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-center text-sm text-neutral-400">
                      Select an image to upscale
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4">
                <AdBanner />
              </div>
            </div>

            {/* ── Right panel — Queue ── */}
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
                dropzoneOptions={{
                  maxFiles: 10,
                  accept: {
                    "image/png": [".png"],
                    "image/jpg": [".jpg", ".jpeg"],
                    "image/webp": [".webp"],
                  },
                }}
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
                      key={`img-${index}`}
                      className={cn(
                        "group relative h-32 cursor-pointer rounded border-2 bg-slate-500 object-cover transition-all",
                        selectedImage === file.name
                          ? "border-[#FF2587]"
                          : "border-neutral-900 dark:border-neutral-300"
                      )}
                    >
                      <img
                        className="h-32 w-full rounded object-cover"
                        alt={`image-${index}`}
                        src={url}
                        onClick={() => handleChangeImage(url, file.name)}
                      />
                      {isDone && (
                        <span className="absolute bottom-1 right-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          ✓
                        </span>
                      )}
                      <Button
                        onClick={() => handleRemoveFile(file)}
                        className="absolute left-1 top-1 rounded-full bg-neutral-800 text-neutral-100 opacity-0 transition-all group-hover:opacity-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950"
                        variant="ghost"
                        size="icon"
                      >
                        <Trash />
                      </Button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setFiles([])
                    setSettings([])
                    setSelectedImage(null)
                    setLocalSettings(null)
                    setImageData(null)
                    setResultData(null)
                    setResultsData([])
                    setUpscaledData(null)
                  }}
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

      {/* ── Processing dialog ── */}
      <AlertDialog open={showDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processing</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-2">
              <p className="text-sm">{dialogText}</p>
              {dialogProgress > 0 ? (
                <div className="flex flex-col gap-1">
                  <Progress value={(dialogProgress * 100) / dialogTotal} />
                  <span className="text-right text-xs text-neutral-400">
                    {Math.round((dialogProgress * 100) / dialogTotal)}%
                  </span>
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
