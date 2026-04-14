"use client"

import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    if (theme === "dark") {
      (globalThis as any).document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", "#0a0a0a")
    } else {
      (globalThis as any).document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", "white")
    }
  }, [theme])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-6 w-[1.3rem] dark:hidden" />
          <Moon className="hidden size-5 dark:block" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle theme</p>
      </TooltipContent>
    </Tooltip>
  )
}
