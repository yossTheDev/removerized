/**
 * Convert a Blob to a different format using Canvas
 * @param blob - The source Blob
 * @param format - Target format: 'image/jpeg', 'image/png', or 'image/webp'
 * @param quality - Quality between 0 and 1 (for JPEG/WebP)
 * @returns Promise<Blob> - The converted Blob
 */
export async function convertImageFormat(
  blob: Blob,
  format: "image/jpeg" | "image/png" | "image/webp",
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new (globalThis as any).Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = (globalThis as any).document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (convertedBlob: Blob | null) => {
          URL.revokeObjectURL(url)
          if (convertedBlob) {
            resolve(convertedBlob)
          } else {
            reject(new Error("Failed to convert image"))
          }
        },
        format,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}
