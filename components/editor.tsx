/* eslint-disable @next/next/no-img-element */
"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Config,
  removeBackground,
  removeForeground,
} from "@imgly/background-removal"
import { sendGAEvent } from "@next/third-parties/google"
import {
  Download,
  Layers,
  LoaderIcon,
  ScanEye,
  Settings,
  Trash,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { ReactCompareSlider } from "react-compare-slider"
import DustEffect from "react-dust-effect"
import InfiniteViewer from "react-infinite-viewer"
import { toast } from "sonner"

import { ImageSetting } from "@/types/image-settings"
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

import AdBanner from "./ads/ad-banner"
import ImageSettings from "./settings/ImageSettings"
import { ThemeToggle } from "./theme-toggle"

export const Editor = () => {
  const editor = useRef<InfiniteViewer>(null)
  const [show, setShow] = useState(false)

  const [files, setFiles] = useState<File[] | null>([])
  const [settings, setSettings] = useState<ImageSetting[]>([])

  const [showDialog, setShowDialog] = useState(false)
  const [dialogText, setDialogText] = useState<string>("null")
  const [dialogProgress, setDialogProgress] = useState<number>(0)
  const [dialogTotal, setDialogTotal] = useState<number>(100)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [localSettings, setLocalSettings] = useState<ImageSetting | null>(null)

  const [imageData, setImageData] = useState<string | null>(null)
  const [resultData, setResultData] = useState<string | null>(null)
  const [resultsData, setResultsData] = useState<
    { data: Blob; name: string }[]
  >([])

  const handleDataChange = (_files: File[] | null) => {
    if (_files) {
      const duplicateFiles: string[] = []
      const newSettings = _files.reduce((acc: ImageSetting[], file) => {
        const exists = settings.some((item) => item.name === file.name)

        if (exists) {
          duplicateFiles.push(file.name)
          return acc
        }

        acc.push({
          format: "image/png",
          model: "isnet",
          name: file.name,
          quality: 100,
          remove: "background",
        })

        return acc
      }, [])

      if (duplicateFiles.length === _files.length) {
        toast(`All selected files already exist: ${duplicateFiles.join(", ")}`)
      }

      if (newSettings.length > 0) {
        setSettings((prevSettings) => [...prevSettings, ...newSettings])
      }

      const newFiles = _files.filter(
        (file) => !settings.some((item) => item.name === file.name)
      )
      if (newFiles.length > 0) {
        setFiles((prevFiles) => [...prevFiles!, ...newFiles])
      }

      const lastFile = _files[_files.length - 1]
      if (lastFile) {
        const url = URL.createObjectURL(lastFile)
        setSelectedImage(lastFile.name)
        setImageData(url)
        setResultData(null)
      }
    }
  }

  const handleDownload = () => {
    const link = document.createElement("a")

    const result = resultsData.find((item) => item.name === selectedImage)

    if (result) {
      const url = URL.createObjectURL(result?.data)

      link.href = url
      link.download = `removerized-${Date.now()}.png`
      link.click()
    }
  }

  const handleRemoveFile = (file: File) => {
    const filtered = files?.filter((_file) => _file?.name !== file.name)
    const filteredSettings = settings?.filter(
      (_setting) => _setting?.name !== file.name
    )
    setFiles(filtered!)
    setSettings(filteredSettings!)
  }

  const handleChangeImage = (url: string, name: string) => {
    setSelectedImage(name)
    setImageData(url)

    const r = resultsData.find((item) => item.name === name)

    console.log(r)

    if (r) {
      const resultUrl = URL.createObjectURL(r.data)
      setResultData(resultUrl)
    } else {
      setResultData(null)
    }
  }

  const remove = (ev: FormEvent) => {
    ev.preventDefault()

    let config: Config = {
      model: "isnet",
      debug: true,
      //publicPath: "http://localhost:3000/ai-data/", // path to the wasm files
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

  const process = async () => {
    const start = performance.now()

    setDialogText("Starting...")
    setShowDialog(true)

    for (const setting of settings) {
      const _image = files?.find((item) => item.name === setting.name)
      let result

      setDialogText(`Processing: ${setting.name.slice(0, 25)}`)
      if (setting.remove === "background") {
        result = await removeBackground(_image!, {
          model: setting.model,
          output: { format: setting.format, quality: setting.quality },
          progress: (key, current, total) => {
            setDialogProgress(current)
            setDialogTotal(total)
            setDialogText(key)

            if (key.includes("fetch:"))
              setDialogText(
                "Downloading AI models. This was a little while ago the first time..."
              )
            if (key === "compute:inference")
              setDialogText(`Processing image...${setting.name}`)
          },
        })
      } else {
        result = await removeForeground(_image!, {
          model: setting.model,
          output: { format: setting.format, quality: setting.quality },
          progress: (key, current, total) => {
            setDialogProgress(current)
            setDialogTotal(total)
            setDialogText(key)

            if (key.includes("fetch:"))
              setDialogText(
                "Downloading AI models. This was a little while ago the first time..."
              )
            if (key === "compute:inference")
              setDialogText(`Processing image...${setting.name}`)
          },
        })
      }

      setResultsData([...resultsData, { data: result, name: setting.name }])

      sendGAEvent({ event: "remove-background", value: "success" })
      const url = URL.createObjectURL(result)
      setResultData(url)
      setShow(true)

      setTimeout(() => {
        setShow(false)
      }, 100)
    }

    /* Calculate processing time */
    const end = performance.now()
    const time = end - start
    toast.success(`🚀 Successful operation in  ${Math.floor(time / 1000)} s`)
    setShowDialog(false)
  }

  useEffect(() => {
    setLocalSettings(settings.find((item) => item.name === selectedImage!)!)

    const r = resultsData.find((item) => item.name === selectedImage)

    console.log(r)

    if (r) {
      const resultUrl = URL.createObjectURL(r.data)
      setResultData(resultUrl)
    } else {
      setResultData(null)
    }
  }, [resultsData, selectedImage, settings])

  return (
    <>
      <InfiniteViewer
        ref={editor}
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
          <div className="rounded-2xl p-4">
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
                      <div className="flex h-80 w-[36rem] items-center justify-center rounded-xl bg-neutral-400 dark:bg-neutral-900">
                        <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-700"></Icons.SolarGalleryBoldDuotone>
                      </div>
                    )}
                  </>
                }
                itemTwo={
                  <>
                    {resultData ? (
                      <div className="relative flex flex-col items-center justify-center gap-2 rounded-xl bg-neutral-500 dark:bg-neutral-900">
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
                      <div className="flex size-full items-center justify-center rounded-xl bg-neutral-400 dark:bg-neutral-900">
                        <div className="grid-pattern flex size-full items-center justify-center">
                          <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-700"></Icons.SolarGalleryBoldDuotone>
                        </div>
                      </div>
                    )}
                  </>
                }
              ></ReactCompareSlider>
            </div>
          </div>
        </div>
      </InfiniteViewer>

      {/* Tools */}
      <div className="pointer-events-none absolute z-20 h-screen w-screen">
        {/* Bottom Bar */}
        <div className="pointer-events-none absolute z-20 flex h-screen w-screen items-center justify-center">
          <div className="pointer-events-auto  mb-10 mt-auto flex h-fit gap-2 rounded-md bg-white px-4 py-2 backdrop-blur-3xl dark:bg-neutral-900/80">
            <div className="my-auto flex items-center">
              <Icons.logo className="size-8 text-[#FF2587]"></Icons.logo>
            </div>

            <Button onClick={process} size={"icon"} variant={"ghost"}>
              <LoaderIcon></LoaderIcon>
            </Button>

            <div className="my-auto rounded-full bg-neutral-950/40 p-1"></div>

            <Button
              disabled={
                !resultsData.find((item) => item.name === selectedImage)
              }
              onClick={handleDownload}
              size={"icon"}
              variant={"ghost"}
            >
              <Download></Download>
            </Button>

            <Button
              onClick={() =>
                editor.current?.setZoom(editor.current.getZoom() + 0.2)
              }
              size={"icon"}
              variant={"ghost"}
            >
              <ZoomIn></ZoomIn>
            </Button>

            <Button
              onClick={() =>
                editor.current?.setZoom(editor.current.getZoom() - 0.2)
              }
              size={"icon"}
              variant={"ghost"}
            >
              <ZoomOut></ZoomOut>
            </Button>

            <Button
              onClick={() => {
                editor.current?.setZoom(1)
                editor.current?.scrollCenter()
              }}
              size={"icon"}
              variant={"ghost"}
            >
              <ScanEye></ScanEye>
            </Button>

            <div className="my-auto rounded-full bg-neutral-950/40 p-1"></div>

            <ThemeToggle />
          </div>
        </div>

        {/* Settings Bars */}
        <div className="pointer-events-none flex h-screen w-screen">
          <div className="pointer-events-none flex w-full items-center p-4">
            {/* Image Settings */}
            <div className="pointer-events-auto h-fit w-[21rem] rounded-md bg-white p-4 backdrop-blur-3xl transition-all dark:bg-neutral-900/80">
              <div className="flex justify-center gap-2 p-2">
                <Settings className="size-4"></Settings>
                <span className="text-sm font-semibold">Settings</span>
              </div>

              {localSettings ? (
                <ImageSettings
                  settings={localSettings}
                  onChange={(_setting) => {
                    setLocalSettings(_setting)

                    const newSettings = settings.map((item) =>
                      item.name !== selectedImage ? item : _setting
                    )

                    setSettings(newSettings)
                  }}
                ></ImageSettings>
              ) : (
                <p className="mt-2 text-center text-sm text-neutral-400">
                  Select an image to edit
                </p>
              )}

              <AdBanner></AdBanner>
            </div>

            {/* Image Queue */}
            <div className="pointer-events-auto ml-auto h-fit w-60 rounded-md bg-white p-4 backdrop-blur-3xl transition-all dark:bg-neutral-900/80">
              <div className="flex justify-center gap-2 p-2">
                <Layers className="size-4"></Layers>
                <span className="text-sm font-semibold">Queue</span>

                {files?.length! > 0 && (
                  <span className="tezxt flex items-center justify-center  rounded-xl bg-red-600 px-2 text-xs font-semibold text-white">
                    {files?.length}
                  </span>
                )}
              </div>
              {/* Input */}
              <div onSubmit={remove}>
                <FileUploader
                  value={files}
                  dropzoneOptions={{
                    maxFiles: 10,
                    accept: {
                      "image/png": [".png"],
                      "image/jpg": [".jpg", ".jpeg"],
                      "image/webp": [".webp"],
                    },
                  }}
                  onValueChange={handleDataChange}
                  className="relative max-w-xs space-y-1 rounded-xl bg-neutral-300 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-900"
                >
                  <FileInput>
                    <Icons.SolarCloudUploadBoldDuotone className="mx-auto my-8 size-10 text-neutral-700 dark:text-neutral-400"></Icons.SolarCloudUploadBoldDuotone>
                  </FileInput>
                  <FileUploaderContent></FileUploaderContent>
                </FileUploader>
              </div>

              {/* Images List */}
              <div className="mt-4 flex h-fit max-h-80 flex-col gap-4 overflow-x-hidden overflow-y-scroll">
                {files?.map((file, index) => {
                  const url = URL.createObjectURL(file)

                  return (
                    <div className="group relative h-32 cursor-pointer rounded border-2 border-neutral-900 bg-slate-500 object-cover transition-all dark:border-neutral-300">
                      <img
                        key={`image-${index}`}
                        className="h-32 w-full object-cover"
                        alt={`image-${index}`}
                        src={url}
                        onClick={() => {
                          handleChangeImage(url, file.name)
                        }}
                      ></img>

                      <Button
                        onClick={() => {
                          handleRemoveFile(file)
                        }}
                        className="absolute left-1 top-1 rounded-full bg-neutral-800 text-neutral-100 opacity-0 transition-all group-hover:opacity-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950"
                        variant={"ghost"}
                        size={"icon"}
                      >
                        <Trash></Trash>
                      </Button>
                    </div>
                  )
                })}
              </div>

              {/* Clear Queue */}
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setFiles([])
                    setSettings([])
                    setSelectedImage(null)
                    setLocalSettings(null)
                    setImageData(null)
                  }}
                  disabled={files?.length! === 0}
                  className=""
                  variant={"surface"}
                >
                  <Trash className="mr-2 size-4"></Trash>
                  Clear Queue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Dialog */}
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
