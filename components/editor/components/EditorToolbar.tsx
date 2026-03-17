import { Download, LoaderIcon, ScanEye, ZoomIn, ZoomOut } from "lucide-react"
import InfiniteViewer from "react-infinite-viewer"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditorToolbarProps {
  /** Ref to the InfiniteViewer instance used for zoom/pan controls */
  editorRef: React.RefObject<InfiniteViewer>
  /** Whether the download button should be enabled */
  canDownload: boolean
  /** Called when the user clicks the batch-process (loader) button */
  onProcess: () => void
  /** Called when the user clicks the download button */
  onDownload: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * EditorToolbar
 * ─────────────
 * The floating bottom bar anchored to the bottom-center of the viewport.
 *
 * Contains (left → right):
 *  - Brand logo
 *  - Batch-process trigger
 *  - Separator
 *  - Download result
 *  - Zoom in / out / reset
 *  - Separator
 *  - Theme toggle
 *
 * The entire bar is `pointer-events-auto` so clicks are not swallowed by the
 * transparent overlay that covers the canvas.
 */
export const EditorToolbar = ({
  editorRef,
  canDownload,
  onProcess,
  onDownload,
}: EditorToolbarProps) => {
  /** Increases the canvas zoom by a fixed step */
  const handleZoomIn = () => {
    editorRef.current?.setZoom(editorRef.current.getZoom() + 0.2)
  }

  /** Decreases the canvas zoom by a fixed step */
  const handleZoomOut = () => {
    editorRef.current?.setZoom(editorRef.current.getZoom() - 0.2)
  }

  /** Resets zoom to 1× and re-centers the viewport */
  const handleZoomReset = () => {
    editorRef.current?.setZoom(1)
    editorRef.current?.scrollCenter()
  }

  return (
    <div className="pointer-events-none absolute z-20 flex h-screen w-screen items-center justify-center">
      <div className="pointer-events-auto mb-10 mt-auto flex h-fit items-center gap-2 rounded-md bg-white px-4 py-2 shadow-md backdrop-blur-3xl dark:bg-neutral-900/80">
        {/* Brand */}
        <div className="my-auto flex items-center">
          <Icons.logo className="size-8 text-[#FF2587]" />
        </div>

        {/* Batch process all queued images */}
        <Button
          onClick={onProcess}
          size="icon"
          variant="ghost"
          title="Process all images in queue"
        >
          <LoaderIcon />
        </Button>

        {/* Visual separator */}
        <div className="my-auto h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* Download current result */}
        <Button
          disabled={!canDownload}
          onClick={onDownload}
          size="icon"
          variant="ghost"
          title="Download result"
        >
          <Download />
        </Button>

        {/* Zoom in */}
        <Button
          onClick={handleZoomIn}
          size="icon"
          variant="ghost"
          title="Zoom in"
        >
          <ZoomIn />
        </Button>

        {/* Zoom out */}
        <Button
          onClick={handleZoomOut}
          size="icon"
          variant="ghost"
          title="Zoom out"
        >
          <ZoomOut />
        </Button>

        {/* Reset zoom and re-center */}
        <Button
          onClick={handleZoomReset}
          size="icon"
          variant="ghost"
          title="Reset zoom"
        >
          <ScanEye />
        </Button>

        {/* Visual separator */}
        <div className="my-auto h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* Light / dark theme toggle */}
        <ThemeToggle />
      </div>
    </div>
  )
}
