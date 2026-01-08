# Design Philosophy: The "Brené Brown" Standard

> [!NOTE]
> This file is **INSPIRATIONAL context**. For enforceable implementation rules, see [DESIGN_CONTRACT_V1.md](./DESIGN_CONTRACT_V1.md).

**Vibe**: Calm, Courageous, Clear.
**Theme**: "Nebula Glass" 🌌

The application moved away from a "Dark Mode SaaS" aesthetic to a "Light, Airy, Life-Affirming" design. We want the user to feel safe when looking at their finances.

## Visual Language
### 1. Color Palette
We use a CSS variable system (`src/index.css`) based on HSL values for soft adjustments.

| Variable | Color | Usage |
| :--- | :--- | :--- |
| `--bg-gradient-start` | `#fdfbfd` (Warm White) | Main background base |
| `--glass-bg` | `rgba(255, 255, 255, 0.7)` | Card backgrounds (Frosted Glass) |
| `--accent-primary` | `#6366f1` (Indigo/Nebula) | Primary actions, branding |
| `--accent-green` | `#10b981` (Emerald) | "All Is Well", Liquidity safe |
| `--accent-gold` | `#f59e0b` (Amber) | Warnings, Concentration alerts |
| `--text-primary` | `#1e293b` (Slate 800) | Main headings |
| `--text-secondary` | `#64748b` (Slate 500) | Subtitles, labels |

### 2. Typography
*   **Headers**: `Outfit` (Google Font). Modern, geometric, clean.
*   **Data/Numbers**: `Space Grotesk`. Monospaced-feel but legible, precise.

### 3. Components
*   **Cards**: Soft border radius (`24px`), light border (`rgba(255,255,255,0.5)`), distinct box-shadow for depth.
*   **Animations**: Staggered fades (`fade-in-up`) for all dashboard elements on load. No jarring transitions.

## User Experience Rules
1.  **No "Finance Bro" Jargon**:
    *   *Bad*: "Portfolio Drift", "Allocation Variance".
    *   *Good*: "Tactical Rebalance", "Compliance Check", "Peace of Mind".
2.  **Affirmative Feedback**: When goals are met, show green shields and "All Is Well" messages.
3.  **Proactive clarity**: Always explain *why* a number is red (e.g., "Exceeds 5% Limit").
