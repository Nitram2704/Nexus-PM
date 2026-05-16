import { create } from 'zustand'
import apiClient from '@/lib/apiClient'

export interface Notification {
  id: string
  type: string
  title: string
  content: string
  link?: string
  is_read: boolean
  created_at: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  fetchInitial: () => Promise<void>
  connectSSE: () => void
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  fetchInitial: async () => {
    try {
      const { data } = await apiClient.get('/v1/notifications/')
      set({ 
        notifications: data,
        unreadCount: data.filter((n: Notification) => !n.is_read).length
      })
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  },

  connectSSE: () => {
    if (get().isConnected) return

    // Note: EventSource doesn't support Authorization header natively in browser.
    // In a real app with JWT, we either append token to URL ?token=... or use fetch-event-source
    // For simplicity locally, assuming cookies or ignoring auth for stream, 
    // or using a library like @microsoft/fetch-event-source.
    // Let's implement a standard fallback polling if EventSource auth is strictly JWT.
    // For local Nexus: we'll just poll every 5s to avoid auth issues with EventSource.
    
    set({ isConnected: true })
    setInterval(async () => {
      await get().fetchInitial()
    }, 5000)
    
    // NOTE: If using true EventSource, it would look like:
    /*
    const source = new EventSource('http://localhost:8000/api/notifications/stream/')
    source.onmessage = (e) => {
       const newNots = JSON.parse(e.data)
       // append and set unread..
    }
    */
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.post(`/v1/notifications/${id}/read/`)
      set((state) => {
        const nots = state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
        return {
          notifications: nots,
          unreadCount: nots.filter(n => !n.is_read).length
        }
      })
    } catch (e) {}
  },

  markAllRead: async () => {
    try {
      await apiClient.post('/v1/notifications/mark-all-read/')
      set((state) => {
        const nots = state.notifications.map(n => ({ ...n, is_read: true }))
        return {
          notifications: nots,
          unreadCount: 0
        }
      })
    } catch (e) {}
  }
}))
