import apiClient from '@/lib/apiClient'
import type { Task, Comment } from '@/types/project'

export const getTasksApi = (projectId: string, sprintId?: string | null) => {
  let url = `/v1/tasks/?project=${projectId}`
  if (sprintId !== undefined) {
    url += sprintId ? `&sprint=${sprintId}` : '&sprint=null'
  }
  return apiClient.get<Task[]>(url)
}

export const createTaskApi = (data: Partial<Task>) =>
  apiClient.post<Task>('/v1/tasks/', data)

export const updateTaskApi = (taskId: string, data: Partial<Task>) =>
  apiClient.patch<Task>(`/v1/tasks/${taskId}/`, data)

export const moveTaskApi = (taskId: string, columnId: string) =>
  apiClient.post<Task>(`/v1/tasks/${taskId}/move/`, { column: columnId })

export const getTaskCommentsApi = (taskId: string) =>
  apiClient.get<Comment[]>(`/v1/comments/?task=${taskId}`)

export const addCommentApi = (taskId: string, content: string) =>
  apiClient.post<Comment>('/v1/comments/', { task: taskId, content })
