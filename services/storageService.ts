import { Donation, Expense } from '../types';

const STORAGE_KEYS = {
  EXPENSES: 'charity_app_expenses',
  DONATIONS: 'charity_app_donations',
};

// Helper to trigger update event
const notifyListeners = () => {
  window.dispatchEvent(new Event('charity-data-change'));
};

export const StorageService = {
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

  getDonations: (): Donation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    // Seed some initial data if empty
    if (!data) {
      const initial: Donation[] = [
        { id: '1', donorName: 'Alice Smith', amount: 5000, message: 'Keep up the good work!', date: new Date().toISOString() },
        { id: '2', donorName: 'Bob Jones', amount: 2500, message: 'For the children.', date: new Date(Date.now() - 86400000).toISOString() },
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
  }
};
