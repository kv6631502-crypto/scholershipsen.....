# Vibe-Coding Platform Prompts

Use with Lovable, Bolt, v0, Cursor, or similar. Attach `PROJECT.md`, `DEMO_DATA.md` and `DESIGN.md` as context, or paste them first.

How to use: paste the **Master prompt** once, then send **Phases 1 to 5** one at a time. Check each phase before moving on. Do not send everything in one message.

---

## Master prompt

```
You are building "Scholarship Sentinel", a fraud-pattern investigation dashboard for government scholarship officers. It analyzes relationships across students, institutions, bank accounts, mobiles, addresses and documents, and flags explainable clusters for human review. It never accuses an individual.

Follow the attached PROJECT.md (logic, scoring, API), DEMO_DATA.md (synthetic data) and DESIGN.md (visual system). If anything conflicts, DESIGN.md wins for visuals and PROJECT.md wins for logic.

STACK
- React + TypeScript + Vite, Tailwind CSS
- Three.js via @react-three/fiber and @react-three/drei for 3D
- React Router, TanStack Query
- A typed data layer in src/lib/api.ts that calls /api/* and falls back to local JSON fixtures in src/fixtures/ when the API is unreachable. A FastAPI backend will replace the fixtures later, so keep the response shapes exactly as in PROJECT.md.

HARD DESIGN RULES
- NO violet, purple, indigo, fuchsia or magenta anywhere: not in shadows, focus rings, charts or 3D lighting. In tailwind.config, REPLACE the default colors with the tokens from DESIGN.md (mist, paper, ink, steel, petrol, harbor, signal, amber, sea) so forbidden colors cannot be used.
- Fonts: Bricolage Grotesque for headings, Public Sans for body. Do not use Inter or Roboto.
- No gradient text, no gradient backgrounds, no emoji icons (use Lucide, 1.5px stroke).
- Do not make a grid of identical rounded cards. Vary size and weight by importance.
- No all-caps eyebrow labels, no marketing copy, no "Welcome to", no lorem ipsum.
- No glassmorphism except the 3D graph legend.
- It must look like a purpose-built government investigation tool, not a generic AI-generated SaaS template.

3D
- The 3D relationship graph on the cluster detail page is the hero. Node shapes by type (student sphere, bank octahedron, mobile cube, institution cylinder, address cone, document slab). Shared nodes glow signal/amber and pulse slowly. Camera auto-orbits until the user drags. Click a node to focus it and show details.
- The Overview page has an isometric 3D bar map of flagged institutions.
- Respect prefers-reduced-motion. On small screens fall back to a static image with an "Open interactive view" action.

LANGUAGE
- Never call a student a fraudster. Use "linked students", "flagged cluster", "requires verification".
- Show "Score reflects unusual signals, not the chance of fraud" beside every risk score.
- Mask bank accounts to the last 4 digits and mobiles partially.

Build in phases. Wait for my next message before starting the next phase.
```

---

## Phase 1: Foundation and design system

```
Phase 1. Set up the project and design system only.
- Vite + React + TypeScript + Tailwind, router, TanStack Query.
- tailwind.config with ONLY the DESIGN.md color tokens, font families, type scale (12/14/16/20/28/44) and three elevation shadows tinted with petrol.
- App shell: left rail in harbor with Overview, Clusters, Institutions, Cases, Data (Lucide icons), content area on mist.
- Reusable components: RiskMeter, StatusChip, RiskBandBadge, DataTable (sticky header, sortable, 44px rows), Button variants (primary petrol, outline signal, quiet), EmptyState.
- src/fixtures/ with a small JSON set (12 clusters from DEMO_DATA.md, full detail for CL-104).
- src/lib/api.ts with fixture fallback.
Show a style-guide route (/styleguide) rendering every component. Do not build pages yet.
```

## Phase 2: Overview

```
Phase 2. Build the Overview page.
- One wide headline row with unequal widths: Applications analyzed (10,000), Review required (820), High-risk applications (240 in 12 clusters). Large numbers in Bricolage Grotesque.
- 3D isometric institution map (react-three-fiber): extruded bars, height = applications relative to active students, bars above 3x turn signal, hover lifts and shows a tooltip, click opens that institution's clusters. One entrance: bars rise in sequence over 600 ms, nothing else animates on load.
- Top clusters list on the right, sorted by score, each row opens the cluster.
- Recent officer activity list below.
```

## Phase 3: Clusters and cluster detail (most important)

```
Phase 3. Build the Clusters list and the Cluster detail page.
- Clusters list: filterable by band and status, sortable table with ID, score, band, students, institutions, status.
- Cluster detail for CL-104:
  - Header: ID, risk meter 87, band, status chip, action buttons.
  - Left 60%: the 3D graph stage (harbor background, floor grid, soft key + rim light, fog). Node shapes per type, tube edges, glowing shared nodes, auto-orbit that stops on drag, click-to-focus with a detail panel, reset-view button, small glass legend.
  - Right: "Why this was flagged" list. Each reason shows signal name, points and one plain sentence, and the points visibly sum to the score.
  - Below: masked students table and a case timeline.
- Selected cluster cards tilt up to 3 degrees toward the pointer (CSS perspective), disabled on touch and reduced motion.
```

## Phase 4: Case management

```
Phase 4. Add officer actions and the Cases page.
- Actions: Verify, Assign investigator, Request documents, Escalate, Close case. Each opens a small dialog with a note field (and an assignee select for Assign).
- Each action updates status, appends to the timeline with a timestamp, and shows a toast using the same verb ("Documents requested").
- Cases page: board or table grouped by status, with filters for assignee and band.
- Persist in local state for now, behind the api.ts layer so a POST /api/clusters/{id}/action can replace it.
```

## Phase 5: Polish and demo mode

```
Phase 5. Polish.
- Add the Institutions page (table plus the 3D bar map filtered by institution).
- Demo mode toggle in the footer of the rail: pre-selects CL-104 and shows a small "Synthetic data" label.
- Check responsiveness down to tablet; graph stacks above the reasons panel.
- Visible keyboard focus in petrol, AA contrast, reduced-motion support, loading and error states.
- Search the codebase for violet, purple, indigo, fuchsia and magenta classes and hex values, and remove any.
```

---

## Fix-it prompts (use when the output drifts)

**Looks generic or templated**
```
This looks like a generic AI template. Remove identical card grids, vary panel sizes by importance, cut decorative gradients and shadows, tighten the type scale, and make sure headings use Bricolage Grotesque with tight tracking. Keep the 3D graph as the only showpiece.
```

**Violet crept in**
```
Search every file for violet, purple, indigo, fuchsia, magenta, and hex values in the 250 to 300 degree hue range. Replace with the DESIGN.md tokens (petrol for primary, signal for high risk). Also check focus rings, selection colors, chart series and Three.js lights and materials.
```

**3D feels flat or slow**
```
Improve the 3D scene: add a soft key light and a rim light, light fog, a subtle floor grid, faceted (flatShading) materials, instanced meshes for students, and cap nodes at 200. Pause rendering when the tab is hidden. Keep auto-orbit slow (0.3 speed) and stop it on drag.
```

**Copy is off**
```
Rewrite UI text in plain, active, sentence-case language. Buttons name the action ("Assign investigator"). Never use words like fraudster, guilty or criminal about students. Remove any marketing-style copy.
```

---

## Tips

- If the platform ignores the no-violet rule, check `tailwind.config` first; default palettes are the usual culprit.
- Keep fixture JSON shapes identical to the API contract so swapping in FastAPI is a one-line change.
- Run the 3D graph on CL-104 before anything else. If it looks great, the demo works.
