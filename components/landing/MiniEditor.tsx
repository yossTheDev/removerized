"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  LucideIcon,
  ImageIcon,
  Maximize,
  Palette,
  Trash2,
  Download,
  ZoomIn,
  Monitor,
  Smartphone,
  Upload,
  Loader2,
  ArrowRight,
  RefreshCw,
  Zap
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useOnnxSession } from "../editor/hooks/use-onnx-session"
import { loadImage } from "../editor/lib/image-utils"
import { WASM_CDN_BASE } from "../editor/constants"

interface MiniEditorProps {
  tool?: "remover" | "upscaler" | "colorizer"
}

export function MiniEditor({ tool = "remover" }: MiniEditorProps) {
  const ortRef = useRef<typeof import("onnxruntime-web") | null>(null)
  const onnx = useOnnxSession(ortRef)

  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // WASM init
  useEffect(() => {
    let mounted = true
    import("onnxruntime-web").then((ort) => {
      if (!mounted) return
      ort.env.wasm.wasmPaths = WASM_CDN_BASE
      ort.env.wasm.numThreads = 1
      ortRef.current = ort
    })
    return () => { mounted = false }
  }, [])

  const accents = {
    remover: "#3b82f6",
    upscaler: "#a855f7",
    colorizer: "#ec4899",
  }

  const accent = accents[tool]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: isProcessing
  })

  const handleProcess = async () => {
    if (!image || isProcessing) return
    setIsProcessing(true)
    setProgress(0)
    setStatusText("Initializing...")

    try {
      const imgEl = await loadImage(image)
      let outputBlob: Blob

      if (tool === "remover") {
        outputBlob = await onnx.runInference(imgEl, "ormbg_quantized", (txt, pct) => {
          setStatusText(txt)
          setProgress(pct)
        })
      } else if (tool === "upscaler") {
        outputBlob = await onnx.runImageToImage(imgEl, "swin2sr_quantized", (txt, pct) => {
          setStatusText(txt)
          setProgress(pct)
        }, { size: 512 })
      } else {
        outputBlob = await onnx.runImageToImage(imgEl, "deoldify_artistic_quantized", (txt, pct) => {
          setStatusText(txt)
          setProgress(pct)
        })
      }

      setResult(URL.createObjectURL(outputBlob))
    } catch (err) {
      console.error(err)
      setStatusText("Error processing image")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const link = (globalThis as any).document.createElement("a")
    link.href = result
    link.download = `removerized-mini-${tool}-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="w-full max-w-5xl">
      {/* Mobile Disclaimer */}
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-center lg:hidden">
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-white/5 text-white/20">
          <Monitor className="size-8" />
        </div>
        <h3 className="mb-2 text-xl font-bold">Desktop Only Preview</h3>
        <p className="text-sm text-white/40 leading-relaxed max-w-[280px]">
          The interactive preview is optimized for larger screens. Open this page on a computer to experience the full tool simulator.
        </p>
        <Link href={`/editor/${tool === 'remover' ? 'removerized' : tool}`} className="mt-8">
           <Button size="sm" className="rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">
             Go to Mobile Editor
           </Button>
        </Link>
      </div>

      {/* Desktop Functional Mini Editor */}
      <div
        className="hidden lg:group relative lg:flex aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
        style={{ "--tool-accent": accent } as any}
      >
        {/* Header */}
        <div className="flex h-12 w-full items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 absolute top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-red-500/50" />
            <div className="size-2 rounded-full bg-yellow-500/50" />
            <div className="size-2 rounded-full bg-green-500/50" />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1 text-[10px] text-white/40 font-mono tracking-tight">
            <Zap className="size-3 text-yellow-500" />
            removerized.com/mini-editor/{tool}
          </div>
          <Link href={`/editor/${tool === 'remover' ? 'removerized' : tool}`}>
             <Button size="sm" variant="ghost" className="h-7 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white hover:bg-white/5">
                Full Editor <ArrowRight className="ml-1 size-3" />
             </Button>
          </Link>
        </div>

        <div className="flex h-full w-full pt-12">
          {/* Sidebar */}
          <div className="flex w-16 flex-col items-center gap-4 border-r border-white/5 pt-6">
            <SidebarIcon active={tool === "remover"} icon={Trash2} color="#3b82f6" />
            <SidebarIcon active={tool === "upscaler"} icon={Maximize} color="#a855f7" />
            <SidebarIcon active={tool === "colorizer"} icon={Palette} color="#ec4899" />
          </div>

          {/* Canvas Area */}
          <div className="relative flex flex-1 flex-col items-center justify-center bg-black/40 p-12 overflow-hidden">

             {/* Background Glow */}
             <div className="absolute inset-0 z-0 opacity-10 blur-3xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${accent}, transparent)` }} />

             <div className="relative z-10 w-full max-w-lg aspect-square">
                <AnimatePresence mode="wait">
                  {!image ? (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      {...(getRootProps() as any)}
                      className={`h-full w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
                        ${isDragActive ? "border-[var(--tool-accent)] bg-[var(--tool-accent)]/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5">
                        <Upload className="size-6 text-white/40" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white/60">Drop your image here</p>
                        <p className="text-xs text-white/30 mt-1">or click to browse files</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111]"
                    >
                      <img
                        src={result || image}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />

                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8">
                           <Loader2 className="size-10 text-[var(--tool-accent)] animate-spin mb-6" />
                           <p className="text-sm font-medium text-white mb-4">{statusText}</p>
                           <Progress value={progress} className="h-1 w-full max-w-[200px]" style={{"--progress-foreground": accent} as any} />
                        </div>
                      )}

                      {!isProcessing && !result && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                            <Button onClick={() => setImage(null)} variant="destructive" size="sm" className="rounded-xl">
                               <RefreshCw className="mr-2 size-4" /> Change Image
                            </Button>
                         </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Toolbar bottom */}
             <div className="absolute bottom-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md z-20 shadow-xl">
                <div className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 cursor-not-allowed">
                  <ZoomIn className="size-4 text-white/20" />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <button
                  onClick={handleDownload}
                  disabled={!result || isProcessing}
                  className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <Download className="size-4 text-white/80" />
                </button>
             </div>
          </div>

          {/* Right Panel */}
          <div className="hidden w-64 flex-col border-l border-white/5 p-6 lg:flex bg-white/[0.01]">
            <div className="mb-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">Tool Configuration</h4>
               <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.03]">
                     <div className="text-[11px] font-bold text-white/60 mb-2">Model Version</div>
                     <div className="text-[10px] text-white/30 italic">On-device Optimized v1.0</div>
                  </div>
                  <div className="h-px w-full bg-white/5" />
                  <div className="space-y-2">
                     <div className="h-2 w-24 rounded bg-white/5" />
                     <div className="h-2 w-full rounded bg-white/[0.02]" />
                  </div>
               </div>
            </div>

            <div className="mt-auto space-y-4">
               {!result ? (
                 <Button
                   onClick={handleProcess}
                   disabled={!image || isProcessing}
                   className="w-full h-12 rounded-xl font-bold text-sm tracking-wide text-white shadow-lg transition-transform active:scale-95 disabled:grayscale"
                   style={{ backgroundColor: accent }}
                 >
                   {isProcessing ? <Loader2 className="animate-spin" /> : `RUN ${tool.toUpperCase()}`}
                 </Button>
               ) : (
                 <Button
                   onClick={() => { setImage(null); setResult(null); }}
                   variant="outline"
                   className="w-full h-12 rounded-xl border-white/10 bg-white/5 font-bold text-sm text-white"
                 >
                   RESET
                 </Button>
               )}
               <p className="text-[9px] text-center text-white/20 leading-relaxed uppercase tracking-tighter font-medium">
                  Free · Unlimited · 100% Client-side
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarIcon({ active, icon: Icon, color }: { active: boolean; icon: LucideIcon; color: string }) {
  return (
    <div className={`flex size-10 items-center justify-center rounded-xl transition-all ${active ? "bg-white/10 shadow-inner" : "opacity-30"}`}>
      <Icon className="size-5" style={{ color: active ? color : "white" }} />
    </div>
  )
}
