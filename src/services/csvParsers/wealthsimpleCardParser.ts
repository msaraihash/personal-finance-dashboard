import Papa from 'papaparse';
import type { Expense } from '../../types/Expense';

interface WealthsimpleCardRow {
    transaction_date: string;
    post_date: string;
    type: string;
    details: string;
    amount: string;
    currency: string;
}

export const parseWealthsimpleCardCSV = (content: string): Expense[] => {
    const results = Papa.parse<WealthsimpleCardRow>(content, {
        header: true,
        skipEmptyLines: true,
    });

    console.log('[WealthsimpleCardParser] Parsed CSV:', {
        meta: results.meta,
        errors: results.errors,
        rowCount: results.data.length,
        firstRow: results.data[0],
    });

    const expenses: Expense[] = [];

    for (const row of results.data) {
        // Basic validation
        if (!row.transaction_date || !row.details || !row.amount) {
            continue;
        }

        // Generate a simple ID (hash the key fields for deduplication)
        const id = btoa(`${row.transaction_date}-${row.details}-${row.amount}-${Math.random()}`);

        expenses.push({
            id,
            date: row.transaction_date,
            payee: row.details,
            amount: parseFloat(row.amount),
            source: 'Wealthsimple',
        });
    }

    return expenses;
};
