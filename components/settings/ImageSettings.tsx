import { Info } from "lucide-react"

import { ImageSetting } from "@/types/image-settings"

import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Slider } from "../ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export default function ImageSettings({
  settings,
  onChange,
}: {
  settings: ImageSetting
  onChange: (newSettings: ImageSetting) => void
}) {
  const handleChange = (field: keyof ImageSetting, value: any) => {
    const updatedSettings = { ...settings, [field]: value }
    onChange(updatedSettings)
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Image Name</label>
        <Input
          disabled
          value={settings.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter image name"
        />
      </div>

      {/* Remove */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center text-sm font-medium">
          Remove
          <Tooltip>
            <TooltipTrigger>
              <Info className="ml-2 size-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Choose whether to remove the background or foreground of the
                image.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Select
          value={settings.remove || ""}
          onValueChange={(value) => handleChange("remove", value || undefined)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="background">Background</SelectItem>
            <SelectItem value="foreground">Foreground</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center text-sm font-medium">
          Model
          <Tooltip>
            <TooltipTrigger>
              <Info className="ml-2 size-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Choose the AI model:
                <ul className="mt-1 list-disc pl-4">
                  <li>
                    <b>ISNet</b>: Balanced quality and performance.
                  </li>
                  <li>
                    <b>ISNet FP16</b>: Faster processing, suitable for
                    high-performance devices.
                  </li>
                  <li>
                    <b>ISNet Quint8</b>: Optimized for resource-constrained
                    devices.
                  </li>
                </ul>
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Select
          value={settings.model}
          onValueChange={(value) => handleChange("model", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="isnet">ISNet</SelectItem>
            <SelectItem value="isnet_fp16">ISNet FP16</SelectItem>
            <SelectItem value="isnet_quint8">ISNet Quint8</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center text-sm font-medium">
          Quality
          <Tooltip>
            <TooltipTrigger>
              <Info className="ml-2 size-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Adjust the image quality (higher values mean better quality).
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Slider
          value={[settings.quality || 100]}
          min={10}
          max={100}
          step={10}
          onValueChange={(value) => handleChange("quality", value)}
        />
      </div>

      {/* Format */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center text-sm font-medium">
          Format
          <Tooltip>
            <TooltipTrigger>
              <Info className="ml-2 size-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select the output format of the image.</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Select
          value={settings.format}
          onValueChange={(value) => handleChange("format", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image/png">PNG</SelectItem>
            <SelectItem value="image/jpeg">JPEG</SelectItem>
            <SelectItem value="image/webp">WebP</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
