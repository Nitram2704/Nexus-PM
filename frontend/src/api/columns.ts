import apiClient from '@/lib/apiClient'

export const renameColumnApi = (columnId: string, name: string) =>
  apiClient.patch(`/v1/columns/${columnId}/`, { name })

export const clearColumnTasksApi = (columnId: string) =>
  apiClient.post(`/v1/columns/${columnId}/clear_tasks/`)

export const moveAllTasksApi = (columnId: string, targetColumnId: string) =>
  apiClient.post(`/v1/columns/${columnId}/move_all/`, { target_column_id: targetColumnId })

export const deleteColumnApi = (columnId: string) =>
  apiClient.delete(`/v1/columns/${columnId}/`)

export const reorderTasksApi = (columnId: string, taskIds: string[]) =>
  apiClient.post(`/v1/columns/${columnId}/reorder_tasks/`, { task_ids: taskIds })

export const createColumnApi = (projectId: string, name: string) =>
  apiClient.post(`/v1/columns/`, { project: projectId, name })

export const reorderColumnsApi = (projectId: string, columnIds: string[]) =>
  apiClient.post(`/v1/projects/${projectId}/reorder_columns/`, { column_ids: columnIds })

