import { useState, useEffect } from 'react'
import { Modal } from '@/components/Modal'
import apiClient from '@/lib/apiClient'
import { Save, Loader2, BellRing, ShieldAlert, FileClock, MessageSquare, ArrowRightLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface NotificationPreferences {
  task_assigned: boolean
  task_moved: boolean
  task_comment: boolean
  custom_alert: boolean
  expiration: boolean
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    task_assigned: true,
    task_moved: true,
    task_comment: true,
    custom_alert: true,
    expiration: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        setLoading(true)
        try {
          const { data } = await apiClient.get('/v1/notifications/settings/')
          setPreferences(data)
        } catch (error) {
          toast.error('Error al sincronizar preferencias de comunicación')
          console.error(error)
        } finally {
          setLoading(false)
        }
      }
      fetchSettings()
    }
  }, [isOpen])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const toastId = toast.loading('Guardando configuración de nodos...')
    try {
      await apiClient.put('/v1/notifications/settings/', preferences)
      toast.success('Configuración guardada exitosamente', { id: toastId })
      onClose()
    } catch (error) {
      toast.error('Error al guardar la configuración', { id: toastId })
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CONFIG_PANEL // COMMUNICATIONS" maxWidth="450px">
      <div className="flex flex-col gap-6 text-white font-sans">
        <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Preferences Node Selection</p>
          <span className="text-[11px] text-slate-400">
            Define qué canales de transmisión deseas mantener activos en tu terminal.
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-mono animate-pulse">
              Requesting_Data_Link...
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Tarea Asignada */}
            <div 
              onClick={() => handleToggle('task_assigned')}
              className={`flex items-center justify-between p-3.5 border transition-all cursor-pointer select-none ${
                preferences.task_assigned 
                  ? 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10' 
                  : 'border-white/5 bg-white/2 hover:bg-white/4'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 border transition-all ${
                  preferences.task_assigned ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-white/30'
                }`}>
                  <BellRing className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold font-mono tracking-wide">TASK_ASSIGNED // TAREAS ASIGNADAS</span>
                  <span className="text-[9px] text-white/40 leading-tight mt-0.5">Alertas cuando una nueva tarea se asigne a tu usuario.</span>
                </div>
              </div>
              <div className={`w-3.5 h-3.5 border flex items-center justify-center ${
                preferences.task_assigned ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20'
              }`}>
                {preferences.task_assigned && <div className="w-1.5 h-1.5 bg-cyan-400" />}
              </div>
            </div>

            {/* Tarea Movida */}
            <div 
              onClick={() => handleToggle('task_moved')}
              className={`flex items-center justify-between p-3.5 border transition-all cursor-pointer select-none ${
                preferences.task_moved 
                  ? 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10' 
                  : 'border-white/5 bg-white/2 hover:bg-white/4'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 border transition-all ${
                  preferences.task_moved ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-white/30'
                }`}>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold font-mono tracking-wide">TASK_UPDATES // ACTUALIZACIONES</span>
                  <span className="text-[9px] text-white/40 leading-tight mt-0.5">Notificaciones cuando tus tareas cambien de columna.</span>
                </div>
              </div>
              <div className={`w-3.5 h-3.5 border flex items-center justify-center ${
                preferences.task_moved ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20'
              }`}>
                {preferences.task_moved && <div className="w-1.5 h-1.5 bg-cyan-400" />}
              </div>
            </div>

            {/* Tarea Comentario */}
            <div 
              onClick={() => handleToggle('task_comment')}
              className={`flex items-center justify-between p-3.5 border transition-all cursor-pointer select-none ${
                preferences.task_comment 
                  ? 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10' 
                  : 'border-white/5 bg-white/2 hover:bg-white/4'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 border transition-all ${
                  preferences.task_comment ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-white/30'
                }`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold font-mono tracking-wide">TASK_COMMENT // COMENTARIOS</span>
                  <span className="text-[9px] text-white/40 leading-tight mt-0.5">Alertas cuando un miembro del equipo comente en tus tareas.</span>
                </div>
              </div>
              <div className={`w-3.5 h-3.5 border flex items-center justify-center ${
                preferences.task_comment ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20'
              }`}>
                {preferences.task_comment && <div className="w-1.5 h-1.5 bg-cyan-400" />}
              </div>
            </div>

            {/* Alerta de Sistema */}
            <div 
              onClick={() => handleToggle('custom_alert')}
              className={`flex items-center justify-between p-3.5 border transition-all cursor-pointer select-none ${
                preferences.custom_alert 
                  ? 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10' 
                  : 'border-white/5 bg-white/2 hover:bg-white/4'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 border transition-all ${
                  preferences.custom_alert ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-white/30'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold font-mono tracking-wide">SYSTEM_ALERTS // ALERTA DE SISTEMA</span>
                  <span className="text-[9px] text-white/40 leading-tight mt-0.5">Alertas críticas y avisos sobre ejecuciones de agentes IA.</span>
                </div>
              </div>
              <div className={`w-3.5 h-3.5 border flex items-center justify-center ${
                preferences.custom_alert ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20'
              }`}>
                {preferences.custom_alert && <div className="w-1.5 h-1.5 bg-cyan-400" />}
              </div>
            </div>

            {/* Vencimiento de Sprint */}
            <div 
              onClick={() => handleToggle('expiration')}
              className={`flex items-center justify-between p-3.5 border transition-all cursor-pointer select-none ${
                preferences.expiration 
                  ? 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10' 
                  : 'border-white/5 bg-white/2 hover:bg-white/4'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 border transition-all ${
                  preferences.expiration ? 'border-cyan-400 text-cyan-400' : 'border-white/10 text-white/30'
                }`}>
                  <FileClock className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold font-mono tracking-wide">SPRINT_ALERT // VENCIMIENTO SPRINT</span>
                  <span className="text-[9px] text-white/40 leading-tight mt-0.5">Alertas automáticas cuando el sprint esté a 48h de expirar.</span>
                </div>
              </div>
              <div className={`w-3.5 h-3.5 border flex items-center justify-center ${
                preferences.expiration ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20'
              }`}>
                {preferences.expiration && <div className="w-1.5 h-1.5 bg-cyan-400" />}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-[9px] font-bold font-mono uppercase tracking-widest cursor-pointer"
          >
            Cancel_Request
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-400/90 disabled:bg-cyan-400/30 disabled:text-cyan-400/50 text-black font-bold text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Updating_Nodes
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Write_Settings
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
