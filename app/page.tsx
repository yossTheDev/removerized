"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import imglyRemoveBackground, { Config } from "@imgly/background-removal"
import { Download, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"

export default function IndexPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [dialogText, setDialogText] = useState<string>("null")
  const [dialogProgress, setDialogProgress] = useState<number>(0)
  const [dialogTotal, setDialogTotal] = useState<number>(100)

  const [imageData, setImageData] = useState<string | null>(null)
  const [resultData, setResultData] = useState<string | null>(null)

  const handleDataChange = (e: any) => {
    const file = e.target.files[0]
    const url = URL.createObjectURL(file)

    if (file) setImageData(url)
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = resultData!
    link.download = resultData!
    link.click()
  }

  const remove = (ev: FormEvent) => {
    ev.preventDefault()
    let config: Config = {
      debug: true,
      publicPath: "http://localhost:3000/ai-data/", // path to the wasm files
      progress: (key, current, total) => {
        console.log(`Downloading ${key}: ${current} of ${total}`)
        setShowDialog(true)
        setDialogProgress(current)
        setDialogTotal(total)
        setDialogText(key)

        if (current === total && key === "compute:inference")
          setShowDialog(false)
      },
    }

    if (imageData) {
      imglyRemoveBackground(imageData!, config).then((blob: Blob) => {
        // result is a blob encoded as PNG.
        // It can be converted to an URL to be used as HTMLImage.src
        const url = URL.createObjectURL(blob)

        setResultData(url)
      })
    }
  }

  return (
    <section className="container flex h-full flex-col gap-2 pb-8">
      {/* Form */}
      <form className="flex items-center gap-4" onSubmit={remove}>
        <p>Select Image</p>
        <ImageIcon></ImageIcon>
        <Input
          accept="image/*"
          required
          type="file"
          onChange={handleDataChange}
        ></Input>
        <Button disabled={!imageData} type="submit">
          <Icons.SolarEraserBoldDuotone className="mr-2 size-5"></Icons.SolarEraserBoldDuotone>
          Process
        </Button>
      </form>

      {/* Images */}
      <div className="flex size-full items-center justify-center gap-16  p-4">
        {imageData ? (
          <Image
            width={300}
            height={150}
            className="max-w-96 rounded-xl transition-all hover:ring-4 hover:ring-primary"
            src={imageData}
            alt="Selected image"
          />
        ) : (
          <div className="flex h-48 w-96 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-900">
            <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-500"></Icons.SolarGalleryBoldDuotone>
          </div>
        )}
        {resultData ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Image
              width={300}
              height={150}
              className="max-w-96 rounded-xl transition-all hover:ring-4 hover:ring-primary"
              src={resultData}
              alt="Processed image"
            />
          </div>
        ) : (
          <div className="flex h-48  w-96 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-900">
            <Icons.SolarGalleryBoldDuotone className="size-16 text-neutral-500"></Icons.SolarGalleryBoldDuotone>
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="flex items-center justify-center">
        <Button
          disabled={!resultData}
          className="font-bold"
          onClick={handleDownload}
        >
          <Icons.SolarDownloadMinimalisticBoldDuotone className="mr-2 size-5"></Icons.SolarDownloadMinimalisticBoldDuotone>
          Download
        </Button>
      </div>

      <Dialog open={showDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              <p>{dialogText}</p>
              <Progress max={dialogTotal} value={dialogProgress}></Progress>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  )
}
