"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import imglyRemoveBackground, { Config } from "@imgly/background-removal"
import { sendGAEvent } from "@next/third-parties/google"
import { ReactCompareSlider } from "react-compare-slider"
import DustEffect from "react-dust-effect"
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

export const Editor = () => {
  const [show, setShow] = useState(false)

  const [files, setFiles] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogText, setDialogText] = useState<string>("null")
  const [dialogProgress, setDialogProgress] = useState<number>(0)
  const [dialogTotal, setDialogTotal] = useState<number>(100)

  const [imageData, setImageData] = useState<string | null>(null)
  const [resultData, setResultData] = useState<string | null>(null)

  const handleDataChange = (file: File[] | null) => {
    if (file) {
      const url = URL.createObjectURL(file[0])

      setImageData(url)
      setResultData(null)
    }
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = resultData!
    link.download = `removerized-${Date.now()}.png`
    link.click()
  }

  const remove = (ev: FormEvent) => {
    ev.preventDefault()

    let config: Config = {
      model: "small",
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

      imglyRemoveBackground(imageData!, config).then((blob: Blob) => {
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
    <div className="flex w-full flex-col gap-2">
      {/* Input */}
      <div
        className="mt-2 flex items-center justify-center gap-4 px-2 md:px-28"
        onSubmit={remove}
      >
        <FileUploader
          value={files}
          dropzoneOptions={{
            multiple: false,
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
              <Icons.SolarCloudUploadBoldDuotone className="size-8"></Icons.SolarCloudUploadBoldDuotone>
              <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>
                &nbsp; or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG or WEBP file
              </p>
            </div>
          </FileInput>
          <FileUploaderContent></FileUploaderContent>
        </FileUploader>
      </div>

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
          className="font-bold"
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
    </div>
  )
}
