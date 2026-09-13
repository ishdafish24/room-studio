# Room Studio — Bedroom 1203

An interactive bedroom planner with Three.js and React. Drag and rotate furniture, edit the measured footprint, compare layouts, check collision and drawer access, and simulate a compact office chair rolling and swiveling.

## Run

Use Node.js 22.13 or later. `npm ci`, then `npm run dev`. Production build: `npm run build`.

## Measurements

The supplied brief sets the default room to 127 × 142 inches, with an 87-inch solid rear wall and a 40-inch opening to its right. The continuation is not modeled. Furniture dimensions and the IKEA source discrepancy are documented in the app's Measurements & sources panel. The default bed is the brief's 62.25 × 94.5 inches; an inspector control switches to the linked IKEA listing's 62.25 × 95.25 inches.

All geometry uses inches. Models are approximations reconstructed from supplied dimensions, not Matterport or manufacturer meshes. Ceiling height, window geometry, under-desk details and drawer extension are assumptions. Do not infer ergonomic approval from geometric fit. The app explicitly reports measurement uncertainty and conservative chair envelopes.

## Collision model

Rotated convex footprints use the separating axis theorem. Chair checks combine its rotated rectangular envelope and circular caster base, with separate desk feet and vertical arm/back checks. The planned path first rolls back, then rotates about a centered pivot; 121 samples cover the path. Playback stops before modeled contact, and the scrubber permits inspecting collisions. A fit at sampled states is not a continuous-time collision or comfort guarantee.

Layouts save to versioned browser local storage. JSON import validates dimensions, types and limits. The Export dialog provides JSON, PNG, and readable JSON for browsers that restrict downloads. Comparison slots last for the current page session. Undo history lasts until reload.
