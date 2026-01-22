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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  groundingSources?: Array<{ uri: string; title: string }>;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  DONATE = 'donate',
  EXPENSES = 'expenses',
  AI_CHAT = 'ai-chat',
  CREATIVE_STUDIO = 'creative-studio',
  ANALYSIS = 'analysis',
}

export interface VideoGenerationConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}