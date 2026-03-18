/**
 * image-utils.ts
 * ──────────────
 * Pure browser-side image helper functions.
 * None of these functions have side-effects beyond DOM canvas operations.
 */

// ── Image loading ─────────────────────────────────────────────────────────────

/**
 * Loads a URL (object URL, data URL, or remote URL) into an HTMLImageElement.
 * Sets `crossOrigin = "anonymous"` so the element can be drawn onto a canvas
 * without tainting it (required for getImageData).
 *
 * @param src - Any URL resolvable by the browser (blob:, data:, https:, …).
 * @returns   - Resolved HTMLImageElement with `naturalWidth` / `naturalHeight` set.
 */
export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

// ── Blob / base64 conversions ─────────────────────────────────────────────────

/**
 * Converts a base64 data URL (e.g. `data:image/png;base64,…`) into a Blob.
 * Useful when a canvas or third-party function returns a data URL but the
 * rest of the pipeline expects a Blob / object URL.
 *
 * @param base64 - A full data URL string including the MIME prefix.
 * @returns      - A typed Blob with the MIME type extracted from the header.
 */
export const base64ToBlob = (base64: string): Blob => {
  const [header, data] = base64.split(";base64,")
  const contentType = header.split(":")[1]
  const raw = atob(data)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return new Blob([arr], { type: contentType })
}

// ── Canvas compositing ────────────────────────────────────────────────────────

/**
 * Composites a transparent PNG (given as any URL) onto a solid colour
 * background and returns the result as a base64 data URL.
 *
 * The operation is:
 *  1. Fill the canvas with `color`.
 *  2. Draw the source image on top (alpha compositing via `source-over`).
 *  3. Export the canvas as `image/png`.
 *
 * This is used after background removal to replace transparency with a
 * user-chosen solid colour.
 *
 * @param src   - URL of the source image (blob:, data:, https:, …).
 * @param color - Any CSS colour string accepted by `fillStyle` (e.g. "#ff0000").
 * @returns     - A PNG data URL with the colour background applied.
 */
export const compositeOnColor = (src: string, color: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      // Fill solid background first, then paint the transparent image on top
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/png"))
    }
    img.src = src
  })
