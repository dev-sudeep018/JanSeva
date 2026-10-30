# JanSeva Portal Override

This page override preserves the incumbent civic-service identity while applying the master system's accessibility and interaction rules.

## Visual direction

- Mode: Operate. Task completion and legibility take priority over decorative expression.
- Primary: `#08766D` deep service teal.
- Foreground: `#122D35` ink navy.
- Background: `#F3F7F7` cool civic paper.
- Muted foreground: `#526970` with WCAG-conscious contrast.
- Success: `#168C66`; warning: `#A67523`; destructive: `#B64242`.
- Body: Lato at 16px minimum for form controls and mobile reading.
- Display: EB Garamond for concise headings only; operational labels remain Lato.

## Interaction rules

- All primary controls provide a 44px minimum target.
- Loading, empty, validation, authentication, offline, and permission states remain visible and recoverable.
- Keyboard focus uses a 3px deep-teal ring with 3px offset.
- Motion is subtle and fully disabled by `prefers-reduced-motion`.
- Tables may scroll horizontally on narrow screens; filters wrap without hiding functionality.
- Lucide-style inline SVG icons replace Unicode control glyphs.
