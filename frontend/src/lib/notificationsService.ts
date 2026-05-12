import apiClient from './apiClient'

export interface Notification {
  id: string
  title: string
  message: string
  task: string | null
  task_key: string | null
  actor: string | null
  actor_name: string | null
  is_read: boolean
  created_at: string
}

export const notificationsService = {
  getNotifications: async () => {
    const response = await apiClient.get<Notification[]>('/notifications/')
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post(`/notifications/${id}/mark_as_read/`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark_all_as_read/')
    return response.data
  }
}
