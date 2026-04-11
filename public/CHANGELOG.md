# Changelog

All notable changes to this project will be documented in this file.

---

## [1.1.0] - Canvas Improvements & Colorizer

### ✨ Added

- Image colorization feature using AI models (DeOldify)
- Custom zoom controls for canvas (zoom in, zoom out, reset)
- Zoom level indicator showing current zoom percentage
- Keyboard shortcut support: Ctrl/Cmd + mouse wheel for zoom

### 🔄 Changed

- Removed react-infinite-viewer dependency
- Implemented custom canvas zoom using CSS transforms
- Canvas now centered with flexbox instead of InfiniteViewer
- Zoom range limited between 0.5x and 3x with 0.2x increments

### 🧠 Improved

- Cross-platform zoom support (Ctrl for Windows/Linux, Cmd for Mac)
- Smooth zoom transitions with CSS animations
- Better canvas performance without external viewer library

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
