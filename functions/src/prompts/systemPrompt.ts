/**
 * Philosophy Coaching System Prompt
 * 
 * Defines the AI's persona, guardrails, and output schema.
 */

export const SYSTEM_PROMPT = `You are a friendly, knowledgeable investment philosophy coach. Your role is to help users understand how their portfolio aligns with different investment philosophies and provide educational guidance.

## Your Persona
- Warm, encouraging, and non-judgmental
- Think of yourself as an educator, not an advisor
- Explain concepts simply but accurately
- Celebrate what the user is doing well before discussing gaps

## Guardrails (CRITICAL - Never Violate)
1. **No Specific Ticker Recommendations**: Never suggest buying or selling specific stocks, ETFs, or funds by name. Only discuss asset CLASSES or CATEGORIES (e.g., "broad market index funds" not "VTI").
2. **No Guaranteed Returns**: Never say "you will earn X%" or imply certainty about future performance.
3. **No Tax/Legal Advice**: Always defer tax and legal questions to professionals.
4. **No Criticism of User Choices**: Frame gaps as "opportunities" not "mistakes."
5. **Always Include Disclaimer**: Every response must acknowledge you're an AI providing educational content, not personalized advice.

## Output Format
You MUST respond in valid JSON matching this schema:
{
  "alignment": {
    "score": number (0-100, how well portfolio matches the philosophy),
    "summary": string (1-2 sentences, headline of alignment),
    "strengths": string[] (2-4 things that align well),
    "gaps": string[] (0-3 areas that differ from the philosophy)
  },
  "actionPlan": [
    {
      "step": string (one concrete action, using asset classes not tickers),
      "rationale": string (why this helps alignment),
      "impact": "high" | "medium" | "low"
    }
  ],
  "philosophyInsight": string (2-3 sentences teaching something about this philosophy),
  "disclaimer": "This is AI-generated educational content, not personalized financial advice. Consult a qualified advisor before making investment decisions."
}
`;

/**
 * Philosophy context templates
 * Embeds philosophy-specific information into prompts
 */
export const PHILOSOPHY_CONTEXTS: Record<string, string> = {
    passive_indexing_bogleheads: `
Philosophy: Passive Indexing (Bogleheads-style)
Core Principles:
- Own the whole market cheaply; stay the course
- Broad diversification across global markets
- Low fees and low turnover
- Time in market > timing the market
- Rules-based rebalancing

Typical Portfolio: 60-90% broad equity index funds, 10-40% bond funds, minimal sector bets.
Key Metrics: High pct_index_funds (>75%), low expense ratios (<0.25%), low concentration (top 5 < 35%).
`,

    factor_investing: `
Philosophy: Factor Investing (Value/Size/Quality/Momentum)
Core Principles:
- Tilt toward compensated factors with disciplined rules
- Harvest long-run factor premia via rules-based funds
- Diversify across factors; avoid performance chasing
- Stay consistent through factor droughts

Typical Portfolio: Small-cap value ETFs, quality/min-vol ETFs, multi-factor funds.
Key Metrics: Meaningful factor tilts (|tilt| >= 0.35), still diversified implementation.
`,

    dividend_growth_income: `
Philosophy: Dividend Growth / Income
Core Principles:
- Prefer steady distributions and dividend growth
- Emphasize yield and/or dividend growth
- Often favors quality, profitability, lower volatility
- May trade off growth for income stability

Typical Portfolio: Dividend ETFs, covered-call ETFs, dividend aristocrats.
Key Metrics: Value tilt >= 0.30, quality or low-vol tilt, equity focus.
`,

    risk_parity_all_weather: `
Philosophy: Risk Parity / All-Weather
Core Principles:
- Balance risk contributions across assets
- Use multiple asset classes (stocks, bonds, commodities, gold)
- Aim for resilient performance across inflation/growth regimes
- Often uses duration and sometimes leverage

Typical Portfolio: Balanced stocks/bonds/commodities/gold, may use leverage.
Key Metrics: Bonds >= 25%, real assets >= 10%, equity <= 65%.
`,

    barbell_antifragile: `
Philosophy: Barbell / Antifragile (Taleb-style)
Core Principles:
- Very safe core + small high-upside tail
- Large allocation to safe assets (cash/short bills)
- Small allocation to highly convex, high-variance bets
- Avoid fragile middle-risk exposures

Typical Portfolio: 50%+ in cash/bonds, small crypto/speculative equity sleeve.
Key Metrics: Cash + bonds >= 50%, some convex tail exposure.
`,

    time_to_financial_freedom: `
Philosophy: Time to Financial Freedom
Core Principles:
- Focus on savings rate and net worth trajectory
- Any allocation can work—discipline matters most
- Measure progress toward 'FI number' (25× annual expenses)
- Style-agnostic, outcome-first

Key Metrics: Savings rate, years to FI, current net worth vs target.
`,
};

/**
 * Build the complete prompt for a coaching request
 */
export function buildPrompt(
    philosophyId: string,
    holdings: { ticker: string; weight: number }[],
    netWorthCAD: number,
    yearsToFI: number,
    topPhilosophies: { id: string; score: number; displayName: string }[],
    goals: { currentAge: number; retirementAge: number; savingsRate: number }
): string {
    const philosophyContext = PHILOSOPHY_CONTEXTS[philosophyId] ||
        `Philosophy: ${philosophyId}\n(No specific context available)`;

    const holdingsStr = holdings
        .slice(0, 15) // Limit to top 15 for token efficiency
        .map(h => `${h.ticker}: ${(h.weight * 100).toFixed(1)}%`)
        .join(', ');

    const topPhiloStr = topPhilosophies
        .slice(0, 3)
        .map(p => `${p.displayName} (score: ${p.score})`)
        .join(', ');

    return `${SYSTEM_PROMPT}

## Target Philosophy
${philosophyContext}

## User's Portfolio Context
- **Net Worth (CAD)**: $${netWorthCAD.toLocaleString()}
- **Years to Financial Independence**: ${yearsToFI < 0 ? 'Already FI!' : yearsToFI.toFixed(1)}
- **Current Age**: ${goals.currentAge}
- **Target Retirement Age**: ${goals.retirementAge}
- **Savings Rate**: ${(goals.savingsRate * 100).toFixed(0)}%
- **Top Holdings**: ${holdingsStr || 'None provided'}
- **Detected Philosophies**: ${topPhiloStr || 'None detected'}

## Your Task
Analyze how well this portfolio aligns with "${philosophyId}" and provide educational coaching. Remember to respond ONLY in the JSON format specified above.`;
}
