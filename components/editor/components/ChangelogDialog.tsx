"use client"

import { useEffect, useState } from "react"
import { Github } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const GITHUB_URL = "https://github.com/yossTheDev/removerized"

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium text-white/90 mb-2 mt-4">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-white/70 mb-3 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1.5 mb-4 text-white/70 ml-2">
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li className="text-white/70">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-white/20 pl-4 py-2 my-4 bg-white/[0.03] rounded-r text-white/60 italic">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-white/10" />
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
}

interface ChangelogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: string
  accentColor: string
}

export const ChangelogDialog = ({
  open,
  onOpenChange,
  version,
  accentColor,
}: ChangelogDialogProps) => {
  const [changelogContent, setChangelogContent] = useState<string>("")

  useEffect(() => {
    if (open && !changelogContent) {
      fetch("/CHANGELOG.md")
        .then((res) => res.text())
        .then((text) => setChangelogContent(text))
        .catch((err) => console.error("Failed to load changelog:", err))
    }
  }, [open, changelogContent])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border flex flex-col overflow-x-hidden border-white/10 bg-[#0a0a0a]/95 text-white shadow-2xl backdrop-blur-2xl sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-white flex items-center justify-between">
            <span>Changelog</span>
            <span
              className="ml-2 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                backgroundColor: `${accentColor}25`,
                color: accentColor,
              }}
            >
              v{version}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="prose prose-invert prose-sm max-w-none">
            {changelogContent ? (
              <ReactMarkdown components={markdownComponents}>
                {changelogContent}
              </ReactMarkdown>
            ) : (
              <p className="text-white/50">Loading changelog...</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <Button
            asChild
            variant="outline"
            className="w-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
          >
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Github className="size-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
