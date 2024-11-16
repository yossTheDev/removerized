import { useState } from "react"
import { Info } from "lucide-react"

import { ImageSetting } from "@/types/image-settings"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectItem } from "../ui/select"
import { Slider } from "../ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export default function ImageSettings({
  settings,
  onChange,
}: {
  settings: ImageSetting
  onChange: (newSettings: ImageSetting) => void
}) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleChange = (field: keyof ImageSetting, value: any) => {
    const updatedSettings = { ...localSettings, [field]: value }
    setLocalSettings(updatedSettings)
    onChange(updatedSettings)
  }

  return (
    <div className="space-y-4 rounded-md bg-gray-100 p-4 shadow-md">
      <h2 className="text-lg font-bold">Image Settings</h2>

      {/* Name */}
      <div>
        <label className="font-medium">Image Name</label>
        <Input
          value={localSettings.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter image name"
        />
      </div>

      {/* Remove */}
      <div>
        <label className="flex items-center font-medium">
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
          value={localSettings.remove || ""}
          onValueChange={(value: any) =>
            handleChange("remove", value || undefined)
          }
        >
          <SelectItem value="">None</SelectItem>
          <SelectItem value="background">Background</SelectItem>
          <SelectItem value="foreground">Foreground</SelectItem>
        </Select>
      </div>

      {/* Model */}
      <div>
        <label className="flex items-center font-medium">
          Model
          <Tooltip>
            <TooltipTrigger>
              <Info className="ml-2 size-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select the AI model to use for image processing.</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Select
          value={localSettings.model}
          onValueChange={(value: any) => handleChange("model", value)}
        >
          <SelectItem value="isnet">ISNet</SelectItem>
          <SelectItem value="isnet_fp16">ISNet FP16</SelectItem>
          <SelectItem value="isnet_quint8">ISNet Quint8</SelectItem>
        </Select>
      </div>

      {/* Quality */}
      <div>
        <label className="flex items-center font-medium">
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
          value={[localSettings.quality || 100]}
          min={10}
          max={100}
          step={10}
          onChange={(value: any) => handleChange("quality", value)}
        />
      </div>

      {/* Format */}
      <div>
        <label className="flex items-center font-medium">
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
          value={localSettings.format}
          onValueChange={(value: any) => handleChange("format", value)}
        >
          <SelectItem value="image/png">PNG</SelectItem>
          <SelectItem value="image/jpeg">JPEG</SelectItem>
          <SelectItem value="image/webp">WebP</SelectItem>
        </Select>
      </div>

      <Button onClick={() => console.log(localSettings)}>Save Settings</Button>
    </div>
  )
}
