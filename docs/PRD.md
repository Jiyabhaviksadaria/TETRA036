# PRD.md — Rakshak AI

## What to Build
An AI-powered **Explainable Farm Decision Support System** — not an animal detector.
Pipeline: Camera → Detect/Track Animal → Understand Field Context → Assess Threat → Explain Reason → Recommend Non-Lethal Response → Log to Timeline.

Core differentiator: every recommendation ships with a human-readable **reason list**, not just an alert.

## Targeted User
- Small/marginal farmers with crop-adjacent land facing wild animal intrusion (primary persona for demo).
- Secondary: agri-tech field officers / hackathon judges evaluating decision-support value over raw detection.

## Features

### MVP (must-have for demo)
1. Animal detection + tracking (bounding box, confidence, position, prev-position, direction) — mocked or live YOLO.
2. Farmer manually marks protected crop region (one-time, on image/frame).
3. Field context computation: distance to crop, relative position, movement direction, time of day.
4. Rule-based Explainable Decision Engine → Threat Level (LOW/MEDIUM/HIGH) + Recommendation + Reason[].
5. Smart Response mapping (Monitor / Flash Light / Flash Light + Speaker).
6. Farmer action controls: Accept / Ignore / Override (system never auto-acts).
7. Incident Timeline (list of past events with outcome).
8. Live dashboard: camera feed, threat card, recommendation card, reasons panel, timeline.

### Nice-to-have (only if MVP done early)
- Audio alert, flashlight simulation, WhatsApp/SMS notification, analytics/heatmap, weather integration.

### Explicit Non-Goals (for 24h scope)
- **Software-only build — no hardware integration at all.** No real camera/IoT device, no physical flashlight/speaker, no microcontroller (Arduino/Raspberry Pi/ESP32), no actuation of any kind.
- "Camera" = a video file or webcam feed processed in software (OpenCV), used purely as input simulation.
- "Flash Light + Speaker" recommendation = a **UI/software simulation only** (visual flash animation + audio play via browser/device speaker) — never a real relay/GPIO trigger.
- No GPS/GIS/satellite data.
- No real ML training pipeline — rule engine is fine; "no fake AI" but keep logic explainable/deterministic.
- No persistent DB required beyond simple JSON/SQLite store for timeline.

## Success Criteria (demo-day)
- End-to-end flow works live: mock/real detection → context → decision → dashboard update → timeline entry.
- Judge can ask "why HIGH?" and the app shows a clear reason list.
- False-alarm cases (bird, dog, human, unknown, low confidence) correctly suppressed to LOW/no-alert.
