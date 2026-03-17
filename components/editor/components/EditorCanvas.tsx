/* eslint-disable @next/next/no-img-element */
"use client"

import { RefObject } from "react"
import Image from "next/image"
import { ReactCompareSlider } from "react-compare-slider"
import DustEffect from "react-dust-effect"
import InfiniteViewer from "react-infinite-viewer"

import { Icons } from "@/components/icons"

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditorCanvasProps {
  /** Forwarded ref so the parent toolbar can call setZoom / scrollCenter */
  editorRef: RefObject<InfiniteViewer>
  /** Object URL of the original uploaded image, or null when empty */
  imageData: string | null
  /** Object URL of the processed result, or null when not yet available */
  resultData: string | null
  /**
   * Controls the DustEffect animation that plays once after a result arrives.
   * The parent sets this to `true` for ~100 ms then back to `false`.
   */
  showDust: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * EditorCanvas
 * ────────────
 * Renders the pannable / zoomable infinite canvas containing the
 * before/after comparison slider.
 *
 * Responsibilities:
 *  - Wraps everything in `react-infinite-viewer` so the user can pan and zoom
 *    with the mouse wheel, gestures, or the toolbar zoom buttons.
 *  - Uses `ReactCompareSlider` to show the original image on the left and the
 *    processed result on the right.
 *  - Plays a `DustEffect` animation on top of the original whenever a new
 *    result is delivered (controlled by the `showDust` prop).
 *  - Shows placeholder tiles (icon + neutral background) for either side
 *    when no image data is present yet.
 *
 * This component is intentionally pure — it receives all data via props and
 * emits nothing upward.  All imperative viewport control goes through
 * `editorRef`.
 */
export const EditorCanvas = ({
  editorRef,
  imageData,
  resultData,
  showDust,
}: EditorCanvasProps) => {
  return (
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
                  /* Original image */
                  <Image
                    width={300}
                    height={150}
                    className="flex max-h-80 w-full rounded-xl"
                    src={imageData}
                    alt="Original"
                  />
                ) : (
                  /* Placeholder when no image is selected */
                  <div className="flex h-80 w-[36rem] items-center justify-center rounded-xl bg-neutral-400 dark:bg-neutral-900">
                    <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-700" />
                  </div>
                )
              }
              itemTwo={
                resultData ? (
                  /* Processed result with dust-effect overlay */
                  <div className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-neutral-500 dark:bg-neutral-900">
                    <Image
                      width={300}
                      height={150}
                      className="grid-pattern flex max-h-80 w-full rounded-xl"
                      src={resultData}
                      alt="Processed"
                    />
                    {/* Dust particle animation played once after processing */}
                    <DustEffect
                      className="absolute flex max-h-80 w-full rounded-xl"
                      src={imageData!}
                      show={showDust}
                      option={{ baseDuration: 100, blur: 2 }}
                    />
                  </div>
                ) : (
                  /* Placeholder with checkerboard pattern (transparency hint) */
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
  )
}
