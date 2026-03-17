import * as ort from "onnxruntime-web"

import { INFERENCE_SIZE } from "../constants"

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
export const preprocessImage = (imgEl: HTMLImageElement): ort.Tensor => {
  const S = INFERENCE_SIZE

  // ── Offscreen canvas resize ─────────────────────────────────────────────
  const canvas = document.createElement("canvas")
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(imgEl, 0, 0, S, S)
  const { data } = ctx.getImageData(0, 0, S, S)

  // ── ImageNet normalisation constants ────────────────────────────────────
  // mean and std values are per-channel (R, G, B) as used by torchvision.
  const mean = [0.485, 0.456, 0.406]
  const std = [0.229, 0.224, 0.225]

  // ── Build CHW Float32Array ───────────────────────────────────────────────
  // Layout: all R values, then all G values, then all B values.
  // Each pixel i occupies indices i, S²+i, 2·S²+i in the output array.
  const float32 = new Float32Array(3 * S * S)

  for (let i = 0; i < S * S; i++) {
    float32[i]              = (data[i * 4]     / 255 - mean[0]) / std[0] // R
    float32[S * S + i]      = (data[i * 4 + 1] / 255 - mean[1]) / std[1] // G
    float32[S * S * 2 + i]  = (data[i * 4 + 2] / 255 - mean[2]) / std[2] // B
  }

  // ── Wrap in ort.Tensor with the expected input name shape ────────────────
  // Shape: [batch=1, channels=3, height=1024, width=1024]
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
  maskTensor: ort.Tensor,
  imgEl: HTMLImageElement
): Promise<Blob> =>
  new Promise((resolve) => {
    const ow = imgEl.naturalWidth
    const oh = imgEl.naturalHeight

    // ── Extract mask dimensions ──────────────────────────────────────────
    // The model outputs shape [1, 1, H, W]; fall back to INFERENCE_SIZE when
    // dims are unavailable (e.g. dynamic shapes).
    const mH = (maskTensor.dims[2] as number) ?? INFERENCE_SIZE
    const mW = (maskTensor.dims[3] as number) ?? INFERENCE_SIZE
    const maskData = maskTensor.data as Float32Array

    // ── Build grayscale ImageData from probability values ────────────────
    // Values outside [0, 1] are clamped before converting to uint8.
    const grayPx = new Uint8ClampedArray(mW * mH * 4)
    for (let i = 0; i < mH * mW; i++) {
      const v = Math.round(Math.max(0, Math.min(1, maskData[i])) * 255)
      grayPx[i * 4]     = v   // R
      grayPx[i * 4 + 1] = v   // G
      grayPx[i * 4 + 2] = v   // B
      grayPx[i * 4 + 3] = 255 // A (fully opaque so we can read back via getImageData)
    }

    // ── Paint mask at model output resolution ────────────────────────────
    const maskCanvas = document.createElement("canvas")
    maskCanvas.width = mW
    maskCanvas.height = mH
    maskCanvas.getContext("2d")!.putImageData(new ImageData(grayPx, mW, mH), 0, 0)

    // ── Bilinear-resize mask to original image dimensions ────────────────
    // drawImage performs bilinear interpolation automatically.
    const resCanvas = document.createElement("canvas")
    resCanvas.width = ow
    resCanvas.height = oh
    resCanvas.getContext("2d")!.drawImage(maskCanvas, 0, 0, ow, oh)
    const resizedMask = resCanvas.getContext("2d")!.getImageData(0, 0, ow, oh)

    // ── Recover original image pixels ────────────────────────────────────
    const origCanvas = document.createElement("canvas")
    origCanvas.width = ow
    origCanvas.height = oh
    const origCtx = origCanvas.getContext("2d")!
    origCtx.drawImage(imgEl, 0, 0)
    const origPx = origCtx.getImageData(0, 0, ow, oh)

    // ── Apply mask R channel as the alpha byte ───────────────────────────
    // White (255) in the mask → fully opaque foreground.
    // Black (0)   in the mask → fully transparent background.
    for (let i = 0; i < ow * oh; i++) {
      origPx.data[i * 4 + 3] = resizedMask.data[i * 4]
    }

    // ── Write result and export to PNG Blob ──────────────────────────────
    const outCanvas = document.createElement("canvas")
    outCanvas.width = ow
    outCanvas.height = oh
    outCanvas.getContext("2d")!.putImageData(origPx, 0, 0)
    outCanvas.toBlob((blob) => resolve(blob!), "image/png")
  })
