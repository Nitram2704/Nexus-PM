import { create } from 'zustand';
import api from '@/lib/apiClient';

interface ForesightIndicator {
  time_elapsed_pct: number;
  work_completed_pct: number;
  overloaded_members: Array<{email: string, task_count: number}>;
  total_points: number;
  completed_points: number;
}

interface ForesightData {
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  risk_index: number;
  indicators: ForesightIndicator;
  ai_recommendation: string;
}

interface ForesightState {
  data: ForesightData | null;
  isLoading: boolean;
  error: string | null;
  fetchForesight: (projectId: string) => Promise<void>;
}

export const useForesightStore = create<ForesightState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchForesight: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/v1/projects/${projectId}/ai/foresight/`);
      set({ data: response.data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching foresight data'
      set({ error: message, isLoading: false });
    }
  },
}));
