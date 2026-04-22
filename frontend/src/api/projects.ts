import apiClient from '@/lib/apiClient'

export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'feature' | 'bug' | 'task' | 'story'
  key: string
  assignee?: any
}

export interface Column {
  id: string
  name: string
  position: number
  is_done_column: boolean
  tasks: Task[]
}

export interface Project {
  id: string
  name: string
  key: string
  description: string
  columns: Column[]
}

export const getProjectDetailApi = (id: string) =>
  apiClient.get<Project>(`/v1/projects/${id}/`)

export const moveTaskApi = (taskId: string, columnId: string) =>
  apiClient.post(`/v1/tasks/${taskId}/move/`, { column: columnId })
