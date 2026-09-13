# Room Studio — Bedroom 1203

An interactive bedroom planner with Three.js and React. Drag and rotate furniture, edit the measured footprint, compare layouts, check collision and drawer access, and simulate a compact office chair rolling and swiveling.

## Run

Use Node.js 22 (`nvm use` if you use nvm).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To check the production version locally:

```sh
npm run build
npm start
```

Run `npm run typecheck` for TypeScript checks.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import `ishdafish24/room-studio`. If it is not listed, allow the Vercel GitHub integration to access this repository.
2. Keep the root directory at the repository root and the framework preset at **Next.js**.
3. Click **Deploy**. `vercel.json` supplies the install and build commands; use the default output directory.

No environment variables, API keys, database, Cloudflare account, or ChatGPT sign-in are required. Use Node.js 22.x (also specified in `package.json`). Vercel deployment protection, if enabled on your account, is configured separately in Vercel.

This is the existing Bedroom 1203 planner, including its supplied room reference image and source links. Room and furniture dimensions are editable. Layouts are stored only in each visitor's browser; JSON export/import moves them between devices. User accounts, cloud storage, and collaborative editing are not implemented.

## Architecture

Standard Next.js App Router with React, TypeScript, Tailwind CSS, and Three.js. The 3D scene is loaded on the client only. The app has no server-side data dependencies. The former Sites/Cloudflare hosting adapter has been removed so Vercel can build the repository directly.

## Measurements

The supplied brief sets the default room to 127 × 142 inches, with an 87-inch solid rear wall and a 40-inch opening to its right. The continuation is not modeled. Furniture dimensions and the IKEA source discrepancy are documented in the app's Measurements & sources panel. The default bed is the brief's 62.25 × 94.5 inches; an inspector control switches to the linked IKEA listing's 62.25 × 95.25 inches.

All geometry uses inches. Models are approximations reconstructed from supplied dimensions, not Matterport or manufacturer meshes. Ceiling height, window geometry, under-desk details and drawer extension are assumptions. Do not infer ergonomic approval from geometric fit. The app explicitly reports measurement uncertainty and conservative chair envelopes.

## Collision model

Rotated convex footprints use the separating axis theorem. Chair checks combine its rotated rectangular envelope and circular caster base, with separate desk feet and vertical arm/back checks. The planned path first rolls back, then rotates about a centered pivot; 121 samples cover the path. Playback stops before modeled contact, and the scrubber permits inspecting collisions. A fit at sampled states is not a continuous-time collision or comfort guarantee.

Layouts save to versioned browser local storage. JSON import validates dimensions, types and limits. The Export dialog provides JSON, PNG, and readable JSON for browsers that restrict downloads. Comparison slots last for the current page session. Undo history lasts until reload.
