import { Tensor } from "onnxruntime-web"

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
  size: number = 512
) => {
  const canvas = (globalThis as any).document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!

  ctx.drawImage(imgEl, 0, 0, size, size)

  const { data } = ctx.getImageData(0, 0, size, size)
  const float32 = new Float32Array(3 * size * size)

  for (let i = 0; i < size * size; i++) {
    float32[i] = data[i * 4] / 255
    float32[size * size + i] = data[i * 4 + 1] / 255
    float32[size * size * 2 + i] = data[i * 4 + 2] / 255
  }

  return new ort.Tensor("float32", float32, [1, 3, size, size])
}

/**
 * Converts a [1, 3, H, W] tensor back into a PNG Blob.
 */
export const tensorToImageData = (
  tensor: any,
  width: number,
  height: number
): Promise<Blob> =>
  new Promise((resolve) => {
    const canvas = (globalThis as any).document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    const imageData = ctx.createImageData(width, height)

    const data = tensor.data as Float32Array
    const size = width * height

    for (let i = 0; i < size; i++) {
      imageData.data[i * 4] = Math.max(0, Math.min(255, data[i] * 255))
      imageData.data[i * 4 + 1] = Math.max(
        0,
        Math.min(255, data[size + i] * 255)
      )
      imageData.data[i * 4 + 2] = Math.max(
        0,
        Math.min(255, data[size * 2 + i] * 255)
      )
      imageData.data[i * 4 + 3] = 255
    }

    ctx.putImageData(imageData, 0, 0)
    canvas.toBlob((blob: any) => resolve(blob!), "image/png")
  })
