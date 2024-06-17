"use client"

import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export const ThemeToggleSheet: React.FC = () => {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    if (theme === "dark") {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", "#0a0a0a")
    } else {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", "white")
    }
  }, [theme])

  return (
    <Button
      className="flex w-full items-center justify-center gap-2 text-muted-foreground"
      variant="ghost"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-6 w-[1.3rem] dark:hidden" />
      <Moon className="hidden size-5 dark:block" />
      <span>Toggle theme</span>
    </Button>
  )
}
