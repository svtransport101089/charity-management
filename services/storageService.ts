import { Donation, Expense, Campaign } from '../types';

const STORAGE_KEYS = {
  EXPENSES: 'charity_app_expenses',
  DONATIONS: 'charity_app_donations',
  CAMPAIGNS: 'charity_app_campaigns',
};

// Helper to trigger update event
const notifyListeners = () => {
  window.dispatchEvent(new Event('charity-data-change'));
};

export const StorageService = {
  // --- Expenses ---
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  addExpense: (expense: Expense) => {
    const expenses = StorageService.getExpenses();
    const newExpenses = [expense, ...expenses];
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));
    notifyListeners();
    return newExpenses;
  },

  deleteExpense: (id: string) => {
    const expenses = StorageService.getExpenses();
    const newExpenses = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));
    notifyListeners();
    return newExpenses;
  },

  // --- Donations ---
  getDonations: (): Donation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    // Seed some initial data if empty
    if (!data) {
      const initial: Donation[] = [
        { id: '1', donorName: 'Alice Smith', amount: 5000, message: 'Keep up the good work!', date: new Date().toISOString(), campaignId: 'c1' },
        { id: '2', donorName: 'Bob Jones', amount: 2500, message: 'For the children.', date: new Date(Date.now() - 86400000).toISOString(), campaignId: 'c2' },
      ];
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  addDonation: (donation: Donation) => {
    const donations = StorageService.getDonations();
    const newDonations = [donation, ...donations];
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(newDonations));
    notifyListeners();
    return newDonations;
  },

  // --- Campaigns ---
  getCampaigns: (): Campaign[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (!data) {
      const initial: Campaign[] = [
        { 
          id: 'c1', 
          name: 'Education for All 2025', 
          description: 'Providing textbooks and uniforms for 500 underprivileged students.', 
          targetAmount: 500000, 
          status: 'Active', 
          startDate: new Date().toISOString() 
        },
        { 
          id: 'c2', 
          name: 'Winter Relief Fund', 
          description: 'Distributing blankets and warm food to homeless shelters.', 
          targetAmount: 200000, 
          status: 'Active', 
          startDate: new Date(Date.now() - 604800000).toISOString() 
        },
        { 
          id: 'c3', 
          name: 'Community Health Camp', 
          description: 'Free medical checkups in rural areas.', 
          targetAmount: 150000, 
          status: 'Paused', 
          startDate: new Date(Date.now() - 1209600000).toISOString() 
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  addCampaign: (campaign: Campaign) => {
    const campaigns = StorageService.getCampaigns();
    const newCampaigns = [campaign, ...campaigns];
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(newCampaigns));
    notifyListeners();
    return newCampaigns;
  }
};
