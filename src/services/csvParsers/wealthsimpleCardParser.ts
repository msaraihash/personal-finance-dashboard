import Papa from 'papaparse';
import { Expense } from '../../types/Expense';

interface WealthsimpleCardRow {
    'Transaction Date': string;
    'Posted Date': string;
    'Description': string;
    'Amount': string;
}

export const parseWealthsimpleCardCSV = (content: string): Expense[] => {
    const results = Papa.parse<WealthsimpleCardRow>(content, {
        header: true,
        skipEmptyLines: true,
    });

    const expenses: Expense[] = [];

    for (const row of results.data) {
        // Basic validation
        if (!row['Transaction Date'] || !row['Description'] || !row['Amount']) {
            continue;
        }

        // Generate a simple ID (in a real app, maybe hash fields)
        const id = btoa(`${row['Transaction Date']}-${row['Description']}-${row['Amount']}-${Math.random()}`);

        // Parse Amount (Wealthsimple CSVs usually have positive for spend, negative for payments/refunds? 
        // Wait, usually CC statements are: Positive = Charge, Negative = Payment.
        // Let's assume standard behavior. We want "Expenses" to be positive numbers for display usually, 
        // but data-wise, keeping it raw is safer, OR normalizing.
        // Let's normalize: If it's a credit card, a positive amount is debt/spend. 
        // We will store it as number.

        expenses.push({
            id,
            date: row['Transaction Date'],
            payee: row['Description'],
            amount: parseFloat(row['Amount']),
            source: 'Wealthsimple',
        });
    }

    return expenses;
};
