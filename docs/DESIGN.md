# DESIGN.md — Rakshak AI

## Theme Direction
Trustworthy, calm, field-ready — this is a decision-support tool for farmers, not a flashy consumer app. Dark, high-contrast dashboard so threat states (color-coded) pop instantly, legible even outdoors on a phone/tablet screen.

## Color Palette
| Role | Color | Hex |
|---|---|---|
| Background | Deep charcoal | `#0F1512` |
| Surface / cards | Dark green-gray | `#182420` |
| Primary accent | Forest green (brand, "protection") | `#3CA370` |
| LOW threat | Calm green | `#4CAF50` |
| MEDIUM threat | Amber | `#F5A623` |
| HIGH threat | Alert red | `#E5484D` |
| Text primary | Off-white | `#EDEFEE` |
| Text secondary | Muted gray-green | `#9BAAA2` |
| Border/divider | `#2A342F` |

## Typography
- **Headings:** Inter or Sora (bold, clean, modern sans) — 600/700 weight.
- **Body:** Inter, 400/500 weight, 15–16px base for readability at a glance.
- **Monospace (JSON/reason tags, optional):** JetBrains Mono, for the "reason" tags to feel technical/explainable.

## UI Principles
- Threat Level always shown as a colored badge, never color alone (add text: LOW/MEDIUM/HIGH) — accessibility.
- Reason list rendered as small tags/chips, not paragraphs — scannable in 2 seconds.
- Camera feed panel large and central; Threat Card + Recommendation Card stacked beside it.
- Timeline as a reverse-chronological list, color-coded left border matching threat level.
- Farmer action buttons (Accept/Ignore/Override) large, thumb-friendly, high contrast — clearly optional/manual, never auto-triggered.

## Motion
Minimal — a subtle pulse/glow on the ThreatCard when threat level changes to HIGH is enough. Avoid heavy animation; this is a utility dashboard, not a portfolio site.
