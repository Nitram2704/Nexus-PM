import apiClient from '@/lib/apiClient'
import type { Project } from '@/types/project'

export const getProjectDetailApi = (id: string) =>
  apiClient.get<Project>(`/v1/projects/${id}/`)

export const moveTaskApi = (taskId: string, columnId: string) =>
  apiClient.post(`/v1/tasks/${taskId}/move/`, { column: columnId })
