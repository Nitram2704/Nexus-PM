import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { Sparkles, Loader2, Check, AlertCircle } from 'lucide-react'
import { getBacklogPrioritizationApi, applyBacklogPrioritizationApi, type AIPrioritizationSuggestion } from '@/api/ai'
import toast from 'react-hot-toast'

interface AIPrioritizationModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onSuccess: () => void
}

export function AIPrioritizationModal({ isOpen, onClose, projectId, onSuccess }: AIPrioritizationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [suggestion, setSuggestion] = useState<AIPrioritizationSuggestion | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setSuggestion(null)
    try {
      const data = await getBacklogPrioritizationApi(projectId)
      setSuggestion(data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      toast.error(error.response?.data?.error || 'Error al generar la priorización')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async () => {
    if (!suggestion) return
    setIsApplying(true)
    try {
      await applyBacklogPrioritizationApi(projectId, suggestion.ordered_ids)
      toast.success('Backlog priorizado correctamente ✨')
      onSuccess()
      onClose()
    } catch (_err) {
      toast.error('Error al aplicar la priorización')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Priorización Inteligente"
      maxWidth="600px"
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-400">
            Nexus AI analizará tus tareas del backlog y sugerirá un orden basado en valor, 
            complejidad y dependencias técnicas.
          </p>
        </div>

        {!suggestion && !isLoading && (
          <button 
            className="btn-generate-prioritization"
            onClick={handleGenerate}
          >
            <Sparkles size={18} />
            Analizar y Priorizar Backlog
          </button>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm text-slate-400 font-medium">Nexus está analizando el backlog...</p>
          </div>
        )}

        {suggestion && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="reasoning-box">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-blue-400" />
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Razonamiento de Nexus</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{suggestion.reasoning}"
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resumen del nuevo orden</h4>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                  {suggestion?.ordered_ids?.length || 0} tareas detectadas
                </span>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * Las tareas se reordenarán automáticamente en el backlog al aplicar.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                className="btn-cancel flex-1"
                onClick={onClose}
                disabled={isApplying}
              >
                Ignorar
              </button>
              <button 
                className="btn-apply flex-1"
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Check size={18} />
                    Aplicar Priorización
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .btn-generate-prioritization {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-generate-prioritization:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }

        .reasoning-box {
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 16px;
        }

        .btn-apply {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-apply:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-cancel {
          background: #1e293b;
          color: #94a3b8;
          border: 1px solid #334155;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #334155;
          color: white;
        }
      `}</style>
    </Modal>
  )
}
