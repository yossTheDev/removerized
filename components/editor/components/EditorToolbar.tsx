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
              aria-label="Process all images in queue (Ctrl + Enter)"
              className={cn(
                "size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
              )}
            >
              <LoaderIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Process all images <span className="ml-1 text-white/40">(Ctrl + Enter)</span></p>
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
              aria-label="Download result"
              className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20"
            >
              <Download className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download all images</p>
          </TooltipContent>
        </Tooltip>

        <div className="mx-1.5 h-4 w-px bg-white/10" />

        {/* Zoom in */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-8 items-center">
              <Button
                onClick={onZoomIn}
                disabled={zoom >= 3}
                size="icon"
                variant="ghost"
                aria-label="Zoom in (Ctrl +)"
                className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20"
              >
                <ZoomIn className="size-4" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom in <span className="ml-1 text-white/40">(Ctrl +)</span></p>
          </TooltipContent>
        </Tooltip>

        {/* Zoom level indicator (also resets zoom) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onZoomReset}
              className="w-12 rounded-md text-center text-xs font-medium text-white/40 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label={`Current zoom ${Math.round(zoom * 100)}%. Click to reset.`}
            >
              {Math.round(zoom * 100)}%
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset zoom <span className="ml-1 text-white/40">(Ctrl 0)</span></p>
          </TooltipContent>
        </Tooltip>

        {/* Zoom out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-8 items-center">
              <Button
                onClick={onZoomOut}
                disabled={zoom <= 0.5}
                size="icon"
                variant="ghost"
                aria-label="Zoom out (Ctrl -)"
                className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white disabled:opacity-20"
              >
                <ZoomOut className="size-4" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom out <span className="ml-1 text-white/40">(Ctrl -)</span></p>
          </TooltipContent>
        </Tooltip>

        {/* Reset zoom */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onZoomReset}
              size="icon"
              variant="ghost"
              aria-label="Reset zoom (Ctrl 0)"
              className="size-8 rounded-xl text-white/50 transition-all hover:bg-white/10 hover:text-white"
            >
              <ScanEye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset zoom <span className="ml-1 text-white/40">(Ctrl 0)</span></p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
