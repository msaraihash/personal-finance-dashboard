/**
 * Auto-categorization service for expenses based on payee name patterns.
 */

export interface CategoryConfig {
    name: string;
    color: string;
    patterns: RegExp;
}

export const CATEGORIES: CategoryConfig[] = [
    {
        name: 'Dining',
        color: '#f472b6', // pink
        patterns: /UBER\s*EATS|SKIP\s*THE\s*DISHES|DOORDASH|RITUAL|ARTIGIANO|OJAS|TCM\s*@|TST-|STARBUCKS|TIM\s*HORTON|MCDONALD|A&W|SUBWAY|SUSHI|PIZZA|RESTAURANT|CAFE|COFFEE|BREW/i,
    },
    {
        name: 'Groceries',
        color: '#34d399', // green
        patterns: /SHOPPERS|SAVE\s*ON|GROCERY|SUPERMARKET|FARM\s*BOY|LOBLAWS|METRO|SOBEYS|COSTCO|WALMART|NO\s*FRILLS|T&T|WHOLE\s*FOODS|FIELDSTONE|RED\s*ROOSTER/i,
    },
    {
        name: 'Utilities',
        color: '#60a5fa', // blue
        patterns: /TELUS|ROGERS|BELL|FIDO|HYDRO|ENBRIDGE|FORTIS|SHAW|VIDEOTRON|KOODO|VIRGIN\s*MOBILE|FREEDOM\s*MOBILE/i,
    },
    {
        name: 'Entertainment',
        color: '#a78bfa', // purple
        patterns: /HARRY\s*POTTER|CINEPLEX|SPOTIFY|NETFLIX|DISNEY|AMAZON\s*PRIME|APPLE\s*TV|CRAVE|PARAMOUNT|HBO|YOUTUBE|TWITCH|STEAM|PLAYSTATION|XBOX|NINTENDO|THEATRE|CINEMA/i,
    },
    {
        name: 'Shopping',
        color: '#fbbf24', // amber
        patterns: /GQ\s*HERMAN|ZARA|H&M|WINNERS|MARSHALLS|HOMESENSE|SIMONS|NORDSTROM|HUDSON|INDIGO|AMAZON\.CA|BEST\s*BUY|APPLE\s*STORE|UNIQLO|GAP|OLD\s*NAVY|IKEA/i,
    },
    {
        name: 'Transport',
        color: '#fb923c', // orange
        patterns: /UBER(?!\s*EATS)|LYFT|PRESTO|TRANSIT|PARKING|PETRO|ESSO|SHELL|CANADIAN\s*TIRE\s*GAS|CAR2GO|EVO\s*CAR|ZIPCAR/i,
    },
    {
        name: 'Health',
        color: '#f87171', // red
        patterns: /PHARMACY|DRUG\s*MART|REXALL|DENTIST|DOCTOR|CLINIC|HOSPITAL|PHYSIO|CHIRO|OPTOM|MEDICAL|HEALTH|GYM|FITNESS|YOGA/i,
    },
];

export const CATEGORY_COLORS: Record<string, string> = {
    Dining: '#f472b6',
    Groceries: '#34d399',
    Utilities: '#60a5fa',
    Entertainment: '#a78bfa',
    Shopping: '#fbbf24',
    Transport: '#fb923c',
    Health: '#f87171',
    Other: '#94a3b8',
};

/**
 * Auto-categorize an expense based on payee name.
 */
export function categorizeExpense(payee: string): string {
    for (const category of CATEGORIES) {
        if (category.patterns.test(payee)) {
            return category.name;
        }
    }
    return 'Other';
}
