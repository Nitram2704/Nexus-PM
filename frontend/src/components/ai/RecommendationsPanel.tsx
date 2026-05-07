import { useState, useEffect } from 'react'
import { Check, X, AlertCircle, Lightbulb, Zap, RefreshCw, Loader2 } from 'lucide-react'
import { generateRecommendationsApi, getRecommendationsApi, updateRecommendationApi } from '@/api/ai'
import type { AIRecommendation } from '@/api/ai'
import { Modal } from '../Modal'

interface RecommendationsPanelProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export default function RecommendationsPanel({ projectId, isOpen, onClose }: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const data = await getRecommendationsApi(projectId)
      setRecommendations(data)
    } catch (err) {
      setError('Error al cargar recomendaciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadRecommendations()
    }
  }, [isOpen, projectId])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      setError(null)
      const data = await generateRecommendationsApi(projectId)
      setRecommendations(prev => [...data, ...prev])
    } catch (err) {
      setError('Error al generar recomendaciones.')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'applied' | 'discarded') => {
    try {
      await updateRecommendationApi(projectId, id, status)
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch (err) {
      setError('Error al actualizar el estado.')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertCircle size={16} className="text-red-500" />
      case 'improvement': return <Lightbulb size={16} className="text-yellow-500" />
      case 'technical': return <Zap size={16} className="text-blue-500" />
      default: return null
    }
  }

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'risk': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'improvement': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'technical': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'risk': return 'Riesgo'
      case 'improvement': return 'Mejora'
      case 'technical': return 'Sugerencia Técnica'
      default: return type
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recomendaciones AI">
      <div className="flex flex-col h-[600px] max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-400">
            El agente analiza tu proyecto para sugerir mejoras, alertar de riesgos o dar consejos técnicos.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent/90 text-white rounded text-sm transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Analizar Proyecto
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
              <Lightbulb size={48} className="opacity-20" />
              <p>No hay recomendaciones todavía.</p>
            </div>
          ) : (
            recommendations.map(rec => (
              <div key={rec.id} className={`p-4 rounded border transition-colors ${rec.status === 'pending' ? 'bg-surface border-border' : 'bg-surface/50 border-border/50 opacity-70'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getIcon(rec.type)}
                    <h4 className="font-medium text-text-primary">{rec.title}</h4>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getBadgeClass(rec.type)}`}>
                    {getTypeLabel(rec.type)}
                  </span>
                </div>
                
                <p className="text-sm text-text-secondary mb-3">
                  {rec.description}
                </p>
                
                {rec.status === 'pending' ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'discarded')}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
                    >
                      <X size={14} />
                      Descartar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'applied')}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-border hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 transition-colors"
                    >
                      <Check size={14} />
                      Aplicar
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <span className={`text-xs px-2 py-1 rounded ${rec.status === 'applied' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                      {rec.status === 'applied' ? '✓ Aplicada' : '✗ Descartada'}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
