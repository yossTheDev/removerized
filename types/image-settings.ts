export interface ImageSetting {
    name: string
    remove?: "background" | "foreground" | undefined
    model: "isnet" | "isnet_fp16" | "isnet_quint8" | undefined,
    quality?: number;
    format: "image/png" | "image/jpeg" | "image/webp"
}