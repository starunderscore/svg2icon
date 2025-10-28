# Optimizing SVGs

Keep files clean for faster, more predictable icon exports.

## 1) Remove editor metadata
Export a minimal SVG without private editor data (IDs, guides, hidden layers).

## 2) Convert text to paths (when appropriate)
If your icon includes text, convert it to outlines so it renders the same everywhere.

> Remember: Keep a copy with live text for future edits; export a separate outlined version for icons.

## 3) Flatten groups and transforms
Nested groups and transforms can shift bounds on export. Flatten where you can.

## 4) Verify viewBox and art bounds
The `viewBox` should tightly wrap your artwork (no large empty margins), and width/height can be left flexible.

```xml
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">...
```

> Tip: If icons look cropped or too padded, check the viewBox and trim off‑canvas shapes.

## 5) Check fills and strokes at small sizes
Preview at 16, 32, 64 px. Boost stroke width or simplify shapes if details vanish.

## Before you generate: quick checklist
- No editor metadata or hidden layers
- Text converted to paths (keep an editable source copy)
- Groups/transforms flattened where practical
- Tight viewBox (no large empty margins)
- Strokes/fills readable at 16–64 px

> Technical Stuff: For monochrome icons, ensure fills are solid and avoid semi‑transparent overlays that downscale poorly.
