## 2025-05-15 - Keyboard Shortcuts for Editor Accessibility
**Learning:** Adding keyboard shortcuts for frequent actions (zoom, batch process) significantly improves accessibility and workflow efficiency. Informing users of these shortcuts via tooltips ensures discoverability.
**Action:** Always consider keyboard shortcuts for primary editor actions and reflect them in tooltips using the (Ctrl + [Key]) convention.

## 2025-05-15 - TypeScript & Global Event Listeners
**Learning:** In this project's Next.js setup, global event listeners should use `globalThis` instead of `window` to pass type checking. Additionally, `useEffect` hooks using non-hoisted functions (like `useCallback` results) must be placed after those functions to avoid block-scoped variable errors.
**Action:** Use `globalThis` and place shortcut hooks at the bottom of the component logic.
