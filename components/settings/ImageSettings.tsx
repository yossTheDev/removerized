import { Download, Info } from "lucide-react"

import { ImageSetting } from "@/types/image-settings"

import { Button } from "../ui/button"
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

interface ImageSettingsProps {
  settings: ImageSetting
  onChange: (newSettings: ImageSetting) => void
  onDownload?: () => void
}

export default function ImageSettings({
  settings,
  onChange,
  onDownload,
}: ImageSettingsProps) {
  const handleChange = (field: keyof ImageSetting, value: unknown) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Image Name</label>
        <Input disabled value={settings.name} placeholder="Image name" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center text-sm font-medium">
          Quality
          <Tooltip>
            <TooltipTrigger>
              <Info className="ml-2 size-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust the output image quality (higher = better quality, larger file size).</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Slider
          value={[settings.quality ?? 80]}
          min={50}
          max={100}
          step={5}
          onValueChange={(value) => handleChange("quality", value[0])}
        />
        <span className="text-right text-xs text-neutral-400">
          {settings.quality ?? 80}%
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center text-sm font-medium">
          Format
          <Tooltip>
            <TooltipTrigger>
              <Info className="ml-2 size-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select the output format. WebP is recommended for best compression.</p>
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
            <SelectItem value="image/webp">WebP (Recommended)</SelectItem>
            <SelectItem value="image/png">PNG</SelectItem>
            <SelectItem value="image/jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onDownload && (
        <Button
          onClick={onDownload}
          className="w-full bg-white/10 hover:bg-white/15 text-white border-white/20 hover:border-white/30"
          variant="outline"
        >
          <Download className="mr-2 size-4" />
          Download this image
        </Button>
      )}
    </div>
  )
}
