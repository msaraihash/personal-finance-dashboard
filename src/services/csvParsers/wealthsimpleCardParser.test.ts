import { describe, it, expect } from 'vitest';
import { parseWealthsimpleCardCSV } from './wealthsimpleCardParser';

describe('wealthsimpleCardParser', () => {
    it('parses a valid CSV correctly', () => {
        const csv = `Transaction Date,Posted Date,Description,Amount
2023-10-01,2023-10-02,UBER EATS,25.50
2023-10-03,2023-10-04,PAYMENT THANK YOU,-500.00
`;
        const expenses = parseWealthsimpleCardCSV(csv);

        expect(expenses).toHaveLength(2);

        expect(expenses[0].date).toBe('2023-10-01');
        expect(expenses[0].payee).toBe('UBER EATS');
        expect(expenses[0].amount).toBe(25.50);
        expect(expenses[0].source).toBe('Wealthsimple');

        expect(expenses[1].payee).toBe('PAYMENT THANK YOU');
        expect(expenses[1].amount).toBe(-500.00);
    });

    it('ignores empty lines and missing fields', () => {
        const csv = `Transaction Date,Posted Date,Description,Amount
2023-10-01,2023-10-02,VALID,10.00
,,,
2023-10-05,,Broken,
`;
        const expenses = parseWealthsimpleCardCSV(csv);
        expect(expenses).toHaveLength(1);
        expect(expenses[0].payee).toBe('VALID');
    });
});
