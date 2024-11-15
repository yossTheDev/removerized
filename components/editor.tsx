/* eslint-disable @next/next/no-img-element */
"use client"

import { FormEvent, useCallback, useState } from "react"
import Image from "next/image"
import { Config, removeBackground } from "@imgly/background-removal"
import { sendGAEvent } from "@next/third-parties/google"
import {
  Download,
  LoaderIcon,
  Plus,
  ScanEye,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { ReactCompareSlider } from "react-compare-slider"
import DustEffect from "react-dust-effect"
import InfiniteViewer from "react-infinite-viewer"
import { toast } from "sonner"

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

import { ThemeToggle } from "./theme-toggle"

export const Editor = () => {
  const [show, setShow] = useState(false)

  const [files, setFiles] = useState<File[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [dialogText, setDialogText] = useState<string>("null")
  const [dialogProgress, setDialogProgress] = useState<number>(0)
  const [dialogTotal, setDialogTotal] = useState<number>(100)

  const [imageData, setImageData] = useState<string | null>(null)
  const [resultData, setResultData] = useState<string | null>(null)

  const handleDataChange = useCallback(
    (_files: File[] | null) => {
      console.log("previous files " + files.length)
      console.log(files)

      if (_files) {
        const url = URL.createObjectURL(_files[0])

        const copy = [...files]

        console.log("copy")
        console.log(copy)

        setFiles([...copy, _files[0]])

        console.log("files " + _files.length)
        console.log("files array")

        console.log([...files, ..._files])
        setImageData(url)
        setResultData(null)
      }
    },
    [files]
  )

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = resultData!
    link.download = `removerized-${Date.now()}.png`
    link.click()
  }

  const remove = (ev: FormEvent) => {
    ev.preventDefault()

    let config: Config = {
      model: "isnet",
      debug: true,
      publicPath: "http://localhost:3000/ai-data/", // path to the wasm files
      progress: (key, current, total) => {
        setDialogProgress(current)
        setDialogTotal(total)
        setDialogText(key)

        if (key.includes("fetch:"))
          setDialogText(
            "Downloading AI models. This was a little while ago the first time..."
          )
        if (key === "compute:inference") setDialogText("Processing image...")
      },
    }

    if (imageData) {
      const start = performance.now()

      setDialogText("Starting...")
      setShowDialog(true)

      removeBackground(imageData!, config).then((blob: Blob) => {
        // result is a blob encoded as PNG.
        // It can be converted to an URL to be used as HTMLImage.src
        const url = URL.createObjectURL(blob)

        setShowDialog(false)
        const end = performance.now()
        const time = end - start
        toast.success(
          `🚀 Successful operation in  ${Math.floor(time / 1000)} s`
        )

        sendGAEvent({ event: "remove-background", value: "success" })
        setResultData(url)
        setShow(true)

        setTimeout(() => {
          setShow(false)
        }, 100)
      })
    }
  }

  return (
    <>
      <InfiniteViewer
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
        <div className="viewport  ">
          <div className="rounded-2xl  p-4">
            {/* Images */}
            <div className="flex size-full items-center justify-center gap-16 p-4">
              <ReactCompareSlider
                className="max-w-xl rounded-xl"
                itemOne={
                  <>
                    {imageData ? (
                      <Image
                        width={300}
                        height={150}
                        className="flex max-h-80 w-full rounded-xl"
                        src={imageData}
                        alt="Selected image"
                      />
                    ) : (
                      <div className="flex h-80 w-[36rem] items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-900">
                        <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-500"></Icons.SolarGalleryBoldDuotone>
                      </div>
                    )}
                  </>
                }
                itemTwo={
                  <>
                    {resultData ? (
                      <div className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-neutral-200 dark:bg-neutral-900">
                        <Image
                          width={300}
                          height={150}
                          className="grid-pattern flex max-h-80 w-full rounded-xl "
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
                      <div className="flex size-full items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-900">
                        <div className="grid-pattern flex size-full items-center justify-center">
                          <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-500"></Icons.SolarGalleryBoldDuotone>
                        </div>
                      </div>
                    )}
                  </>
                }
              ></ReactCompareSlider>
            </div>

            {/* Tools */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={"ringHover"}
                className="rounded-full font-bold"
                onClick={remove}
                disabled={!imageData}
              >
                <Icons.SolarGalleryRemoveLineDuotone className="mr-2 size-5"></Icons.SolarGalleryRemoveLineDuotone>
                Process
              </Button>

              <Button
                variant={"linkHover2"}
                disabled={!resultData}
                className="font-bold"
                onClick={handleDownload}
              >
                <Icons.SolarDownloadMinimalisticBoldDuotone className="mr-2 size-5"></Icons.SolarDownloadMinimalisticBoldDuotone>
                Download
              </Button>
            </div>
          </div>
        </div>
      </InfiniteViewer>

      {/* Tools */}
      <div className="pointer-events-none absolute z-20 h-screen w-screen">
        <div className="flex h-screen w-screen ">
          {/* Bottom Bar */}
          <div className="flex w-full justify-center ">
            <div className="pointer-events-auto mb-10 mt-auto flex h-fit gap-2 rounded-md bg-white px-4 py-2 dark:bg-neutral-900">
              <Button size={"icon"} variant={"ghost"}>
                <LoaderIcon></LoaderIcon>
              </Button>

              <Button size={"icon"} variant={"ghost"}>
                <Download></Download>
              </Button>

              <Button size={"icon"} variant={"ghost"}>
                <Settings></Settings>
              </Button>

              <Button size={"icon"} variant={"ghost"}>
                <ZoomIn></ZoomIn>
              </Button>

              <Button size={"icon"} variant={"ghost"}>
                <ZoomOut></ZoomOut>
              </Button>

              <Button size={"icon"} variant={"ghost"}>
                <ScanEye></ScanEye>
              </Button>

              <ThemeToggle />
            </div>
          </div>

          {/* Queue Bar */}
          <div className="pointer-events-auto flex w-1/5 items-center justify-center p-4">
            <div className="min-h-96 w-60 rounded-md bg-white px-4 py-2 dark:bg-neutral-900">
              {/* Input */}
              <div
                className="mt-2 flex items-center justify-center gap-4 rounded-md bg-neutral-950/35"
                onSubmit={remove}
              >
                <button onClick={() => console.log(files)}>CLICK</button>
                <FileUploader
                  value={null}
                  dropzoneOptions={{
                    maxFiles: 10,
                    accept: {
                      "image/png": [".png"],
                      "image/jpg": [".jpg", ".jpeg"],
                      "image/webp": [".webp"],
                    },
                  }}
                  onValueChange={handleDataChange}
                  className="relative max-w-xs space-y-1 rounded-xl transition-all hover:bg-neutral-200 dark:hover:bg-neutral-900"
                >
                  <FileInput>
                    <div className="flex w-full flex-col items-center justify-center pb-4 pt-3 ">
                      <Plus className="size-20 text-neutral-700"></Plus>
                    </div>
                  </FileInput>
                  <FileUploaderContent></FileUploaderContent>
                </FileUploader>
              </div>

              {/* Images List */}
              <div className="mt-4 flex max-h-80 flex-col gap-2 overflow-scroll">
                <p className="my-2 text-sm text-neutral-500">
                  Files: {files?.length}
                </p>
                {files?.map((file, index) => {
                  const url = URL.createObjectURL(file)

                  return (
                    <img
                      className="rounded border border-neutral-900 dark:border-neutral-300"
                      alt={`image-${index}`}
                      src={url}
                    ></img>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="fixed left-10 top-10 rounded-2xl bg-white p-4"></div>
      </div>

      <AlertDialog open={showDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processing</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-2">
              <p>{dialogText}</p>
              {dialogText.includes("Downloading") ? (
                <Progress
                  value={(dialogProgress * 100) / dialogTotal}
                ></Progress>
              ) : (
                <Loader></Loader>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
