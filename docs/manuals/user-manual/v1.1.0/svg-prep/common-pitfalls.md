# Common Pitfalls

Avoid these issues for consistent icon output.

## Embedded fonts
Text may render differently across systems.
- Fix: Convert text to paths before exporting.

## Heavy filters/effects
Blur, glow, gradients with many stops can rasterize or band.
- Fix: Simplify effects or replace with flatter shapes where possible.

## Clipping masks that change bounds
Clips can shift the exported viewBox.
- Fix: Expand/trim art so the viewBox tightly fits the visible shape.

## Thin strokes at small sizes
Hairline strokes can disappear when downscaled.
- Fix: Increase stroke width; use round joins/caps for clarity.

## Off‑canvas shapes and hidden layers
Hidden or off‑canvas elements may affect bounds.
- Fix: Delete hidden layers and trim off‑canvas paths.

> Tip: Preview at 16, 32, and 64 px before generating. Adjust strokes/fills until it reads well at a glance.
