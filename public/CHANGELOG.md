# Changelog

All notable changes to this project will be documented in this file.

---

## [1.1.3] - 2025-05-14
### Added
- 🎨 **Palette**: Added Ctrl+S keyboard shortcut for downloading results.
- 🎨 **Palette**: Enhanced focus visibility for core interactive elements (tab switcher, model selector, background toggle).
- [Technical note: Updated Tooltip hints and added focus-visible rings for better accessibility].

## [1.1.2] - 2025-03-24
### Added
- 🎨 **Palette**: Added keyboard shortcuts and tooltip hints for core editor actions.
- [Technical note: Added support for Ctrl/Cmd +, -, 0, and Enter shortcuts in the editor].

## [1.1.1] - Some Stability Fixes

### 🐛 Fixed

- Fixed an issue where Upscaler could hang indefinitely during model download when the network stalled.
- Fixed an issue where Upscaler could remain stuck during ONNX session creation or inference without timing out.
- Added timeout and abort handling for model download, model stream reads, session initialization, and inference execution.

### 🔄 Changed

- Changed the default remover model to `ormbg_quantized`.
- Updated BiRefNet Lite model URLs to use the new `BiRefNet_lite-ONNX` repository from ONNX Community.
- Renamed `birefnet_lite_quantized` to `birefnet_lite` (FP32) with updated size (224 MB) and description for standard precision without fidelity loss.

### 🧠 Improved

- Add border to image settings panel for better component organization
- Optimized image compression by switching from PNG to WebP format for all processed images. This significantly reduces file sizes while maintaining visual quality, especially for images with transparency.
- Made WebP the default export format for new images.
- Moved quality control to per-image settings via ImageSettings component, allowing individual quality adjustment per image instead of global quality.
- Quality slider now appears in ImageSettings panel with range 50-100% and default 80%.
- Download button now performs real format conversion using Canvas, converting images to their configured format (WebP, PNG, or JPEG) at download time with their individual quality settings.
- Added individual download button in ImageSettings panel to download specific image with its configured format and quality.
- Download button tooltip updated to "Download all images" to reflect mass download functionality.
- ImageSettings now available in all tool tabs (Remover, Colorizer, Upscaler) for consistent per-image configuration.
- Image processing now uses standard quality (85%) independent of per-image settings. Settings (format and quality) are only applied at download time for maximum flexibility.

### 🐛 Fixed

- Fixed bug where changing image settings in Colorizer or Upscaler tabs would cause the processed result to disappear from the canvas. This was caused by a useEffect dependency on settings array that incorrectly cleared resultData.

---

## [1.1.0] - Canvas Improvements & Colorizer & PWA

### ✨ Added

- Image colorization feature using AI models (DeOldify)
- Custom zoom controls for canvas (zoom in, zoom out, reset)
- Zoom level indicator showing current zoom percentage
- Keyboard shortcut support: Ctrl/Cmd + mouse wheel for zoom
- Floating version button on canvas that displays changelog dialog
- Changelog dialog with GitHub link button
- Dynamic CHANGELOG loading from public folder using fetch
- Progressive Web App (PWA) support with Serwist and Turbopack
- PWA install button on canvas (shows when app can be installed)
- Service worker for offline functionality
- Web app manifest with proper icon configuration

### 🔄 Changed

- Removed react-infinite-viewer dependency
- Implemented custom canvas zoom using CSS transforms
- Canvas now centered with flexbox instead of InfiniteViewer
- Zoom range limited between 0.5x and 3x with 0.2x increments
- Canvas now adapts to image aspect ratio instead of forcing rectangular shape
- Canvas dimensions limited to max 800x600 for very large images

### 🧠 Improved

- Cross-platform zoom support (Ctrl for Windows/Linux, Cmd for Mac)
- Smooth zoom transitions with CSS animations
- Better canvas performance without external viewer library
- Smooth transitions for canvas dimension changes
- React-markdown configured with custom components for better changelog rendering

---

## [1.0.0] - Stable Release

> ⚠️ From this version forward, the changelog begins official tracking.
> Removerized has gone through multiple stages prior to this release — including early open-source iterations and an experimental SaaS direction.
> Version 1.0.0 represents the first stable definition of the project as a **local-first, open-source AI image toolkit**.

---

### ✨ Added

- Background removal using multiple AI models (ONNX Runtime Web)
- Image upscaling feature
- Batch processing system
- Model selection interface (user can choose processing model)
- IndexedDB model caching for offline reuse
- Fully client-side processing (no backend)
- Offline support after initial load
- Interactive before/after comparison slider
- Queue system with preview thumbnails
- Export options (PNG with transparency)
- Modern UI with shadcn/ui + Tailwind CSS

---

### 🧠 Improved

- Performance optimizations for ONNX inference in the browser
- Memory handling for large image processing
- UX improvements in processing flow and controls
- Model loading and caching strategy
- Overall UI consistency and responsiveness

---

### 🔄 Changed

- Project direction finalized as **open-source, local-first tool**
- Removed dependency on external background removal libraries
- Reworked internal processing pipeline to support multiple models
- Improved architecture for scalability and future features

---

### ❌ Removed

- Legacy implementation based on external libraries
- Previous SaaS-oriented structure and constraints
- Any server-side dependencies or processing

---

### 🚀 Notes

This release marks a key milestone:
- Stable foundation
- Clear product vision
- Ready for expansion (colorization, restoration, captioning, PWA, extension)

---
