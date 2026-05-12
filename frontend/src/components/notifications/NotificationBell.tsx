import { useState, useEffect, useRef } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    startPolling 
  } = useNotificationStore()

  useEffect(() => {
    const stopPolling = startPolling()
    return () => stopPolling()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id)
    }
    
    if (n.task) {
      // Por ahora redirigimos al kanban del proyecto
      // Si tuviéramos un store global de 'selectedTask', podríamos activarlo aquí
      navigate(`/project/${n.project_id || 'active'}/kanban`)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative p-2 rounded-md transition-all duration-200",
          isOpen ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
        )}
        title="Notificaciones"
      >
        <Bell className={clsx("w-5 h-5", unreadCount > 0 && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 border border-[#1a2235]"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a2235] border border-[#2a3655] rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-[#2a3655] flex items-center justify-between bg-white/5">
            <h3 className="font-semibold text-white flex items-center gap-2">
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full border border-blue-500/30">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={clsx(
                    "p-4 border-b border-[#2a3655] cursor-pointer transition-all hover:bg-white/5 relative group",
                    !n.is_read && "bg-blue-500/[0.03]"
                  )}
                >
                  {!n.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        "text-sm mb-0.5 line-clamp-1",
                        n.is_read ? "text-slate-300" : "text-white font-medium"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-slate-500">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                        </span>
                        {n.actor_name && (
                          <>
                            <span className="text-[10px] text-slate-700">•</span>
                            <span className="text-[10px] text-blue-400/70">{n.actor_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {n.task && (
                      <div className="p-1.5 rounded-md bg-white/5 text-slate-500 group-hover:text-blue-400 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t border-[#2a3655] bg-white/2">
            <button className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Ver todo el historial
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
