"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Loader } from "@/components/loader"

import type { DialogState } from "../types"

// ── Props ─────────────────────────────────────────────────────────────────────

interface EditorProcessingDialogProps {
  /** All dialog display state managed by useProcessingDialog */
  dialog: DialogState
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * EditorProcessingDialog
 * ──────────────────────
 * Full-screen blocking modal shown during background removal, batch processing,
 * and upscaling operations.
 *
 * Rendering rules:
 *  - When `dialog.progress === 0` a spinner (Loader) is shown — the operation
 *    has started but no measurable progress is available yet.
 *  - When `dialog.progress > 0` a determinate Progress bar is rendered along
 *    with the numeric percentage.
 *
 * The dialog is non-dismissable (no close button / overlay click) to prevent
 * the user from interrupting a long-running WASM inference operation mid-way.
 */
export const EditorProcessingDialog = ({
  dialog,
}: EditorProcessingDialogProps) => {
  return (
    <AlertDialog open={dialog.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Processing</AlertDialogTitle>

          <AlertDialogDescription className="flex flex-col gap-3">
            {/* Current operation description */}
            <p className="text-sm">{dialog.text}</p>

            {/*
             * Progress indicator:
             *   - Indeterminate spinner while progress === 0 (session init, inference start…)
             *   - Determinate bar once byte-level or patch-level progress is available
             */}
            {dialog.progress > 0 ? (
              <div className="flex flex-col gap-1">
                <Progress value={dialog.progress} />
                <span className="text-right text-xs text-neutral-400">
                  {dialog.progress}%
                </span>
              </div>
            ) : (
              <Loader />
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
