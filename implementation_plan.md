# Implementation Plan: Bridging the Gap (Next.js Frontend Build)

This plan outlines the complete build-out of the Next.js frontend for **Bridging the Gap**, strictly applying the "Dusk Letter" (Revision 2) branding system and architectural guidelines extracted from the NotebookLM workspace.

## User Review Required
> [!IMPORTANT]
> The site architecture specifies a **988 crisis line** (dismissible top bar + footer). I will implement a dismissible sticky banner at the very top of the `layout.tsx`.
> We will also transition the `/churches` route to `/communities` (or `/community`) to match the broader "For Communities" audience fork specified in the branding kit.

## Proposed Changes

### Phase 1: Core Theming & Typography
Update the global theme tokens and inject the Google Fonts stack.

#### [MODIFY] `src/styles/theme.ts`
- Purge legacy corporate SaaS colors (`#F97316`, etc.).
- Inject **Dusk Letter palette**: Rose Parchment (`#FAF2E9`), Plum Ink (`#2E2833`), Spruce (`#3E6B5C`), Ember Terracotta (`#B4552D`), Apricot (`#E4A576`), Dusk Gradient, Card White, and Hairline.
- Add specific box-shadow tokens (`softPlum`) and border radii (pills: `999px`, cards: `14-16px`).
- Update global styles definitions (`styles.primaryButton`, `styles.sectionCard`, etc.) to use the new tokens.

#### [MODIFY] `src/app/layout.tsx`
- Implement `next/font/google` for **Newsreader** (serif), **Karla** (sans-serif), and **IBM Plex Mono**.
- Build the **988 Crisis Line** sticky top bar (Rose Parchment or Dusk Gradient background, with a dismiss action).
- Update the **PageHeader**: "Bridging *the* Gap" wordmark, update nav links (Get Support, For Schools, For Communities, Your Privacy).
- Update the **Footer**: Add the persistent 988 crisis line and update the links.

### Phase 2: CSS Geometric Motifs (Illustrations)
Create reusable React components that render the 6 canonical CSS-drawn geometric abstractions using the exact palette hexes.

#### [NEW] `src/components/motifs/HeroBridgeMotif.tsx`
- *a bridge, at dusk — two sides meeting* (Apricot sun, Terracotta arch, Dusk gradient).
#### [NEW] `src/components/motifs/PrivacyWindowMotif.tsx`
- *one lit window — someone is listening* (Plum grid, one Apricot square).
#### [NEW] `src/components/motifs/CircleOfSupportMotif.tsx`
- *a circle of support* (Five circles on a connecting line).
#### [NEW] `src/components/motifs/SchoolsPathwayMotif.tsx`
- *one pathway — report to resolution* (Dashed route with four nodes).
#### [NEW] `src/components/motifs/VillageTableMotif.tsx`
- *the village, at one table* (Five circles over a spruce table).
#### [NEW] `src/components/motifs/RingsOfConsentMotif.tsx`
- *your words, at the center — rings of consent* (Concentric rings around an apricot core).

### Phase 3: Page Overhauls & Content Gaps
Rebuild each page to "perfect completion" using the new CSS motifs, the new typography rules, and the empathetic UX copy rules (no "submit report", no punitive language).

#### [MODIFY] `src/app/page.tsx` (Home)
- Implement the "Sentence-completion mechanic" routing from the hero ("I'm here as...").
- Integrate the `HeroBridgeMotif.tsx`.
- Apply alternating section rhythms: Rose Parchment → Card White bands → Dusk Gradient bands.

#### [MODIFY/NEW] `src/app/get-support/page.tsx`
- Integrate `CircleOfSupportMotif.tsx`.
- Focus on the "Students Report" aspect: a simple, non-clinical intake framing.

#### [MODIFY] `src/app/schools/page.tsx`
- Integrate `SchoolsPathwayMotif.tsx`.
- Frame the messaging around early response and care coordination.

#### [NEW] `src/app/community/page.tsx` (Replaces `churches`)
- Integrate `VillageTableMotif.tsx`.
- Frame around "The village, organized." and consent-based partner integration.

#### [NEW] `src/app/privacy/page.tsx`
- Integrate `PrivacyWindowMotif.tsx` and `RingsOfConsentMotif.tsx`.
- Detailed explanation of the 5-Layer FERPA defense-in-depth model in plain language.

## Verification Plan
### Automated Tests
- `npm run build` inside `saving-grace-website` to ensure all components compile without Next.js routing/TypeScript errors.
### Manual Verification
- Deploy the site or run `npm run dev` and visually verify that the Next.js font rendering, the CSS abstract motifs, and the Dusk Letter color palette are pixel-perfect against the guidelines.
