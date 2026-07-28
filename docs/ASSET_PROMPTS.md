# echomoss asset sourcebook

These assets were generated in the built-in ChatGPT image generation mode, then prepared
locally for production use. They are project-bound originals: no downloaded game packs,
logos or third-party character art.

## Production files

| File                                      |       Size | Purpose                        |
| ----------------------------------------- | ---------: | ------------------------------ |
| `public/assets/terrarium-states.webp`     |    768×768 | Four equal habitat states      |
| `public/assets/botanical-ui-sprites.webp` |    512×512 | Sixteen transparent UI objects |
| `public/assets/app-icon.webp`             |    128×128 | Lightweight in-app preview     |
| `src-tauri/icons/icon.ico`                | multi-size | Windows package icon           |

## Terrarium state sheet

```text
Use case: stylized-concept
Asset type: production pixel-art sprite sheet for a native Tauri desktop music companion
Primary request: Create a perfectly aligned 2x2 sprite sheet with four sequential states of the exact same small tabletop terrarium, viewed straight-on at the same camera angle and scale in every quadrant.
Frame 1 top-left: dormant terrarium at night, closed flowers, dim amber lamp.
Frame 2 top-right: music is playing, moss subtly awake, two tiny warm fireflies, soft cyan pulse inside the glass.
Frame 3 bottom-left: track-change moment, a small pixel moth crosses the terrarium and several fireflies lift upward.
Frame 4 bottom-right: completed-track bloom, flowers open and the terrarium glows richly but still feels calm.
Scene/backdrop: every frame includes its own identical deep navy-black square backdrop and identical thin dark metal terrarium frame. No transparency required. No gutters and no labels between cells.
Subject: a compact botanical terrarium with moss, fern, two small mushrooms, delicate flowers, a tiny cassette-like music module, copper fittings, condensation pixels and an amber indicator lamp. No people, no character, no logos.
Style/medium: handcrafted 16-bit pixel art, crisp square pixels, limited palette, strong readable silhouettes, nearest-neighbor aesthetic, deliberately low-frame animation design, polished game asset quality.
Composition/framing: centered object, generous but identical padding in all four cells, orthographic front view, exact same dimensions and placement in every frame.
Lighting/mood: midnight rain, quiet, cozy, slightly mysterious, non-feminine, botanical instrument mood.
Color palette: charcoal navy, deep moss green, muted cyan, warm amber, dusty lavender accents, small bone-white highlights.
Constraints: exact 2x2 grid; each quadrant must be a clean equal square; preserve terrarium geometry perfectly across frames; only plants, lights, moth and fireflies change; no text, no watermark, no UI, no rounded app-card mockup, no gradients that blur pixel edges.
Avoid: generic mobile-game art, cute face, pink kawaii styling, photorealism, isometric view, soft vector illustration, anti-aliased edges, extra props outside the terrarium.
```

Frame order:

```text
0 dormant | 1 playing
2 drift   | 3 bloom
```

## Botanical UI sheet

```text
Use case: stylized-concept
Asset type: production pixel-art UI object sheet for the native echomoss desktop app
Primary request: Create a perfectly aligned 4x4 sprite sheet containing sixteen separate opaque pixel-art objects, one object centered in each equal square cell: closed flower bud, open violet flower, fern sprig, moss clump, small brown mushroom, tiny amber firefly, pale moth, seed jar, rain droplet, crescent moon, cassette tape, headphones, generic sound-wave glyph, watering can, tiny amber lamp, pressed leaf specimen card.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the entire canvas for later background removal. No grid lines, gutters, shadows, gradients, texture, reflections, floor plane or lighting variation in the background.
Style/medium: handcrafted 16-bit pixel art, crisp square pixels, limited palette, readable silhouettes at small UI sizes, nearest-neighbor aesthetic, cohesive with a midnight botanical laboratory.
Composition/framing: exact 4x4 grid, equal cells, one isolated object per cell, generous identical padding, no object touches a cell boundary.
Lighting/mood: quiet midnight botanical collection.
Color palette: deep moss green, muted cyan, warm amber, dusty lavender, bone white, dark charcoal outlines. Do not use #ff00ff in any object.
Constraints: all objects fully opaque with crisp edges; clean separation from background; no text, no logos, no Spotify mark, no watermark, no labels, no decorative border, no cast shadows, no contact shadows.
Avoid: soft vector icons, photorealism, gradients inside object edges, anti-aliased blur, kawaii faces, pink styling, extra objects or duplicated cells.
```

Sprite order, left to right and top to bottom:

```text
00 flower bud       04 mushroom        08 rain droplet   12 sound wave
01 violet flower    05 firefly         09 crescent moon  13 watering can
02 fern             06 moth            10 cassette       14 amber lamp
03 moss             07 seed jar        11 headphones     15 pressed leaf
```

The magenta key was removed with a soft matte and despill pass. The shipped WebP preserves
transparency with a reduced palette.

## App icon

```text
Use case: logo-brand
Asset type: square application icon for the echomoss desktop app
Primary request: Create a single compact pixel-art emblem: a tiny dark glass terrarium shaped like a vintage portable cassette player, containing moss, one violet flower and one glowing amber firefly. The silhouette must remain readable at 32px and 64px.
Scene/backdrop: solid deep navy-black square background reaching every edge, with a subtle one-pixel inner border. No transparency required.
Style/medium: handcrafted 16-bit pixel art, crisp square pixels, limited palette, nearest-neighbor aesthetic, polished desktop app icon.
Composition/framing: perfectly centered, symmetrical, generous padding, one object only.
Lighting/mood: quiet botanical night, mysterious but welcoming.
Color palette: charcoal navy, deep moss, muted cyan, warm amber, dusty violet, bone-white highlights.
Constraints: no text, no letters, no Spotify logo, no music-note symbol, no watermark, no rounded mobile app mockup, no gradients that blur the pixel edges.
Avoid: kawaii face, bright pink, photorealism, soft vector art, excessive detail, tiny unreadable decorations.
```
