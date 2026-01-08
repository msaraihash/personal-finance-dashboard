# DESIGN_CONTRACT_V1 (Operational Design Spec)
Version: 1.0
Purpose: Convert high-level aesthetic guidelines into an enforceable, machine-checkable contract for implementation.
Source: design_ethos.md

---

## 0) How an Agent Must Use This File
**Agent algorithm (must follow in order):**
1. Create a `DesignBrief` YAML (Section 1) and fully populate all REQUIRED fields.
2. Generate `TokenPlan` (Section 2) and `MotionPlan` (Section 3).
3. Run `DesignLint` mentally or via simple grep checks (Section 6). If any FAIL triggers, revise brief before coding.
4. Implement UI.
5. Verify `DoneCriteria` (Section 5) and list evidence (file paths + snippets).

**FAIL if missing:** Any REQUIRED field, any DoneCriteria item, or any platform token rule.

---

## 1) DesignBrief (REQUIRED YAML)
Create one per screen/feature. Keep it close to the code (e.g., `docs/design/<screen>.design.yaml`).

```yaml
design_brief_v1:
  id: "unique-id-kebab-case"          # REQUIRED
  platform: "web|swiftui"             # REQUIRED
  surface: "page|component|screen"    # REQUIRED
  screen_name: "Human readable name"  # REQUIRED
  purpose:
    job_to_be_done: "What user accomplishes"       # REQUIRED
    primary_user: "Who uses it"                    # REQUIRED
    success_metric: "Observable outcome"           # REQUIRED
  aesthetic_direction:
    tone: "brutally minimal|maximalist|editorial|luxury|industrial|playful|brutalist|retro-futuristic|organic|other"  # REQUIRED
    motif: "single unforgettable motif phrase"     # REQUIRED
    anti_slop_statement: "One sentence describing what this will NOT look like" # REQUIRED
  constraints:
    accessibility:
      dynamic_type_or_resizable_text: true         # REQUIRED
      min_contrast_note: "AA target; explain if exception" # REQUIRED
      reduced_motion_support: true                 # REQUIRED
    performance:
      animation_budget_ms: 16                      # REQUIRED (frame budget intent)
      heavy_effects_allowed: "none|limited|yes"    # REQUIRED
    tech:
      web_stack: "svelte|html|react|other|null"    # REQUIRED (use null if swiftui)
      ios_min: "iOS 18"                            # REQUIRED if swiftui else null
  differentiation:
    hero_moment:
      description: "One high-impact moment (load / success / reveal)" # REQUIRED
      trigger: "onLoad|onSuccess|onScroll|onTap"   # REQUIRED
      why_memorable: "What user will remember"     # REQUIRED

  typography:  # REQUIRED
    display_font:
      name: "Font name"                            # REQUIRED
      source: "local|bundled|google|adobe|system"   # REQUIRED
      rationale: "Why it matches tone"             # REQUIRED
    body_font:
      name: "Font name"                            # REQUIRED
      source: "local|bundled|google|adobe|system"   # REQUIRED
      rationale: "Why it pairs well"               # REQUIRED
    banned_fonts_ack: true                         # REQUIRED (explicitly acknowledge)

  color_system:  # REQUIRED
    mode: "light|dark|both"                        # REQUIRED
    palette:
      primary: "#RRGGBB"                           # REQUIRED
      accent: "#RRGGBB"                            # REQUIRED
      neutral_1: "#RRGGBB"                         # REQUIRED
      neutral_2: "#RRGGBB"                         # REQUIRED
      semantic_success: "#RRGGBB"                  # REQUIRED
      semantic_warning: "#RRGGBB"                  # REQUIRED
      semantic_error: "#RRGGBB"                    # REQUIRED
    usage_rules:
      dominant_color: "primary|neutral_1|other"     # REQUIRED
      accent_usage_pct: 5                          # REQUIRED (approx)
      avoid_generic_gradients: true                # REQUIRED

  layout:  # REQUIRED
    composition: "asymmetric|grid-break|editorial columns|dense|airy|other" # REQUIRED
    grid_or_stack: "grid|stack|mixed"              # REQUIRED
    overlap_used: true                              # REQUIRED (or explain false)
    signature_shape_or_pattern: "e.g., diagonal cuts / grain overlay / rule lines" # REQUIRED

  background_and_texture:  # REQUIRED
    approach: "solid|gradient mesh|noise|pattern|photo|glass|mixed" # REQUIRED
    details:
      - "detail 1 (e.g., subtle grain overlay)"
      - "detail 2 (e.g., vignette / radial highlight)"
    forbid_default_blank: true                      # REQUIRED

  components:  # REQUIRED
    reusable_units:
      - name: "ComponentName"
        role: "What it does"
        states: ["default","hover","active","disabled","loading","error"]  # REQUIRED set (subset ok)
    empty_states: "specified|not_needed"            # REQUIRED

  implementation_notes:  # REQUIRED
    token_source_of_truth: "web-css-vars|tailwind-theme|swiftui-designsystem" # REQUIRED
    hardcode_policy:
      spacing: "never"                              # REQUIRED
      colors: "never except temporary prototyping"  # REQUIRED
      radii: "tokenized"                            # REQUIRED
```

---

## 2) TokenPlan (Platform-enforced)

### 2A) Web TokenPlan (CSS vars)

**REQUIRED output:** `:root` CSS vars.

```yaml
token_plan_v1:
  platform: "web"
  method: "css-vars"
  tokens:
    colors:
      --color-primary: "#RRGGBB"
      --color-accent: "#RRGGBB"
      --color-surface: "#RRGGBB"
      --color-text: "#RRGGBB"
    radii:
      --radius-s: "10px"
      --radius-m: "16px"
      --radius-l: "24px"
    spacing:
      --space-1: "4px"
      --space-2: "8px"
      --space-3: "12px"
      --space-4: "16px"
```

**FAIL if:** new colors are used without variables, or layout spacing is mostly hardcoded.

### 2B) SwiftUI TokenPlan (DesignSystem)

**REQUIRED output:** mapping to DesignSystem tokens (no magic numbers for spacing/radius/colors).

```yaml
token_plan_v1:
  platform: "swiftui"
  method: "DesignSystem.swift"
  tokens:
    colors_used:
      - "Color.<semanticName>"
    fonts_used:
      - "Font.designDisplay()"
      - "Font.designBodyPrimary()"
    spacing_used:
      - "DesignSpacing.s"
      - "DesignSpacing.m"
    radius_used:
      - "DesignCornerRadius.medium"
    gradients_used:
      - "DesignGradients.<name>"
```

**FAIL if:** `.padding(12)` or `Color.blue` appears in final diff (unless explicitly justified and documented in brief).

---

## 3) MotionPlan (Enforced "Hero Moment" + Micro-interactions)

```yaml
motion_plan_v1:
  hero_moment:  # REQUIRED
    name: "e.g., Staggered Editorial Reveal"
    trigger: "onLoad|onSuccess|onTap|onScroll"
    choreography:
      - "Step 1: background subtle shift"
      - "Step 2: title reveal"
      - "Step 3: cards stagger in"
    duration_ms_total: 900
    reduced_motion_fallback: "no stagger; opacity only"
  micro_interactions:  # REQUIRED (>=2)
    - target: "primary button"
      effect: "press depth + subtle scale"
      duration_ms: 120
    - target: "card hover/tap"
      effect: "tilt/raise + shadow change"
      duration_ms: 180
```

**FAIL if:** no explicit hero moment or fewer than 2 micro-interactions.

---

## 4) Anti-Patterns (Lintable)

```yaml
anti_patterns_v1:
  banned_fonts: ["Inter","Roboto","Arial"]   # Can be overridden only with explicit rationale in DesignBrief
  banned_color_vibes:
    - "generic purple gradient on white"
    - "default blue/gray without semantics"
  banned_layouts:
    - "cookie-cutter centered cards with identical spacing everywhere"
  banned_token_violations:
    - "hardcoded spacing/radius/colors (platform dependent)"
```

---

## 5) DoneCriteria (Acceptance Tests)

**Agent must output evidence (file paths + brief notes) for each item.**

```yaml
done_criteria_v1:
  aesthetic:
    - "Single motif is visible in at least 2 places (e.g., rule lines + section headers)"
    - "Typography: display + body font pairing is implemented"
    - "Palette: primary + accent + neutrals are visibly used with dominant/accent rule"
  composition:
    - "At least one intentional asymmetry/overlap/grid-break element exists"
    - "Background/texture is present (not default blank)"
  motion:
    - "Hero moment implemented exactly as MotionPlan"
    - ">=2 micro-interactions implemented"
    - "Reduced-motion fallback present"
  tokens:
    web:
      - "All colors via CSS vars"
      - "No repeated magic spacing values across components"
  accessibility:
    - "Readable contrast noted; dynamic type/resizable text supported"
    - "Tap targets reasonable; labels for non-text controls"
```

---

## 6) DesignLint (Simple Checks the Agent Should Run)

### Web (grep-style)

* FAIL if any of these appear in new CSS/TSX without explicit override rationale:
  * `font-family: Inter`
  * `font-family: Roboto`
  * `font-family: Arial`
* FAIL if `#` hex colors appear > 3 times outside the token file (`index.css`).
* FAIL if there is no `@keyframes` or no motion library usage AND MotionPlan requires it.

---

END DESIGN_CONTRACT_V1
