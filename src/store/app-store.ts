import { create } from 'zustand';
import type { ReceiptType } from '../types';

interface AppState {
  // Filters
  selectedTypes: Set<ReceiptType>;
  searchQuery: string;
  yearRange: [number, number];
  
  // Actions
  toggleType: (type: ReceiptType) => void;
  setSearchQuery: (query: string) => void;
  setYearRange: (range: [number, number]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedTypes: new Set<ReceiptType>(),
  searchQuery: '',
  yearRange: [2013, 2024],

  toggleType: (type) => set((state) => {
    const newSet = new Set(state.selectedTypes);
    if (newSet.has(type)) newSet.delete(type);
    else newSet.add(type);
    return { selectedTypes: newSet };
  }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setYearRange: (yearRange) => set({ yearRange })
}));
