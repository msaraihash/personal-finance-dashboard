import { describe, it, expect } from 'vitest';
import { parseWealthsimpleCardCSV } from './wealthsimpleCardParser';

describe('wealthsimpleCardParser', () => {
    it('parses a valid CSV correctly', () => {
        const csv = `"transaction_date","post_date","type","details","amount","currency"
"2023-10-01","2023-10-02","Purchase","UBER EATS","25.50","CAD"
"2023-10-03","2023-10-04","Payment","PAYMENT THANK YOU","-500.00","CAD"
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
        const csv = `"transaction_date","post_date","type","details","amount","currency"
"2023-10-01","2023-10-02","Purchase","VALID","10.00","CAD"
,,,,,
"2023-10-05","","","","","CAD"
`;
        const expenses = parseWealthsimpleCardCSV(csv);
        expect(expenses).toHaveLength(1);
        expect(expenses[0].payee).toBe('VALID');
    });
});
