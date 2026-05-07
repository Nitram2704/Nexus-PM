import apiClient from '@/lib/apiClient';

export interface BurndownEntry {
  day: string;
  remaining: number;
  ideal: number;
}

export interface ProjectAnalytics {
  priorities: Record<string, number>;
  workload: Array<{ name: string; tasks: number }>;
  burndown: BurndownEntry[];
  velocity: number;
  cycle_time: number;
  health_score: number;
  sprint_name: string | null;
}

export const getProjectAnalytics = async (projectId: string): Promise<ProjectAnalytics> => {
  const response = await apiClient.get(`/projects/${projectId}/analytics/`);
  return response.data;
};
