export interface Expense {
  id: string;
  date: string;
  payee: string;
  amount: number;
  category?: string;
  source: 'Wealthsimple';
}
