import { create } from 'zustand';

interface UIState {
  isIntelligenceOpen: boolean;
  activeContext: 'global' | 'project' | 'analytics';
  currentProjectId: string | null;

  toggleIntelligence: (open?: boolean) => void;
  setContext: (context: 'global' | 'project' | 'analytics', projectId?: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isIntelligenceOpen: false,
  activeContext: 'global',
  currentProjectId: null,

  toggleIntelligence: (open) => set((state) => ({ 
    isIntelligenceOpen: open !== undefined ? open : !state.isIntelligenceOpen 
  })),

  setContext: (context, projectId = null) => set({ 
    activeContext: context, 
    currentProjectId: projectId 
  }),
}));
