import { Download, LoaderIcon, ScanEye, ZoomIn, ZoomOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EditorToolbarProps {
  canDownload: boolean
  onProcess: () => void
  onDownload: () => void
  accentColor: string
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  zoom: number
}

export const EditorToolbar = ({
  canDownload,
  onProcess,
  onDownload,
  accentColor,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom,
}: EditorToolbarProps) => {
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onProcess}
              size="icon"
              variant="ghost"
              aria-label="Process all images in queue"
              className={cn(
                "size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
              )}
            >
              <LoaderIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Process all images (Ctrl + Enter)</p>
          </TooltipContent>
        </Tooltip>

        <div className="mx-1.5 h-4 w-px bg-white/10" />

        {/* Download result */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={!canDownload}
              onClick={onDownload}
              size="icon"
              variant="ghost"
              aria-label="Download all images"
              className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20"
            >
              <Download className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download all images (Ctrl + S)</p>
          </TooltipContent>
        </Tooltip>

        <div className="mx-1.5 h-4 w-px bg-white/10" />

        {/* Zoom in */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onZoomIn}
              size="icon"
              variant="ghost"
              aria-label="Zoom in"
              className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
            >
              <ZoomIn className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom in (Ctrl +)</p>
          </TooltipContent>
        </Tooltip>

        {/* Zoom level indicator */}
        <span className="w-12 text-center text-xs text-white/50">
          {Math.round(zoom * 100)}%
        </span>

        {/* Zoom out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onZoomOut}
              size="icon"
              variant="ghost"
              aria-label="Zoom out"
              className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
            >
              <ZoomOut className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom out (Ctrl -)</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset zoom */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onZoomReset}
              size="icon"
              variant="ghost"
              aria-label="Reset zoom"
              className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
            >
              <ScanEye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset zoom (Ctrl 0)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
