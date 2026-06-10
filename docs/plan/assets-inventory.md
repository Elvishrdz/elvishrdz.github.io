# Phase 1 — Asset inventory (DONE)

Curated, original-quality assets copied into `assets/projects/`. Classified by dimension/orientation + a visual spot-check. This is the reference for Phase 2 (data model).

- **Total:** 99 files, ~39 MB (of which the Infinite PG `video.mp4` is **22 MB** — see ⚠️).
- **Naming:** kebab-case, `shot-N.<ext>`, versions in `v1/ v2/`, devices in `v2/phone v2/tablet v2/laptop`, job variants in sub-folders.
- **Orientation drives the frame:** PORT → phone frame · LAND (games / Android Auto / tablet / laptop) → landscape frame · banner/feature/photo → framed image card (rule 3).

## Video (§0.9) — Infinite Platform Game ✅ DONE
- **`video.mp4`** = 22 MB, 1920×1080, 44 s (original) → **trailer**, repo-hosted, on demand
  (`media.trailer = { provider:"file", src:".../video.mp4" }`).
- **`video-bg.mp4`** = **2.8 MB**, 1280×720, muted, CRF 27 → **background loop**
  (`media.bgVideo = ".../video-bg.mp4"`). Quality verified (crisp pixel-art at 720p).
- Built with `ffmpeg` (installed): `-an -vf scale=1280:-2 -c:v libx264 -crf 27 -preset slow -movflags +faststart`.

## Personal projects

| id | structure | media kind(s) |
|---|---|---|
| `drink-water` | `icon.jpg`; **v1/** `shot-1..6.png` (PORT) + `banner.jpg` (image); **v2/** `phone/1..5.png` (PORT) + `tablet/1..3.jpg` (LAND) + `laptop/1..2.png` (LAND) + `feature.png` (image) | v1 = **phone** carousel + 1 image; v2 = **gallery** (phone+tablet+laptop) |
| `touch-it` | `icon.jpg`; **v1/** `shot-1..6.png` (PORT) + `feature.jpg` + `banner.jpg` (images) | v1 App = **phone** carousel + images; v1 Backend = none; v2 = none (WIP) |
| `infocenter` | `icon.png`; **v1/** `shot-1..6.png` (PORT 540×960) | v1 App = **phone** carousel; v1 Backend = none; v2 = none (WIP) |
| `infinite-platform-game` | `icon.jpg` (portrait cover); `shot-1..3.png` (**LAND** 1280×720, game) ; `photo-1..2.jpg` (camera photos → image); `video.mp4` (bg) | **landscape** shots + image photos + **bgVideo** |
| `2d-action-game` | `icon.png`; `shot-1..3.png` (**LAND** 1280×720, game) | **landscape** shots |

No-asset (text + gradient only): **yavoy, credit-manager, game-zone, untitled-game** — no folders created.

## Jobs (`group:"job"`, gated by `FEATURES.showJobs`)

| job | variant folders (shot count) | orientation |
|---|---|---|
| `elvah` | `ev-charging` (5), `e-on-drive-comfort` (4), `e-on-next` (5), `charge-sdk` (5), `android-auto` (3) | phone PORT; **android-auto = LAND** (car) |
| `temoglo` | `miss-nicaragua-2018` (4), `miss-nicaragua-2019` (4), `miss-mundo` (4), `carnaval` (4), `soy-cristiano` (4), `tia-florita` (4), `taxigo` (2), `el-chelinero` (4), `jaime` (1) | phone PORT |

## Notes feeding Phase 4 (media renderers)
- The phone frame must support **portrait and landscape** variants; pick aspect from image dimensions (or an explicit `orientation` on the media). Games + Android Auto render as **landscape cards**.
- Game promo shots include a marketing band baked into the image — fine as-is in a landscape frame.
- Job variants reuse the surface/variant switch; each variant = `{ name, stack[], screenshots[] }`.
