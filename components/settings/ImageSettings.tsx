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
              <p>Adjust the output image quality (higher = better quality).</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Slider
          value={[settings.quality ?? 100]}
          min={10}
          max={100}
          step={10}
          onValueChange={(value) => handleChange("quality", value[0])}
        />
        <span className="text-right text-xs text-neutral-400">
          {settings.quality ?? 100}%
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
              <p>Select the output format. PNG preserves transparency.</p>
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
