import apiClient from '@/lib/apiClient'

export interface Task {
  id: number
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  order: number
  column: number
  assignee?: any
  history: any[]
}

export interface Column {
  id: number
  name: string
  order: number
  wip_limit: number
  tasks: Task[]
}

export interface Project {
  id: number
  name: string
  key: string
  description: string
  columns: Column[]
}

export const getProjectDetailApi = (id: string | number) =>
  apiClient.get<Project>(`/projects/${id}/`)

export const moveTaskApi = (taskId: number, columnId: number, order?: number) =>
  apiClient.patch(`/tasks/${taskId}/move/`, { column_id: columnId, order })
