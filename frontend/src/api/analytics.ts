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

export interface HUDMetric {
  id: string;
  date: string;
  velocity: number;
  throughput: number;
  cycle_time_avg: number;
  flow_efficiency: number;
  active_tasks_count: number;
  completed_tasks_count: number;
}

export const getHudAnalytics = async (projectId: string): Promise<HUDMetric[]> => {
  const response = await apiClient.get(`/projects/${projectId}/hud_analytics/`);
  return response.data;
};
