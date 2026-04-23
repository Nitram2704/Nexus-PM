import { useState, useEffect } from 'react'
import { Sparkles, Loader2, Check, CheckCircle2, ChevronRight, Layout, Database, Shield, Zap } from 'lucide-react'
import { Modal } from '../Modal'
import { createTaskApi } from '@/api/tasks'
import toast from 'react-hot-toast'

interface SuggestedItem {
  id: string
  title: string
  description: string
  type: 'feature' | 'bug' | 'task' | 'story'
  priority: 'low' | 'medium' | 'high'
  epic: string
}

interface AISuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  onSuccess: () => void
}

const DEFAULT_SUGGESTIONS: Record<string, SuggestedItem[]> = {
  'Módulo: Autenticación y Seguridad': [
    { id: '1', epic: 'Módulo: Autenticación y Seguridad', title: 'Implementar Registro de Usuarios', description: 'Permitir que nuevos usuarios se registren con email y contraseña.', type: 'story', priority: 'high' },
    { id: '2', epic: 'Módulo: Autenticación y Seguridad', title: 'Login con JWT', description: 'Sistema de autenticación basado en tokens para sesiones seguras.', type: 'task', priority: 'high' },
    { id: '3', epic: 'Módulo: Autenticación y Seguridad', title: 'Recuperación de Contraseña', description: 'Flujo de "Olvidé mi contraseña" vía email.', type: 'feature', priority: 'medium' },
  ],
  'Módulo: Núcleo de la Aplicación': [
    { id: '4', epic: 'Módulo: Núcleo de la Aplicación', title: 'CRUD de Entidades Principales', description: 'Implementar las operaciones básicas para los objetos del dominio.', type: 'task', priority: 'high' },
    { id: '5', epic: 'Módulo: Núcleo de la Aplicación', title: 'Dashboard de Resumen', description: 'Vista principal con métricas clave y estado actual.', type: 'story', priority: 'medium' },
    { id: '6', epic: 'Módulo: Núcleo de la Aplicación', title: 'Filtros Avanzados de Búsqueda', description: 'Búsqueda global y filtros por atributos específicos.', type: 'feature', priority: 'low' },
  ],
  'Módulo: Infraestructura y Despliegue': [
    { id: '7', epic: 'Módulo: Infraestructura y Despliegue', title: 'Configuración de CI/CD', description: 'Pipeline para despliegue automático en cada push.', type: 'task', priority: 'medium' },
    { id: '8', epic: 'Módulo: Infraestructura y Despliegue', title: 'Configuración de Base de Datos Prod', description: 'Instancia de DB escalable para el entorno de producción.', type: 'task', priority: 'high' },
  ]
}

export function AISuggestionModal({ isOpen, onClose, projectId, projectName, onSuccess }: AISuggestionModalProps) {
  const [step, setStep] = useState<'thinking' | 'preview'>('thinking')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStep('thinking')
      const timer = setTimeout(() => {
        setStep('preview')
        // Select all by default
        const allIds = Object.values(DEFAULT_SUGGESTIONS).flat().map(i => i.id)
        setSelectedIds(new Set(allIds))
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleImport = async () => {
    setIsImporting(true)
    const selectedItems = Object.values(DEFAULT_SUGGESTIONS).flat().filter(i => selectedIds.has(i.id))
    
    try {
      // Simulación de creación en lote (en un sistema real usaríamos un endpoint de bulk_create)
      await Promise.all(selectedItems.map(item => 
        createTaskApi({
          project: projectId,
          title: item.title,
          description: item.description,
          type: item.type,
          priority: item.priority
        })
      ))
      
      toast.success(`${selectedItems.length} tareas importadas con éxito ✨`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Error al importar algunas tareas')
    } finally {
      setIsImporting(false)
    }
  }

  const epicIcons: Record<string, any> = {
    'Módulo: Autenticación y Seguridad': <Shield size={16} className="text-blue-400" />,
    'Módulo: Núcleo de la Aplicación': <Layout size={16} className="text-purple-400" />,
    'Módulo: Infraestructura y Despliegue': <Database size={16} className="text-orange-400" />
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Nexus AI: Generador de Backlog"
      maxWidth="600px"
    >
      {step === 'thinking' ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="ai-pulse">
            <Sparkles size={48} className="text-blue-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">Nexus está analizando "{projectName}"</h3>
            <p className="text-sm text-slate-400 mt-1">Identificando módulos, épicas y requerimientos clave...</p>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="dot-bounce" />
            <div className="dot-bounce delay-100" />
            <div className="dot-bounce delay-200" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
            <Zap size={20} className="text-blue-400 shrink-0" />
            <p className="text-xs text-blue-100 leading-relaxed">
              Basado en el nombre de tu proyecto, he identificado 3 módulos críticos con 8 tareas iniciales. 
              Selecciona las que desees incluir en tu Backlog.
            </p>
          </div>

          <div className="max-height-[400px] overflow-y-auto pr-2 flex flex-col gap-6">
            {Object.entries(DEFAULT_SUGGESTIONS).map(([epic, items]) => (
              <div key={epic} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-1">
                  {epicIcons[epic] || <Layout size={16} />}
                  <h4 className="text-xs font-bold text-slate-400 uppercase letter-spacing-wider">{epic}</h4>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={`suggestion-card ${selectedIds.has(item.id) ? 'active' : ''}`}
                      onClick={() => toggleSelect(item.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`checkbox ${selectedIds.has(item.id) ? 'checked' : ''}`}>
                          {selectedIds.has(item.id) && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-sm font-semibold text-white">{item.title}</h5>
                            <span className={`priority-pill ${item.priority}`}>{item.priority}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                        <div className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded h-fit uppercase font-bold">
                          {item.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {selectedIds.size} ítems seleccionados
            </span>
            <div className="flex gap-3">
              <button className="btn-ghost" onClick={onClose} disabled={isImporting}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleImport}
                disabled={selectedIds.size === 0 || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Importando...
                  </>
                ) : (
                  <>Importar al Backlog</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ai-pulse {
          animation: pulse-glow 2s infinite ease-in-out;
          filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5));
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .dot-bounce {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .delay-100 { animation-delay: -0.32s; }
        .delay-200 { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .suggestion-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .suggestion-card:hover { border-color: #475569; background: #243147; }
        .suggestion-card.active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #475569;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transition: all 0.2s;
        }
        .checkbox.checked {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        .priority-pill {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .priority-pill.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .priority-pill.medium { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .priority-pill.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      `}</style>
    </Modal>
  )
}
