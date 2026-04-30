import apiClient from '@/lib/apiClient'
import type { Project, ProjectAnalytics } from '@/types/project'

export const getProjectDetailApi = (id: string) =>
  apiClient.get<Project>(`/v1/projects/${id}/`)

export const getProjectAnalyticsApi = (id: string) =>
  apiClient.get<ProjectAnalytics>(`/v1/projects/${id}/analytics/`)

export const moveTaskApi = (taskId: string, columnId: string) =>
  apiClient.post(`/v1/tasks/${taskId}/move/`, { column: columnId })
