import { useCallback, useState } from "react"

import type { DialogState } from "../types"

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useProcessingDialog
 * ───────────────────
 * Manages the state of the processing modal shown during background removal,
 * batch processing, and upscaling operations.
 *
 * Exposes a minimal API so consumers never mutate state directly:
 *  - `openDialog(text)`  → shows the modal with an initial message
 *  - `updateDialog(text, pct)` → updates message + progress while running
 *  - `closeDialog()`     → hides the modal and resets progress to 0
 *
 * Usage:
 * ```ts
 * const { dialog, openDialog, updateDialog, closeDialog } = useProcessingDialog()
 * ```
 */
export const useProcessingDialog = () => {
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    text: "",
    progress: 0,
  })

  /**
   * Opens the dialog with an initial status message.
   * Progress is reset to 0 so the spinner is shown until the first update.
   *
   * @param text - Initial message (e.g. "Starting…")
   */
  const openDialog = useCallback((text: string) => {
    setDialog({ open: true, text, progress: 0 })
  }, [])

  /**
   * Updates the dialog message and progress percentage while an operation
   * is running.  Calling this with `pct = 0` keeps the spinner visible.
   *
   * @param text - New status message to display
   * @param pct  - Progress in [0, 100]; values ≤ 0 render a spinner
   */
  const updateDialog = useCallback((text: string, pct: number) => {
    setDialog((prev) => ({ ...prev, text, progress: pct }))
  }, [])

  /**
   * Closes the dialog and resets all fields to their initial values.
   * Should always be called in a `finally` block to guarantee cleanup
   * even when an operation throws.
   */
  const closeDialog = useCallback(() => {
    setDialog({ open: false, text: "", progress: 0 })
  }, [])

  return { dialog, openDialog, updateDialog, closeDialog }
}
