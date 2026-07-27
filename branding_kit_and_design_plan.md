# Bridging the Gap: Branding Kit & Design Plan
*Optimized for NotebookLM Project Knowledge Base · Revision 2 — reflects the shipped "Dusk Letter" hybrid design (v: Bridging the Gap Site.dc.html)*

## 1. Executive Summary

This document is the system of record for the visual and tonal rebranding of the platform from its legacy identity ("Safe Voice") to its new, empathy-driven identity ("Bridging the Gap").

The legacy design relied on a corporate SaaS aesthetic (high-contrast orange `#F97316`, dark slate `#1F2937`, system sans-serifs). The shipped direction is a **hybrid of two explorations**: the warm, editorial "The Letter" system fused with the dusk-toned, student-first mood of "Quiet Hours." The result — internally, the **"Dusk Letter"** system — is paper-and-ink warmth for daylight surfaces, plum-dusk gradients for moments of privacy and reassurance, and spruce green for action. It was deliberately re-hued away from prevailing warm-neutral AI/tech palettes to own a distinct identity.

---

## 2. Comprehensive Branding Kit

### 2.1 Brand Identity & Positioning
*   **Official Name:** Bridging the Gap (wordmark set as "Bridging *the* Gap" — Newsreader, italic "the")
*   **Primary Tagline:** It's okay to *say something.*
*   **Secondary Taglines:**
    *   Everyone needs someone in their corner. This is how you find yours.
    *   Confidential · Free · No trouble for asking.
    *   The village, *organized.* (community-partner framing)
    *   Your words belong to *you.* (privacy framing)
*   **Core Values:** Empathetic, Non-punitive, Confidential, Collaborative.
*   **Site architecture:** Home · Get support · For schools · For communities · Your privacy. A 988 crisis line is persistently visible (dismissible top bar + footer), independent of the app CTA.

### 2.2 Color Palette
Warm "paper-and-ink" daylight tones, plum-dusk darks, and a spruce action color. Terracotta survives from the first exploration only as a **minority accent**.

| Color Name | Hex / Value | Usage |
| :--- | :--- | :--- |
| **Rose Parchment** | `#FAF2E9` | Primary background. Warm, rose-tinted paper; replaces stark white. |
| **Plum Ink** | `#2E2833` | Primary text and strong elements. A plum-black, softer than pure black. |
| **Spruce** | `#3E6B5C` | Primary CTA / action color (buttons, selected chips). Text on spruce: `#F6F1E7`. |
| **Ember Terracotta** | `#B4552D` | Minority accent: mono overlines, section rules (2px border-top), links, illustration fills. Hover: `#8F4021`. |
| **Apricot** | `#E4A576` | Highlight on dark surfaces; CTAs on dusk sections (with Plum Ink text); illustration sun/glow. |
| **Dusk Gradient** | `linear-gradient(120deg, #342B3E 0%, #45334C 100%)` | Dark "reassurance" sections (privacy, who-sees-what, FAQ, CTA bands). Hero illustration variant: `linear-gradient(180deg, #3A2E47, #59394E 55%, #342B3E)`. |
| **Muted Text** | `#5B5260` | Body/secondary text on light surfaces. |
| **Faint** | `#8F8394` | Captions, mono metadata, footer fine print. |
| **On-dark Body** | `#CFC0CC` | Paragraph text on dusk sections. On-dark emphasis: `#F6EEE8`. |
| **Sand** | `#D8C8BC` | Chip/secondary-button borders (1.5px), muted illustration shapes. |
| **Hairline** | `#EADDD1` | Card borders and section dividers (1px). |
| **Card White** | `#FFFFFF` | Card surfaces, with shadow: `0 1px 2px rgba(70,58,80,0.04), 0 16px 36px rgba(70,58,80,0.08)`. |
| **Illustration plums** | `#463A50`, `#5A4B63`, `#59394E` | Panel fills and shapes in dark illustrations. Light illustration panel: `#F0E4DC`. |

### 2.3 Typography System
Unchanged three-font stack; loaded from Google Fonts.

*   **Display & Headings:** `Newsreader` (serif)
    *   H1 46–54px at weight 400 (display sizes go *lighter*, not bolder); H2/H3 500–600.
    *   Italics for gentle emphasis: "say *something*", "Respond *together*."
*   **Body & UI:** `Karla` (sans-serif)
    *   Body 15–17.5px / 1.6–1.7 line-height; buttons and nav at 600–700.
*   **Accents & Metadata:** `IBM Plex Mono`
    *   Overlines (11–12px, uppercase, `letter-spacing: 0.14em`), step numerals (01/02/03), illustration captions, "seen by:" metadata.

### 2.4 Shape & Depth Language
*   **Pills:** all buttons and role chips use `border-radius: 999px`.
*   **Cards & panels:** 14–18px radius; 1px `#EADDD1` border plus the soft plum shadow above (not shadowless — this superseded the earlier "borders only" rule).
*   **Section rhythm:** alternating Rose Parchment, Card White bands (hairline top/bottom), and Dusk Gradient bands. Max content width 1120px, 40px gutters.
*   **Steps motif:** 2px Ember border-top + mono numeral, used for all "how it works" sequences.

### 2.5 Illustration System
No stock vectors, no emoji, no complex SVG art. All imagery is **CSS-drawn geometric abstraction** in exact palette hexes, each with a lowercase mono caption. Canonical motifs (all shipped):
*   *a bridge, at dusk — two sides meeting* (home hero; apricot sun, terracotta arch, dusk gradient)
*   *one lit window — someone is listening* (privacy; plum grid, one apricot square)
*   *a circle of support* (get support; five circles on a connecting line)
*   *one pathway — report to resolution* (schools; dashed route with four nodes)
*   *the village, at one table* (communities; five circles over a spruce table)
*   *your words, at the center — rings of consent* (privacy; concentric rings around an apricot core)

Rule: position shapes with **percentages** (with `translate` centering), never fixed px offsets, so compositions hold at any panel width. These are placeholder-grade brand illustrations; commissioned artwork drops into the same panels later.

### 2.6 Voice & Tone
Calm, reassuring, human, plain-spoken.
*   **Do:** "Get support", "Open the app", "Start here", "Say something", "Reach out", "Your words belong to you."
*   **Don't:** "Submit report", "Incident tracking", "Disciplinary action", surveillance or law-enforcement vocabulary, sales pressure.
*   **Key messaging pillars:**
    *   *No surveillance:* "No tracking, no cameras. It only knows what you choose to share."
    *   *No punishment:* "Asking for help is never a discipline issue. Not for you, not for a friend."
    *   *No pressure:* "You say it, your way."
    *   *Consent everywhere:* community partners are *invited* — "invited, never imposed."
*   **Audience fork:** the sentence-completion mechanic "I'm here as… a student / a parent or caregiver / an educator / a community partner" routes each audience from the hero.

---

## 3. Design Implementation Plan

### Phase 1: Foundation & Theming
1.  **Update `theme.ts` / `src/styles/theme.ts`:** purge legacy colors (`#F97316`, `#1F2937`, `#22C55E`, `#F5F1EA`); implement Section 2.2 as semantic tokens (`color.bg.base = #FAF2E9`, `color.ink = #2E2833`, `color.action = #3E6B5C`, `color.accent.ember = #B4552D`, `color.accent.apricot = #E4A576`, `gradient.dusk`, etc.).
2.  **Typography:** load `Newsreader`, `Karla`, `IBM Plex Mono` in Next.js `layout.tsx` (next/font) and via Expo font hooks in the React Native app.

### Phase 2: Component Overhaul
1.  **Buttons (`PrimaryButton.tsx`):** pill radius (999px); primary = Spruce bg / `#F6F1E7` text; secondary = transparent bg, 1.5px Sand border, Plum Ink text; on-dark = Apricot bg / Plum Ink text.
2.  **Cards (`SectionCard.tsx`):** Card White, 1px Hairline border, 14–16px radius, soft plum shadow (Section 2.4).
3.  **Dark sections:** Dusk Gradient bands for privacy/trust content; on-dark text tokens from 2.2.

### Phase 3: Content & UX Copy Migration
1.  **Navigation (`PageHeader.tsx`):** wordmark "Bridging *the* Gap"; tabs `/get-support`, `/schools`, `/community`, `/privacy`; pill CTA "Open the app".
2.  **Microcopy audit:** replace "Report/Submit" vocabulary per Section 2.6; add the persistent 988 crisis bar and footer line.

### Phase 4: Illustration & Visual Motif Refactoring
1.  Delete legacy vectors (`family-school.svg`, `student-support.svg`).
2.  Implement the six motifs in Section 2.5 as reusable components, percentage-positioned, palette-exact hexes only.

> [!IMPORTANT]
> **Accessibility checks:**
> *   Ember Terracotta `#B4552D` on Rose Parchment `#FAF2E9` passes AA for normal text (~4.6:1) but keep it at weight 600+ and ≥12px; never use Apricot for text on light surfaces.
> *   Spruce `#3E6B5C` with `#F6F1E7` text passes AA at button sizes.
> *   On Dusk Gradient, body text must be `#CFC0CC` or lighter; `#8F8394` is captions-only (large/mono, non-essential).
> *   Faint `#8F8394` on light backgrounds is below AA for body text — captions and metadata only.
