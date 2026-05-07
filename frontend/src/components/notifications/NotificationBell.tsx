import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  getNotificationsApi, 
  markNotificationAsReadApi, 
  markAllNotificationsAsReadApi, 
  type Notification 
} from '@/api/notifications'
import { Link } from 'react-router-dom'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const fetchNotifications = async () => {
    try {
      const data = await getNotificationsApi()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for simple "real-time"
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsReadApi(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsReadApi()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-1.5 transition-colors group ${
          isOpen ? 'text-cyan-400' : 'text-white/40 hover:text-white'
        }`}
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[12px] h-[12px] bg-cyan-500 text-black text-[7px] font-bold flex items-center justify-center px-0.5 border border-black animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-72 bg-black/80 backdrop-blur-2xl border border-white/10 z-50 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-[9px] font-bold tracking-widest text-white flex items-center gap-2">
                   <div className="w-1 h-1 bg-cyan-400"></div>
                   INTERNAL_COMMS // PULSE
                </h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[8px] text-cyan-400/60 hover:text-cyan-400 flex items-center gap-1 transition-colors uppercase font-bold"
                  >
                    <CheckCheck className="w-2.5 h-2.5" />
                    Archive_All
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2">
                    <div className="w-4 h-4 border border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
                    <span className="text-[8px] text-white/20 uppercase tracking-tighter">Syncing_Nodes...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-white/20">
                     <Inbox className="w-6 h-6 mb-2 opacity-10" />
                     <span className="text-[8px] uppercase tracking-widest font-mono">Zero_Alerts_Detected</span>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        className={`group px-4 py-3 transition-colors hover:bg-white/[0.03] relative ${
                          !n.is_read ? 'bg-cyan-500/[0.02]' : ''
                        }`}
                      >
                        {!n.is_read && (
                           <div className="absolute top-0 left-0 w-[1px] h-full bg-cyan-500"></div>
                        )}
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-tight ${
                              !n.is_read ? 'text-white' : 'text-white/40'
                            }`}>
                              {n.title}
                            </span>
                            <span className="text-[7px] text-white/20 font-mono">
                              {n.created_at_human}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/60 leading-tight">
                            {n.content}
                          </p>
                          
                          <div className="mt-2 flex items-center gap-3">
                            {n.link && (
                              <Link 
                                to={n.link}
                                onClick={() => setIsOpen(false)}
                                className="text-[8px] text-cyan-400 hover:underline uppercase font-bold tracking-widest"
                              >
                                View_Origin
                              </Link>
                            )}
                            {!n.is_read && (
                              <button 
                                onClick={() => handleMarkRead(n.id)}
                                className="text-[8px] text-white/20 hover:text-white uppercase font-bold"
                              >
                                Dissmiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View All */}
              <div className="px-4 py-2 border-t border-white/10 bg-white/[0.01]">
                 <button className="w-full text-center text-[7px] text-white/20 hover:text-white uppercase tracking-[0.2em] font-mono transition-colors py-1">
                    Load_Encrypted_Archives
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
