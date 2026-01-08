
import { describe, it, expect } from 'vitest';
import { evaluateRule, transpileRule } from '../services/ruleEvaluator';

describe('RuleEvaluator', () => {

    const ctx = {
        pct_equity: 0.8,
        pct_bonds: 0.2,
        tilt_value: 0.5,
        tilt_momentum: -0.1,
        rebalance_frequency: 'monthly',
        n_positions: 10,
        uses_options: false
    };

    describe('Transpilation', () => {
        it('transpiles simple comparison', () => {
            const rule = 'pct_equity >= 0.75';
            const js = transpileRule(rule);
            expect(js).toContain('ctx.pct_equity >= 0.75');
        });

        it('transpiles logic operators', () => {
            const rule = 'pct_equity > 0.5 and pct_bonds < 0.5';
            const js = transpileRule(rule);
            expect(js).toContain('&&');
        });

        it('transpiles "between"', () => {
            const rule = 'pct_equity between 0.50 and 0.95';
            const js = transpileRule(rule);
            expect(js).toContain('ctx.pct_equity >= 0.50');
            expect(js).toContain('ctx.pct_equity <= 0.95');
        });

        it('transpiles "in [list]"', () => {
            const rule = 'rebalance_frequency in [monthly, quarterly]';
            const js = transpileRule(rule);
            expect(js).toContain('.includes(ctx.rebalance_frequency)');
            expect(js).toContain('"monthly"');
        });

        it('transpiles abs() function', () => {
            const rule = 'abs(tilt_value) >= 0.35';
            const js = transpileRule(rule);
            expect(js).toContain('Math.abs(ctx.tilt_value)');
        });
    });

    describe('Evaluation', () => {
        it('evaluates true condition', () => {
            expect(evaluateRule('pct_equity > 0.5', ctx)).toBe(true);
        });

        it('evaluates false condition', () => {
            expect(evaluateRule('pct_equity < 0.5', ctx)).toBe(false);
        });

        it('evaluates complex logic', () => {
            expect(evaluateRule('pct_equity > 0.5 and tilt_value > 0.2', ctx)).toBe(true);
        });

        it('evaluates "between" logic', () => {
            expect(evaluateRule('pct_equity between 0.70 and 0.90', ctx)).toBe(true);
            expect(evaluateRule('pct_equity between 0.85 and 0.90', ctx)).toBe(false);
        });

        it('evaluates "in" logic', () => {
            expect(evaluateRule('rebalance_frequency in [monthly, annual]', ctx)).toBe(true);
            expect(evaluateRule('rebalance_frequency in [annual, ad_hoc]', ctx)).toBe(false);
        });

        it('evaluates abs() logic', () => {
            expect(evaluateRule('abs(tilt_value) > 0.2', ctx)).toBe(true);
        });

        it('handles variable matching correctly (prefixes)', () => {
            expect(evaluateRule('n_positions >= 5', ctx)).toBe(true);
        });
    });
});
