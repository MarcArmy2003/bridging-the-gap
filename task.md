# Frontend Build Tasks

## Phase 1: Core Theming & Typography
- [ ] `src/styles/theme.ts`: Inject Dusk Letter palette and new geometric tokens.
- [ ] `src/app/layout.tsx`: Add Google Fonts (Newsreader, Karla, IBM Plex Mono).
- [ ] `src/app/layout.tsx`: Build the 988 Crisis Line sticky top bar.
- [ ] `src/app/layout.tsx`: Update PageHeader (wordmark, nav links).
- [ ] `src/app/layout.tsx`: Update Footer (988 line, nav links).

## Phase 2: CSS Geometric Motifs
- [ ] `src/components/motifs/HeroBridgeMotif.tsx`
- [ ] `src/components/motifs/PrivacyWindowMotif.tsx`
- [ ] `src/components/motifs/CircleOfSupportMotif.tsx`
- [ ] `src/components/motifs/SchoolsPathwayMotif.tsx`
- [ ] `src/components/motifs/VillageTableMotif.tsx`
- [ ] `src/components/motifs/RingsOfConsentMotif.tsx`

## Phase 3: Page Overhauls
- [ ] `src/app/page.tsx` (Home): Integrate HeroBridgeMotif, apply alternating section rhythm.
- [ ] `src/app/get-support/page.tsx`: Create intake framing, integrate CircleOfSupportMotif.
- [ ] `src/app/schools/page.tsx`: Early response messaging, integrate SchoolsPathwayMotif.
- [ ] `src/app/community/page.tsx`: Create (replaces churches), integrate VillageTableMotif.
- [ ] `src/app/privacy/page.tsx`: Create, integrate PrivacyWindowMotif and RingsOfConsentMotif.

## Final Steps
- [ ] Verify build (`npm run build`).
- [ ] Setup Next.js static export in `next.config.js` for GitHub Pages.
