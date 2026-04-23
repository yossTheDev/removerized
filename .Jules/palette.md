# Palette's Journal - Removerized

## 2025-05-15 - [Keyboard Shortcut Hints]
**Learning:** In highly interactive, tool-based interfaces (like image editors), users often transition from casual mouse-driven exploration to power-user workflows. Adding keyboard shortcuts without visual hints leads to low discoverability. Including hints in parentheses within tooltips (e.g., 'Zoom In (Ctrl +)') provides an immediate, low-friction learning path.
**Action:** Always pair global keyboard listeners with visual shortcut hints in associated Tooltips or Labels to maximize feature adoption and UX delight.

## 2025-05-15 - [Accessibility & Event Bubbling]
**Learning:** When adding global keyboard listeners in React components, ensure that input fields or other interactive elements (like text areas) are handled to prevent shortcuts from triggering while a user is typing. Additionally, using `globalThis` indexing requires careful type casting in strict TypeScript environments.
**Action:** Use `(event.target as HTMLElement).tagName` checks to skip shortcut logic when focus is on form elements, and use `any` casting for `globalThis` if custom properties (like `KeyboardEvent`) fail standard resolution.
