import apiClient from '@/lib/apiClient'
import type { Sprint } from '@/types/project'

export const getSprintsApi = (projectId: string) =>
  apiClient.get<Sprint[]>(`/v1/sprints/?project=${projectId}`)

export const createSprintApi = (data: Partial<Sprint>) =>
  apiClient.post<Sprint>('/v1/sprints/', data)

export const startSprintApi = (sprintId: string) =>
  apiClient.post<Sprint>(`/v1/sprints/${sprintId}/start/`)

export const completeSprintApi = (sprintId: string, incompleteAction: 'backlog' | 'next' = 'backlog') =>
  apiClient.post<Sprint>(`/v1/sprints/${sprintId}/complete/`, { incomplete_action: incompleteAction })
