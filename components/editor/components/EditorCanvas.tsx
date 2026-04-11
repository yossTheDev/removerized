/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ReactCompareSlider } from "react-compare-slider"
// import DustEffect from "react-dust-effect"

import { Icons } from "@/components/icons"

interface EditorCanvasProps {
  imageData: string | null
  resultData: string | null
  showDust: boolean
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export const EditorCanvas = ({
  imageData,
  resultData,
  showDust,
  zoom,
  onZoomIn,
  onZoomOut,
}: EditorCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
    aspectRatio: number
  } | null>(null)

  // Load image to get natural dimensions
  useEffect(() => {
    if (!imageData) {
      setImageDimensions(null)
      return
    }

    const img = new (globalThis as any).Image()
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio,
      })
    }
    img.onerror = () => {
      console.error("Failed to load image dimensions")
      setImageDimensions(null)
    }
    img.src = imageData
  }, [imageData])

  // Calculate display dimensions with max limits
  const displayDimensions = (() => {
    if (!imageDimensions) return null

    const MAX_WIDTH = 800
    const MAX_HEIGHT = 600

    let displayWidth = imageDimensions.width
    let displayHeight = imageDimensions.height

    // Scale down if image is too large
    if (displayWidth > MAX_WIDTH) {
      const scale = MAX_WIDTH / displayWidth
      displayWidth = MAX_WIDTH
      displayHeight = displayHeight * scale
    }

    if (displayHeight > MAX_HEIGHT) {
      const scale = MAX_HEIGHT / displayHeight
      displayHeight = MAX_HEIGHT
      displayWidth = displayWidth * scale
    }

    return { width: displayWidth, height: displayHeight }
  })()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: any) => {
      // Check for Ctrl (Windows/Linux) or Cmd (Mac) key
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()

        // Zoom in for scroll up (negative deltaY), zoom out for scroll down (positive deltaY)
        if (e.deltaY < 0) {
          onZoomIn()
        } else {
          onZoomOut()
        }
      }
    }

    (container as any).addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      (container as any).removeEventListener("wheel", handleWheel)
    }
  }, [onZoomIn, onZoomOut])

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-auto">
      <div
        className="rounded-2xl p-4 transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="flex size-full items-center justify-center gap-16 p-4">
          <ReactCompareSlider
            className="rounded-xl transition-all duration-300 ease-in-out"
            style={{
              width: displayDimensions?.width || "100%",
              height: displayDimensions?.height || "auto",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            aria-label="Image comparison slider"
            itemOne={
              imageData ? (
                <Image
                  width={displayDimensions?.width || 300}
                  height={displayDimensions?.height || 150}
                  className="rounded-xl bg-white"
                  style={{
                    width: displayDimensions?.width || "100%",
                    height: displayDimensions?.height || "auto",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                  src={imageData}
                  alt="Original image"
                />
              ) : (
                <div
                  className="flex h-80 w-[36rem] items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
                  role="img"
                  aria-label="Empty gallery placeholder"
                >
                  <Icons.SolarGalleryBoldDuotone className="size-16 text-white/20" />
                </div>
              )
            }
            itemTwo={
              resultData ? (
                <div
                  className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-white/100"
                  role="img"
                  aria-label="Processed image result"
                >
                  <Image
                    width={displayDimensions?.width || 300}
                    height={displayDimensions?.height || 150}
                    className="grid-pattern rounded-xl"
                    style={{
                      width: displayDimensions?.width || "100%",
                      height: displayDimensions?.height || "auto",
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                    src={resultData}
                    alt="Processed image"
                  />
                  {/*  {imageData && (
                      <DustEffect
                        className="absolute flex max-h-80 w-full rounded-xl"
                        src={imageData}
                        show={showDust}
                        option={{ baseDuration: 100, blur: 2 }}
                      />
                    )} */}
                </div>
              ) : (
                <div
                  className="flex size-full items-center justify-center rounded-xl border border-white/10 bg-white backdrop-blur-xl"
                  role="img"
                  aria-label="Empty processed result placeholder"
                >
                  <div className="grid-pattern flex size-full items-center justify-center">
                    <Icons.SolarGalleryBoldDuotone className="size-16 text-white/20" />
                  </div>
                </div>
              )
            }
          />
        </div>
      </div>
    </div>
  )
}
