import { INFERENCE_SIZE, MODELS } from "../constants"
import type { ModelKey } from "../types"

type Ort = typeof import("onnxruntime-web")

// ── Pre-processing ────────────────────────────────────────────────────────────

/**
 * Converts an HTMLImageElement into a normalised Float32 tensor ready for the
 * ONNX background-removal model.
 *
 * Steps:
 *  1. Draw the image onto an offscreen canvas resized to INFERENCE_SIZE².
 *  2. Read the raw RGBA pixel buffer.
 *  3. Convert each channel to float, apply ImageNet mean/std normalisation.
 *  4. Arrange the result in CHW order (channel-height-width) as required by
 *     PyTorch-exported ONNX models.
 *
 * @param imgEl - The source image element (can be any natural size).
 * @returns     - An ort.Tensor with dtype "float32" and shape [1, 3, 1024, 1024].
 */
export const preprocessImage = (imgEl: any, ort: Ort) => {
  const S = INFERENCE_SIZE

  const canvas = (globalThis as any).document.createElement("canvas")
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext("2d")!

  const ratio = Math.min(S / imgEl.naturalWidth, S / imgEl.naturalHeight)
  const newW = imgEl.naturalWidth * ratio
  const newH = imgEl.naturalHeight * ratio
  const dx = (S - newW) / 2
  const dy = (S - newH) / 2

  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, S, S)
  ctx.drawImage(imgEl, dx, dy, newW, newH)

  const { data } = ctx.getImageData(0, 0, S, S)

  const float32 = new Float32Array(3 * S * S)

  for (let i = 0; i < S * S; i++) {
    float32[i] = data[i * 4] / 255
    float32[S * S + i] = data[i * 4 + 1] / 255
    float32[S * S * 2 + i] = data[i * 4 + 2] / 255
  }

  return new ort.Tensor("float32", float32, [1, 3, S, S])
}

// ── Post-processing ───────────────────────────────────────────────────────────

/**
 * Composites the model's foreground-probability mask onto the original image
 * as an alpha channel, producing a transparent PNG Blob.
 *
 * Steps:
 *  1. Read the flat Float32 mask from the output tensor (shape [1,1,H,W]).
 *  2. Clamp each value to [0, 1] and convert to uint8 grayscale ImageData.
 *  3. Paint the grayscale mask on a canvas at the model's output resolution.
 *  4. Scale the mask canvas to the original image's natural dimensions using
 *     drawImage bilinear interpolation.
 *  5. Draw the original image on a result canvas.
 *  6. For every pixel, replace the alpha byte with the corresponding mask
 *     value (R channel of the resized mask).
 *  7. Export to PNG via `canvas.toBlob`.
 *
 * @param maskTensor - The raw output tensor from session.run(), typically
 *                     shaped [1, 1, H, W] with values in [0, 1].
 * @param imgEl      - The original source image used to recover natural dimensions
 *                     and pixel data.
 * @returns          - A Promise resolving to a transparent PNG Blob.
 */
export const applyMaskAsAlpha = (
  maskTensor: any,
  imgEl: any
): Promise<Blob> =>
  new Promise((resolve) => {
    const ow = imgEl.naturalWidth
    const oh = imgEl.naturalHeight

    const mH = (maskTensor.dims[2] as number) ?? INFERENCE_SIZE
    const mW = (maskTensor.dims[3] as number) ?? INFERENCE_SIZE
    const maskData = maskTensor.data as Float32Array

    const origCanvas = (globalThis as any).document.createElement("canvas")
    origCanvas.width = ow
    origCanvas.height = oh
    const origCtx = origCanvas.getContext("2d")!
    origCtx.drawImage(imgEl, 0, 0)
    const origPx = origCtx.getImageData(0, 0, ow, oh)

    // Calculate ratio and offsets once outside the loop
    const ratio = Math.min(mW / ow, mH / oh)
    const newW = ow * ratio
    const newH = oh * ratio
    const dx = (mW - newW) / 2
    const dy = (mH - newH) / 2

    for (let i = 0; i < ow * oh; i++) {
      const x = i % ow
      const y = Math.floor(i / ow)

      const mx = Math.floor(x * ratio + dx)
      const my = Math.floor(y * ratio + dy)

      // Out of mask bounds
      if (mx < 0 || my < 0 || mx >= mW || my >= mH) {
        origPx.data[i * 4 + 3] = 0
        continue
      }

      let maskValue = maskData[my * mW + mx]

      // Apply sigmoid only if tensor contains raw logits instead of probabilities
      if (maskValue < 0 || maskValue > 1) {
        maskValue = 1 / (1 + Math.exp(-maskValue))
      }

      // Smooth alpha blending
      origPx.data[i * 4 + 3] = Math.round(maskValue * 255)
    }

    const outCanvas = (globalThis as any).document.createElement("canvas")
    outCanvas.width = ow
    outCanvas.height = oh
    outCanvas.getContext("2d")!.putImageData(origPx, 0, 0)
    outCanvas.toBlob((blob: any) => resolve(blob!), "image/png")
  })

/**
 * Prepares a tensor for Image-to-Image models (Upscaler, Colorizer).
 */
export const preprocessImageToImage = (
  imgEl: any,
  ort: Ort,
  size: number = 512,
  options: {
    keepAspectRatio?: boolean
    grayscale?: boolean
    useByteRange?: boolean
  } = {}
) => {
  const { keepAspectRatio = false, grayscale = false, useByteRange = false } =
    options

  let width = size
  let height = size
  let drawWidth = width
  let drawHeight = height
  let offsetX = 0
  let offsetY = 0

  if (keepAspectRatio) {
    const originalWidth = imgEl.naturalWidth
    const originalHeight = imgEl.naturalHeight
    const ratio = Math.min(size / originalWidth, size / originalHeight)

    drawWidth = Math.max(1, Math.round(originalWidth * ratio))
    drawHeight = Math.max(1, Math.round(originalHeight * ratio))
    offsetX = Math.round((width - drawWidth) / 2)
    offsetY = Math.round((height - drawHeight) / 2)
  }

  const canvas = (globalThis as any).document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(imgEl, offsetX, offsetY, drawWidth, drawHeight)

  const { data } = ctx.getImageData(0, 0, width, height)
  const float32 = new Float32Array(3 * width * height)

  for (let i = 0; i < width * height; i++) {
    let r = data[i * 4]
    let g = data[i * 4 + 1]
    let b = data[i * 4 + 2]

    if (grayscale) {
      // Standard luminance weights: 0.299R + 0.587G + 0.114B
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      r = g = b = gray
    }

    if (useByteRange) {
      float32[i] = r
      float32[width * height + i] = g
      float32[width * height * 2 + i] = b
      continue
    }

    float32[i] = r / 255
    float32[width * height + i] = g / 255
    float32[width * height * 2 + i] = b / 255
  }

  return new ort.Tensor("float32", float32, [1, 3, height, width])
}

/**
 * Converts a [1, 3, H, W] tensor back into a PNG Blob.
 */
export const tensorToImageData = (
  tensor: any,
  width: number,
  height: number,
  options: { valueMode?: "unit" | "byte" } = {}
): Promise<Blob> =>
  new Promise((resolve) => {
    const { valueMode = "unit" } = options
    const canvas = (globalThis as any).document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    const imageData = ctx.createImageData(width, height)

    const data = tensor.data as Float32Array
    const size = width * height
    const scale = valueMode === "byte" ? 1 : 255

    for (let i = 0; i < size; i++) {
      imageData.data[i * 4] = Math.max(0, Math.min(255, data[i] * scale))
      imageData.data[i * 4 + 1] = Math.max(
        0,
        Math.min(255, data[size + i] * scale)
      )
      imageData.data[i * 4 + 2] = Math.max(
        0,
        Math.min(255, data[size * 2 + i] * scale)
      )
      imageData.data[i * 4 + 3] = 255
    }

    ctx.putImageData(imageData, 0, 0)
    canvas.toBlob((blob: any) => resolve(blob!), "image/png")
  })

/**
 * Reuses the model output as low-resolution chroma and keeps the original
 * image luminance/detail. This mirrors how other DeOldify integrations avoid
 * mushy results on non-square images.
 */
export const applyColorizerChromaToOriginal = (
  tensor: any,
  imgEl: any
): Promise<Blob> =>
  new Promise((resolve) => {
    const ow = imgEl.naturalWidth
    const oh = imgEl.naturalHeight

    const tH = Number(tensor.dims[2]) || oh
    const tW = Number(tensor.dims[3]) || ow

    const colorCanvas = (globalThis as any).document.createElement("canvas")
    colorCanvas.width = tW
    colorCanvas.height = tH
    const colorCtx = colorCanvas.getContext("2d")!
    const colorImageData = colorCtx.createImageData(tW, tH)
    const data = tensor.data as Float32Array
    const size = tW * tH

    for (let i = 0; i < size; i++) {
      colorImageData.data[i * 4] = Math.max(0, Math.min(255, data[i]))
      colorImageData.data[i * 4 + 1] = Math.max(
        0,
        Math.min(255, data[size + i])
      )
      colorImageData.data[i * 4 + 2] = Math.max(
        0,
        Math.min(255, data[size * 2 + i])
      )
      colorImageData.data[i * 4 + 3] = 255
    }
    colorCtx.putImageData(colorImageData, 0, 0)

    const outCanvas = (globalThis as any).document.createElement("canvas")
    outCanvas.width = ow
    outCanvas.height = oh
    const outCtx = outCanvas.getContext("2d")!
    const ratio = Math.min(tW / ow, tH / oh)
    const contentWidth = Math.max(1, Math.round(ow * ratio))
    const contentHeight = Math.max(1, Math.round(oh * ratio))
    const cropX = Math.max(0, Math.round((tW - contentWidth) / 2))
    const cropY = Math.max(0, Math.round((tH - contentHeight) / 2))

    const resizedColorCanvas = (globalThis as any).document.createElement(
      "canvas"
    )
    resizedColorCanvas.width = ow
    resizedColorCanvas.height = oh
    const resizedColorCtx = resizedColorCanvas.getContext("2d")!
    resizedColorCtx.imageSmoothingEnabled = true
    ;(resizedColorCtx as any).imageSmoothingQuality = "high"
    resizedColorCtx.drawImage(
      colorCanvas,
      cropX,
      cropY,
      contentWidth,
      contentHeight,
      0,
      0,
      ow,
      oh
    )

    // Slightly blur only the chroma source to reduce blockiness from 256x256 inference.
    const blurredColorCanvas = (globalThis as any).document.createElement(
      "canvas"
    )
    blurredColorCanvas.width = ow
    blurredColorCanvas.height = oh
    const blurredColorCtx = blurredColorCanvas.getContext("2d")!
    blurredColorCtx.filter = "blur(1.25px)"
    blurredColorCtx.drawImage(resizedColorCanvas, 0, 0)

    // Start from the original image so all fine luminance detail remains intact.
    outCtx.drawImage(imgEl, 0, 0, ow, oh)
    outCtx.globalCompositeOperation = "color"
    outCtx.drawImage(blurredColorCanvas, 0, 0, ow, oh)
    outCtx.globalCompositeOperation = "source-over"

    outCanvas.toBlob((blob: any) => resolve(blob!), "image/png")
  })
