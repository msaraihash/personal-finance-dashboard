import Papa from 'papaparse';
import type { Holding, Currency, AssetClass } from '../types';

export const SPECULATIVE_TICKERS = ['BTC', 'ASTS', 'IREN', 'PLTR', 'RKLB'];
export const CASH_EQUIVALENTS = ['UBIL.U', 'FDRXX', 'CASH.TO', 'PSA.TO', 'FDRXX**'];

interface WS_Row {
    'Account Name': string;
    'Account Type': string;
    'Symbol': string;
    'Name': string;
    'Quantity': string;
    'Market Price': string;
    'Market Price Currency': string;
    'Market Value': string;
    'Account Number': string;
    'Market Value Currency': string;
    'Security Type': string;
}

interface Fidelity_Row {
    'Account Number': string;
    'Account Name': string;
    'Symbol': string;
    'Description': string;
    'Quantity': string;
    'Last Price': string;
    'Current Value': string;
    'Type': string;
}

export const parseWealthsimpleCSV = (csvContent: string): Holding[] => {
    const results = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    const data = results.data as WS_Row[];

    return data
        .filter(row => row.Symbol || (row.Name && row.Name.toLowerCase().includes('cash')))
        .map(row => {
            const ticker = row.Symbol ? row.Symbol.split('.')[0] : 'CASH';
            const value = parseFloat(row['Market Value'].replace(/[$,]/g, ''));
            const currency = row['Market Value Currency'] as Currency;

            let assetClass: AssetClass = 'Equity';
            if (!row.Symbol || CASH_EQUIVALENTS.includes(row.Symbol) || row.Name.toLowerCase().includes('cash')) {
                assetClass = 'Cash';
            } else if (SPECULATIVE_TICKERS.includes(ticker) || row['Account Name'].includes('Asymmetric Risk') || row['Security Type'] === 'CRYPTOCURRENCY') {
                assetClass = 'Speculative';
            } else if (row.Symbol === 'XEQT') {
                assetClass = 'Equity';
            }

            return {
                id: crypto.randomUUID(),
                ticker: row.Symbol,
                name: row.Name,
                shares: parseFloat(row.Quantity),
                marketPrice: parseFloat(row['Market Price']),
                marketValue: value,
                currency,
                assetClass,
                source: 'Wealthsimple',
                accountName: row['Account Name'],
                accountType: row['Account Type'],
                accountNumber: row['Account Number'],
                lastUpdated: new Date().toISOString()
            };
        });
};

export const parseFidelityCSV = (csvContent: string): Holding[] => {
    const lines = csvContent.split('\n');
    const headerIdx = lines.findIndex(l => l.includes('Account Number,Account Name,Symbol'));
    if (headerIdx === -1) return [];

    const relevantContent = lines.slice(headerIdx).join('\n');
    const results = Papa.parse(relevantContent, { header: true, skipEmptyLines: true });
    const data = results.data as Fidelity_Row[];

    return data
        .filter(row => row.Symbol || row.Description === 'HELD IN MONEY MARKET')
        .map(row => {
            const valueStr = row['Current Value'] || '0';
            const value = parseFloat(valueStr.replace(/[$,]/g, ''));
            const ticker = row.Symbol || (row.Description === 'HELD IN MONEY MARKET' ? 'CASH' : 'UNKNOWN');

            let assetClass: AssetClass = 'Equity';
            if (CASH_EQUIVALENTS.includes(ticker) || row.Description.includes('MONEY MARKET')) {
                assetClass = 'Cash';
            } else if (SPECULATIVE_TICKERS.includes(ticker)) {
                assetClass = 'Speculative';
            } else if (ticker === 'FXAIX' || ticker === 'FSKAX' || ticker === 'FZROX') {
                assetClass = 'Equity';
            }

            return {
                id: crypto.randomUUID(),
                ticker,
                name: row.Description,
                shares: parseFloat(row.Quantity || '0'),
                marketPrice: parseFloat(row['Last Price']?.replace(/[$,]/g, '') || '0'),
                marketValue: value,
                currency: 'USD',
                assetClass,
                source: 'Fidelity',
                accountName: row['Account Name'],
                accountType: 'Brokerage',
                accountNumber: row['Account Number'],
                lastUpdated: new Date().toISOString()
            };
        });
};
