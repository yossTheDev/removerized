/* eslint-disable @next/next/no-img-element */
"use client"

import { RefObject } from "react"
import Image from "next/image"
import { ReactCompareSlider } from "react-compare-slider"
// import DustEffect from "react-dust-effect"
import InfiniteViewer from "react-infinite-viewer"

import { Icons } from "@/components/icons"

interface EditorCanvasProps {
  editorRef: RefObject<InfiniteViewer | null>
  imageData: string | null
  resultData: string | null
  showDust: boolean
}

export const EditorCanvas = ({
  editorRef,
  imageData,
  resultData,
  showDust,
}: EditorCanvasProps) => {
  return (
    <InfiniteViewer
      ref={editorRef}
      className="viewer h-full w-full"
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
    </InfiniteViewer>
  )
}
