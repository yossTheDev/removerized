import { Download, LoaderIcon, ScanEye, ZoomIn, ZoomOut } from "lucide-react"
import InfiniteViewer from "react-infinite-viewer"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface EditorToolbarProps {
  editorRef: React.RefObject<InfiniteViewer>
  canDownload: boolean
  onProcess: () => void
  onDownload: () => void
  accentColor: string
}

export const EditorToolbar = ({
  editorRef,
  canDownload,
  onProcess,
  onDownload,
  accentColor,
}: EditorToolbarProps) => {
  const handleZoomIn = () => {
    editorRef.current?.setZoom(editorRef.current.getZoom() + 0.2)
  }

  const handleZoomOut = () => {
    editorRef.current?.setZoom(editorRef.current.getZoom() - 0.2)
  }

  const handleZoomReset = () => {
    editorRef.current?.setZoom(1)
    editorRef.current?.scrollCenter()
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-5">
      <div
        className="pointer-events-auto flex h-fit items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-2xl backdrop-blur-2xl"
        style={{
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06), 0 0 40px ${accentColor}10`,
        }}
      >
        {/* Brand */}
        <div className="flex items-center px-1">
          <Icons.logo
            className="size-7 transition-colors"
            style={{ color: accentColor }}
          />
        </div>

        <div className="mx-1.5 h-4 w-px bg-white/10" />

        {/* Batch process queue */}
        <Button
          onClick={onProcess}
          size="icon"
          variant="ghost"
          title="Process all images in queue"
          className={cn(
            "size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
          )}
        >
          <LoaderIcon className="size-4" />
        </Button>

        <div className="mx-1.5 h-4 w-px bg-white/10" />

        {/* Download result */}
        <Button
          disabled={!canDownload}
          onClick={onDownload}
          size="icon"
          variant="ghost"
          title="Download result"
          className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20"
        >
          <Download className="size-4" />
        </Button>

        {/* Zoom in */}
        <Button
          onClick={handleZoomIn}
          size="icon"
          variant="ghost"
          title="Zoom in"
          className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
        >
          <ZoomIn className="size-4" />
        </Button>

        {/* Zoom out */}
        <Button
          onClick={handleZoomOut}
          size="icon"
          variant="ghost"
          title="Zoom out"
          className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
        >
          <ZoomOut className="size-4" />
        </Button>

        {/* Reset zoom + recenter */}
        <Button
          onClick={handleZoomReset}
          size="icon"
          variant="ghost"
          title="Reset zoom"
          className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
        >
          <ScanEye className="size-4" />
        </Button>
      </div>
    </div>
  )
}
