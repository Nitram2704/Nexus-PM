import apiClient from '@/lib/apiClient'

export interface Notification {
  id: string
  type: 'task_assigned' | 'task_moved' | 'task_comment' | 'custom_alert'
  title: string
  content: string
  link?: string
  is_read: boolean
  created_at: string
  created_at_human: string
}

export const getNotificationsApi = () => 
  apiClient.get<Notification[]>('/v1/notifications/').then(r => r.data)

export const markNotificationAsReadApi = (id: string) => 
  apiClient.post(`/v1/notifications/${id}/read/`).then(r => r.data)

export const markAllNotificationsAsReadApi = () => 
  apiClient.post('/v1/notifications/mark-all-read/').then(r => r.data)
