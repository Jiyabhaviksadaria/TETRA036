# TEAM_COMMS.md — Rakshak AI (4-Member Protocol)

## Golden Rule
Freeze JSON contracts at Hour 2 (see ARCHITECTURE.md). Everyone builds against the contract with mock data — never wait on a teammate's actual code.

## Ownership → No Cross-Editing
| Folder | Owner | Others may... |
|---|---|---|
| `vision/` | M1 | read only, never edit |
| `decision_engine/` | M2 | read only, never edit |
| `backend/` | M3 | read only, propose changes via PR |
| `frontend/` | M4 | read only, never edit |
| `docs/` (this doc, PRD, etc.) | Shared | anyone can edit, but ping group in WhatsApp first |

## Who Tells Whom (trigger table)
| If you... | Notify | Via |
|---|---|---|
| Change a field name/type in any JSON contract | **Everyone** immediately | WhatsApp group ping + update ARCHITECTURE.md |
| Finish your module's mock-data version | M3 (Backend) | WhatsApp: "vision mock ready, matches contract" |
| Change a backend route path or response shape | M4 (Frontend) + M2 (Decision) | WhatsApp + update ARCHITECTURE.md |
| Push to your branch | No need to notify — routine | GitHub |
| Want to merge into `main` | **Everyone** (quick async approval) | GitHub PR + WhatsApp "PR up, please glance" |
| Are blocked >30 min | Whoever owns the blocker | WhatsApp, tag by name |
| Discover a contract was misunderstood/ambiguous | Whole group, resolve live | Google Meet (2-min call, don't debate over text) |

## Merge Discipline
1. Never push directly to `main` — always PR from your own branch.
2. One-line PR description: what changed + which contract it touches (if any).
3. At least one other member skims the diff before merge (async is fine, use WhatsApp thumbs-up).
4. Merge to `main` only at Phase checkpoints (end of Hour 2, 8, 12, 18, 22) — not continuously — to avoid mid-build breakage.
5. If a merge conflict happens: the person merging resolves it, not the original author — keeps ownership boundaries clean.

## Sync Cadence
- Hour 0–2: kickoff call (freeze everything).
- End of every phase (Hour 8, 12, 18, 22): 5-min WhatsApp or Meet sync — "what's done, what's blocked, any contract drift."
- Anything urgent mid-phase: WhatsApp group, tag the relevant owner by name, don't wait for the next checkpoint.

## Tools
Meet (calls) · WhatsApp (async pings) · GitHub (code + PRs) · Notion/Google Docs (docs/ folder, optional) · Postman (API testing, shared collection).
