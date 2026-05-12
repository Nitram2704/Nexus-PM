import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { orchestrateEpicApi } from '@/api/ai'
import toast from 'react-hot-toast'
import { Loader2, Bot } from 'lucide-react'

export function AgentOrchestrationModal({ isOpen, onClose, projectId }: { isOpen: boolean, onClose: () => void, projectId: string }) {
  const [epicDescription, setEpicDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!epicDescription) return

    setIsSubmitting(true)
    try {
      await orchestrateEpicApi(projectId, epicDescription)
      toast.success('¡Orquestación iniciada! Los agentes están trabajando en segundo plano.', { duration: 5000 })
      onClose()
      setEpicDescription('')
    } catch {
      toast.error('Error al iniciar la orquestación')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Orquestación de Agentes (Ops-Room)">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="text-sm text-gray-400 mb-2">
          Introduce la descripción de una Épica. El Panel de Agentes (Frontend, Backend, PM) la analizará y dividirá en tareas técnicas en el tablero de forma autónoma.
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Descripción de la Épica</label>
          <textarea 
            className="w-full bg-surface-2 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-cyan-500 transition-colors"
            rows={4}
            placeholder="Ej: Necesitamos implementar autenticación de dos factores (2FA) para roles de administrador con SMS y Auth App..."
            value={epicDescription}
            onChange={(e) => setEpicDescription(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !epicDescription}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase tracking-widest text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> INICIALIZANDO AGENTES...</>
          ) : (
            <><Bot size={16} /> DEPLOY_AGENTS()</>
          )}
        </button>
      </form>
    </Modal>
  )
}
