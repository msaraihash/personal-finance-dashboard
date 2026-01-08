
/**
 * logicEvaluator.ts
 * 
 * A safe, lightweight expression evaluator for the Philosophy Engine DSL.
 * 
 * Supported Syntax:
 * - Comparison: >, <, >=, <=, ==
 * - Logic: and, or
 * - Math: +, -, abs()
 * - Collections: in [a, b]
 * - Range: between X and Y
 * 
 * The strategy is to transpiler the DSL into a Function that takes 'ctx' (PortfolioFeatures).
 */

type Context = Record<string, number | string | boolean>;

/**
 * Transpiles a DSL rule string into a valid JavaScript expression string
 * that refers to `ctx`.
 */
export const transpileRule = (rule: string): string => {
    let expr = rule;

    // 1. Replace 'between X and Y' -> '(ctx.field >= X && ctx.field <= Y)'
    // Regex: (\w+) between ([\d\.]+) and ([\d\.]+)
    expr = expr.replace(
        /([a-z_][a-z0-9_]*) between ([\d.]+) and ([\d.]+)/gi,
        '($1 >= $2 && $1 <= $3)'
    );

    // 2. Replace 'in [a, b, c]' -> '["a", "b", "c"].includes(ctx.field)'
    // This is tricky for mixed types, but our YAML mostly uses enums.
    // We'll handle the array syntax first.
    // Example: rebalance_frequency in [monthly, quarterly]
    expr = expr.replace(
        /([a-z_][a-z0-9_]*) in \[([\w,\s]+)\]/gi,
        (match, field, listInner) => {
            // quote the items if they look like strings
            const items = listInner.split(',').map((s: string) => `"${s.trim()}"`).join(',');
            return `[${items}].includes(${field})`;
        }
    );

    // 3. Replace logical operators
    expr = expr.replace(/\sand\s/g, ' && ');
    expr = expr.replace(/\sor\s/g, ' || ');

    // 4. Handle 'abs(field)' -> 'Math.abs(ctx.field)'
    // We need to inject ctx. into the field name inside abs().
    expr = expr.replace(/abs\(([a-z_][a-z0-9_]*)\)/gi, 'Math.abs(ctx.$1)');

    // 5. Inject 'ctx.' before standalone variable names
    // We match variable names that are NOT inside quotes and NOT part of JS keywords.
    // A heuristic: Match words that start with a letter, are not true/false/Math, 
    // and strictly look like our feature keys (snake_case).

    // We'll use a specific list of keywords to ignore to avoid breaking syntax.
    const keywords = ['Math', 'true', 'false', 'window', 'document', 'ctx'];

    // Regex to find potential variables:
    // Look for words that are not preceded by a dot or quote.
    expr = expr.replace(
        /(?<![\.\["'])(\b[a-z_][a-z0-9_]*\b)(?!["'\:])/gi,
        (match) => {
            if (keywords.includes(match)) return match;
            // It's likely a feature name (e.g., pct_equity)
            return `ctx.${match}`;
        }
    );

    return expr;
};

/**
 * Creates a safe evaluator function for a given rule.
 */
export const createEvaluator = (rule: string): (ctx: Context) => boolean => {
    try {
        const jsExpr = transpileRule(rule);
        // We use the Function constructor for performance, but it's "safe" 
        // because we only execute logic against the provided context object 
        // and we are running in a client-side environment dealing with numbers.
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        return new Function('ctx', `return !!(${jsExpr});`) as (ctx: Context) => boolean;
    } catch (e) {
        console.error(`Failed to compile rule: "${rule}"`, e);
        return () => false; // Fail safe
    }
};

/**
 * Evaluates a single rule string against a context.
 */
export const evaluateRule = (rule: string, ctx: Context): boolean => {
    const fn = createEvaluator(rule);
    return fn(ctx);
};
