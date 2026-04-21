## 2026-04-21 - [Radix UI Tooltip & Disabled Buttons]
**Learning:** Radix UI `TooltipTrigger` (and standard HTML tooltips) does not reliably trigger when wrapping a `disabled` button because disabled elements don't fire pointer events.
**Action:** Wrap the `disabled` button in a container element (like a `div` or `span`) that is still capable of receiving hover/pointer events to ensure the tooltip is displayed even when the action is unavailable.

## 2026-04-21 - [Keyboard Affordances in Browser Tools]
**Learning:** For complex, creative tools that run in the browser, users often expect professional-grade keyboard shortcuts (like zoom) to feel like native desktop apps.
**Action:** Always pair keyboard shortcuts with visual hints in tooltips to improve discoverability and reduce the cognitive load of switching between mouse and keyboard.
