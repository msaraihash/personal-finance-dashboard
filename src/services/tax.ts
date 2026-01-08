
// Ontario & Federal Tax Brackets for 2025 (Estimates)
// Source: Canada.ca, Taxtips.ca (as of Jan 2026 simulation)

export interface TaxBracket {
    min: number;
    max: number;
    rate: number;
}

// Federal Brackets 2025
const FEDERAL_BRACKETS: TaxBracket[] = [
    { min: 0, max: 57375, rate: 0.145 }, // Reduced rate 14.5% approx
    { min: 57375, max: 114750, rate: 0.205 },
    { min: 114750, max: 177882, rate: 0.26 },
    { min: 177882, max: 253414, rate: 0.29 },
    { min: 253414, max: Infinity, rate: 0.33 },
];

// Ontario Brackets 2025
const ONTARIO_BRACKETS: TaxBracket[] = [
    { min: 0, max: 52886, rate: 0.0505 },
    { min: 52886, max: 105775, rate: 0.0915 },
    { min: 105775, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Infinity, rate: 0.1316 },
];

// Ontario Surtax 2025 (Approx thresholds)
// Surtax is calculated on the Ontario PROVINCIAL tax payable (before credits ideally, but simplified here)
const ONTARIO_SURTAX_1_THRESHOLD = 5554; // Tax payable threshold for 20%
const ONTARIO_SURTAX_2_THRESHOLD = 7108; // Tax payable threshold for 36% (additional)

// Basic Personal Amount (BPA) 2025 (Simplified)
const FEDERAL_BPA = 15705;
const ONTARIO_BPA = 12781; // Approx

/**
 * Calculates the estimated effective tax rate for a single filer in Ontario.
 * Includes Federal Tax, Provincial Tax, and Ontario Surtax.
 * Ignores CPP/EI for simplicity in "Income Tax" rate, but effective rate often conflates them in user minds.
 * For strictly "Tax Rate" valid for investment growth deduction, we usually mean Income Tax.
 * 
 * @param grossIncome - Annual gross income
 * @returns effective rate (0.0 - 1.0)
 */
export const calculateOntarioTax = (grossIncome: number): number => {
    if (grossIncome <= 0) return 0;

    // 1. Federal Tax
    let fedTax = 0;
    for (const b of FEDERAL_BRACKETS) {
        if (grossIncome > b.min) {
            const taxableInBracket = Math.min(grossIncome, b.max) - b.min;
            fedTax += taxableInBracket * b.rate;
        }
    }
    // Fed Non-refundable credit (BPA only for simplicity)
    const fedCredit = FEDERAL_BPA * 0.15;
    fedTax = Math.max(0, fedTax - fedCredit);

    // 2. Ontario Tax
    let provTax = 0;
    for (const b of ONTARIO_BRACKETS) {
        if (grossIncome > b.min) {
            const taxableInBracket = Math.min(grossIncome, b.max) - b.min;
            provTax += taxableInBracket * b.rate;
        }
    }
    // Prov Non-refundable credit (BPA only)
    const provCredit = ONTARIO_BPA * 0.0505;
    let basicProvTax = Math.max(0, provTax - provCredit);

    // 3. Ontario Surtax
    // 20% on tax over ~5.5k
    // 36% on tax over ~7.1k
    let surtax = 0;
    if (basicProvTax > ONTARIO_SURTAX_1_THRESHOLD) {
        surtax += (basicProvTax - ONTARIO_SURTAX_1_THRESHOLD) * 0.20;
    }
    if (basicProvTax > ONTARIO_SURTAX_2_THRESHOLD) {
        surtax += (basicProvTax - ONTARIO_SURTAX_2_THRESHOLD) * 0.36;
    }

    // Total Provincial
    const totalProvTax = basicProvTax + surtax;

    // Ontario Health Premium (OHP) - Simplified lookup
    // Up to $20k: 0
    // ...scales up to ~$900 for >200k
    let ohp = 0;
    if (grossIncome > 200000) ohp = 900; // Cap approx
    else if (grossIncome > 20000) ohp = (grossIncome - 20000) * 0.06; // Rough estimate blending bands
    // Clamp OHP to strict bands if needed, but linear appx ok for estimation
    // Actually, let's use a slightly better approximation or simple bands
    if (grossIncome <= 20000) ohp = 0;
    else if (grossIncome <= 36000) ohp = Math.min(300, (grossIncome - 20000) * 0.06);
    else if (grossIncome <= 48000) ohp = Math.min(450, 300 + (grossIncome - 36000) * 0.06);
    else if (grossIncome <= 72000) ohp = Math.min(600, 450 + (grossIncome - 48000) * 0.25);
    else if (grossIncome <= 200000) ohp = Math.min(750, 600 + (grossIncome - 72000) * 0.25);
    else ohp = Math.min(900, 750 + (grossIncome - 200000) * 0.25);

    const totalTax = fedTax + totalProvTax + ohp;

    return totalTax / grossIncome;
};
