import { create } from 'zustand'
import type { Notification } from '@/lib/notificationsService'
import { notificationsService } from '@/lib/notificationsService'
import toast from 'react-hot-toast'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  lastFetched: number | null
  
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  startPolling: () => () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  lastFetched: null,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const data = await notificationsService.getNotifications()
      const unreadCount = data.filter(n => !n.is_read).length
      
      // Si hay nuevas notificaciones (comparando con el estado anterior)
      // podríamos disparar un toast aquí si no es el primer fetch
      const previousNotifications = get().notifications
      if (previousNotifications.length > 0 && data.length > previousNotifications.length) {
        const newOnes = data.filter(n => !previousNotifications.find(pn => pn.id === n.id))
        newOnes.forEach(n => {
          toast.success(n.message, {
            duration: 5000,
            position: 'top-right',
            icon: '🔔'
          })
        })
      }

      set({ 
        notifications: data, 
        unreadCount, 
        loading: false, 
        lastFetched: Date.now() 
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      set({ loading: false })
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      const notifications = get().notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      )
      set({ 
        notifications, 
        unreadCount: notifications.filter(n => !n.is_read).length 
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsService.markAllAsRead()
      const notifications = get().notifications.map(n => ({ ...n, is_read: true }))
      set({ 
        notifications, 
        unreadCount: 0 
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  },

  startPolling: () => {
    // Polling cada 30 segundos
    const interval = setInterval(() => {
      get().fetchNotifications()
    }, 30000)

    // Initial fetch
    get().fetchNotifications()

    return () => clearInterval(interval)
  }
}))
