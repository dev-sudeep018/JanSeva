---
name: JanSeva
description: A calm civic service ledger that keeps the next action and the public record equally trustworthy.
colors:
  civic-ink: "#102f3a"
  civic-ink-raised: "#193f4b"
  cool-paper: "#f5f4ed"
  ledger-surface: "#fffefa"
  quiet-surface: "#e9efeb"
  service-teal: "#167667"
  service-teal-deep: "#0d5b50"
  service-teal-soft: "#dcebe6"
  attention-brass: "#c89d3b"
  attention-brass-soft: "#f3e8c8"
  copy-muted: "#52666b"
  ledger-rule: "#cdd6d2"
  ledger-rule-strong: "#8fa19c"
  danger: "#a33939"
  danger-soft: "#f7e7e3"
  success: "#147256"
  warning: "#8a621c"
  focus: "#0a7568"
  white: "#ffffff"
typography:
  display:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(3.25rem, 5.4vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(2.625rem, 4.8vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  control: "9px"
  compact: "10px"
  surface: "14px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "9px"
  md: "14px"
  lg: "22px"
  xl: "28px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.service-teal}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.service-teal-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
  button-outline:
    backgroundColor: "{colors.ledger-surface}"
    textColor: "{colors.civic-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "46px"
  service-action-primary:
    backgroundColor: "{colors.service-teal}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "22px"
    height: "118px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.civic-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "48px"
  panel:
    backgroundColor: "{colors.ledger-surface}"
    textColor: "{colors.civic-ink}"
    rounded: "{rounded.surface}"
  status-progress:
    backgroundColor: "{colors.attention-brass-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "28px"
---

# Design System: JanSeva

## Overview

**Creative North Star: "Civic Service Ledger"**

JanSeva behaves like a clear, well-kept public record rather than a generic software dashboard. A deep ink service rail anchors broad sheets of cool civic paper; ruled divisions, tabular references, and an authored case-history line make state feel durable and inspectable. The tone is calm, respectful, and precise without borrowing the ceremonial language of an official institution.

The system puts action before chrome. Service teal is concentrated on the strongest next step, while brass marks attention and current state. Large EB Garamond statements provide civic gravity; Lato keeps controls, records, and recovery copy plain. Density stays moderate, whitespace remains generous, and motion explains arrival or state rather than decorating it.

**Key Characteristics:**

- Deep ink navigation against cool, lightly ruled paper.
- Unequal raise and track actions that make the primary task unmistakable.
- Ledger-like references, tables, timelines, and status markers.
- Selective lift reserved for the featured record, transient feedback, and modals.
- Self-hosted EB Garamond and Lato, with tabular numerals for references and counts.
- Restrained, directional motion with a complete reduced-motion path.

## Colors

The palette combines civic ink and cool paper with teal for action, brass for attention, and quiet semantic colors for record status.

### Primary

- **Service Teal:** The scarce action color for the main resident task, current timeline state, actionable links, icons, and positive focus.
- **Deep Service Teal:** The hover and high-contrast teal used where action needs firmer emphasis.
- **Soft Service Teal:** A quiet field for avatars, service icons, suggestions, and success marks.

### Secondary

- **Attention Brass:** Marks the active navigation item, the current step, and the physical ledger accent beneath the featured record.
- **Soft Attention Brass:** Provides calm warning and progress backgrounds without turning attention into alarm.

### Neutral

- **Civic Ink:** The navigation rail, dark contextual surfaces, and primary text anchor.
- **Raised Civic Ink:** The subtle hover layer inside the rail.
- **Cool Civic Paper:** The application ground; it should read as a work surface rather than a white canvas.
- **Ledger Surface:** The warmer, nearly white layer used for panels, cards, and controls.
- **Quiet Surface:** A low-contrast neutral for subdued states.
- **Muted Copy:** Supporting text, metadata, breadcrumbs, and explanations.
- **Ledger Rules:** Dividers and field boundaries create structure without nested-card clutter.
- **Danger, Success, and Warning:** Semantic state colors; always pair them with text, icons, or labels.

### Named Rules

**The Scarce Teal Rule.** Service teal identifies an action or a meaningful current state; it is not a decorative wash.

**The Brass Means Attention Rule.** Brass marks selection, progression, or a deliberate civic cue. Never use it as a second primary action color.

**The Paper, Not White Rule.** The application ground remains cool paper, while near-white is reserved for raised or bounded ledger surfaces.

## Typography

**Display Font:** EB Garamond (with Georgia and serif fallbacks)  
**Body Font:** Lato (with Arial and sans-serif fallbacks)

**Character:** EB Garamond gives public-facing statements and record headings measured authority. Lato carries instructions, controls, metadata, and dense case information with modern clarity; the pairing feels civic and authored without imitating official-government branding.

### Hierarchy

- **Display** (700, fluid 52–84px, 0.98): Home promise only; keep it compact and allow deliberate multi-line composition.
- **Headline** (700, fluid 42–68px, 1): Page-level task headings and strong dark-surface introductions.
- **Title** (700, 22px, 1.15): Panel, form-section, and card headings.
- **Body** (400, 16px, 1.55): Instructions, form content, and record detail; explanatory leads may rise to 17–21px and should stay near 33–70 characters per line.
- **Label** (800, 10px, 0.1em tracking): Workspace labels, table headers, and compact metadata; use uppercase only where the implementation establishes a system label.

### Named Rules

**The Authority and Utility Rule.** EB Garamond speaks for promises and record headings; Lato operates the service.

**The Reference Is Data Rule.** Case IDs, dates, and counts use tabular numerals and remain visually distinct from prose.

## Layout

The desktop shell pairs a fixed 256px service rail with a sticky 72px top bar and a centered work area capped at 1500px. The main content uses fluid outer padding (28–58px), long ruled sections, and asymmetric grids rather than a wall of equal cards. The home hero uses a slightly wider editorial introduction beside a featured record, with a broad 34–84px gutter. Primary and secondary resident actions use a 1.1/0.9 split to make priority visible before reading.

At 1180px the rail narrows to 226px and complex grids simplify. At 960px the rail becomes an off-canvas 280px menu, the hero stacks, and supporting form columns collapse. At 700px, outer padding becomes 16px, the action pair becomes a single column, record summaries move to one or two columns, forms become full-width, and nonessential desktop tables may yield to saved-case rows. Touch controls retain at least 44px targets.

Spacing follows a practical ledger rhythm: 6–14px for related control details, 18–28px inside groups and surfaces, and 34–84px between major narrative regions. Prefer ruled separation and whitespace over adding another container.

## Elevation & Depth

The system is flat by default and uses borders, paper tones, and ruled divisions for most hierarchy. A single featured case record receives a diffuse ambient shadow; toasts and modals receive stronger elevation because they temporarily sit above the ledger. Interactive cards may translate upward by 1–2px on hover without gaining a new shadow.

### Shadow Vocabulary

- **Featured record** (`0 20px 42px rgba(16, 47, 58, 0.14)`): The signature case-journey sheet only.
- **Toast** (`0 10px 24px rgba(16, 47, 58, 0.22)`): Short-lived system feedback.
- **Modal** (`0 24px 58px rgba(7, 27, 33, 0.3)`): Blocking confirmation or completion surfaces.

### Named Rules

**The Ledger Is Flat Rule.** Ordinary panels, forms, tables, and service cards use a rule and a paper shift, not a shadow.

**The Lift Has Meaning Rule.** Elevation signals a featured record, transient feedback, or a blocking layer; it never exists solely to make a surface look premium.

## Shapes

The form language is gently squared: ledger surfaces use a restrained 14px radius, controls use 9–10px corners, and only statuses, avatars, and timeline nodes are fully round. One-pixel rules do most structural work. Dashed borders are reserved for copyable reference boxes, while the featured record gains a narrow brass base that suggests a physical file or ledger tab.

## Components

### Buttons

- **Shape:** Compact, gently squared controls (9px radius) with a minimum height of 46px; small actions remain at least 40px high.
- **Primary:** Service teal with white text and 20px horizontal padding; reserve it for the leading task or form completion.
- **Hover / Focus:** Darken to deep teal and lift by 1px over 170ms. Keyboard focus uses a 3px teal outline with a 3px offset.
- **Outline / Link:** Outline buttons sit on ledger white with a strong rule; text actions stay flat, underlining on hover.

### Chips

- **Style:** Status and priority pills are 28px high with fully rounded ends, compact bold labels, and quiet semantic backgrounds.
- **State:** Progress uses soft brass, resolved uses soft green, closed uses quiet neutral, and priority uses soft danger. Never rely on hue alone; the state name remains visible.

### Cards / Containers

- **Corner Style:** Ledger surfaces use 14px corners.
- **Background:** Near-white ledger surface over cool civic paper.
- **Shadow Strategy:** Flat by default; only the featured case journey uses ambient lift.
- **Border:** A one-pixel ledger rule structures panels and rows.
- **Internal Padding:** Usually 22–28px, rising to 46–48px for a featured or form surface.

### Inputs / Fields

- **Style:** White fill, strong ledger rule, 9px corners, 48px minimum height, and 12px by 14px padding.
- **Focus:** Shift the border to focus teal and add a 3px translucent teal ring; do not remove the global keyboard outline unless the local ring is present.
- **Error / Disabled:** Errors use explicit danger copy. Busy or disabled actions retain their form and reduce opacity to 58%.

### Navigation

The desktop rail is deep civic ink with 48px text-and-icon rows. Resting items are muted and transparent, hover uses raised civic ink, and the active item is a high-contrast brass tab with dark text. Below 960px, preserve the same rail as an off-canvas sheet with a dark scrim instead of inventing a separate mobile navigation style.

### Service Actions

The resident choice is intentionally unequal. The 118px raise action owns solid teal and the wider track; the track action remains a bordered paper control. Both combine a 38px icon tile, two-line copy, and a directional arrow, then lift 2px on hover. On narrow screens they stack without becoming visually equal.

### Case History

The signature record uses a ruled near-white sheet, tabular reference, editorial heading, and one vertical line connecting circular states. The line draws in over 480ms with a purposeful ease, and nodes settle in 120ms increments. The current state is brass with a soft halo; completed state is green. Reduced-motion preference collapses all animation and transitions to effectively immediate feedback.

## Do's and Don'ts

### Do:

- **Do** lead every surface with the resident's next action and a plain explanation of what follows.
- **Do** use broad rules, aligned rows, and tabular references to make case history feel durable and inspectable.
- **Do** preserve the unequal visual weight of raise and track actions.
- **Do** keep prototype disclosure visible wherever the service could be mistaken for an official channel.
- **Do** pair every status color with a readable label, and preserve 44px minimum touch targets and visible focus.
- **Do** keep entry and ledger-line motion restrained, directional, and fully removable through reduced motion.

### Don't:

- **Don't** turn the interface into an equal-card dashboard or add decorative metric tiles to fill space.
- **Don't** use gradients, glass effects, ornamental government motifs, or institutional seals.
- **Don't** spread teal across passive surfaces or use brass as a competing call-to-action color.
- **Don't** add shadows to ordinary panels, fields, tables, or service cards.
- **Don't** replace the serif-and-sans hierarchy with a single generic UI face.
- **Don't** hide recovery, status, privacy, or prototype limits behind color, hover, or secondary navigation.
