export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  status: 'Active' | 'Completed' | 'Paused';
  startDate: string;
  endDate?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  campaignId?: string; // Optional link to a campaign
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  message: string;
  date: string;
  campaignId?: string; // Optional link to a campaign
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  CAMPAIGNS = 'campaigns',
  DONATE = 'donate',
  EXPENSES = 'expenses',
}
