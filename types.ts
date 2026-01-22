export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  date: string;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  DONATE = 'donate',
  EXPENSES = 'expenses',
}
