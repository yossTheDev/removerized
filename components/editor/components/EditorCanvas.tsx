/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef } from "react"
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

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
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

    container.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      container.removeEventListener("wheel", handleWheel)
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
            className="aspect-square max-w-xl rounded-xl lg:aspect-video"
            style={{ width: "100%", height: "auto" }}
            aria-label="Image comparison slider"
            itemOne={
              imageData ? (
                <Image
                  width={300}
                  height={150}
                  className="flex max-h-80 w-full rounded-xl bg-white"
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
                    width={300}
                    height={150}
                    className="grid-pattern flex max-h-80 w-full rounded-xl"
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
