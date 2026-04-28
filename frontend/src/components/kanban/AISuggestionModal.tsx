import { useState } from 'react'
import { Sparkles, Loader2, Check, Plus, AlertCircle, Zap, RefreshCcw } from 'lucide-react'
import { Modal } from '../Modal'
import { generateBacklogApi, importProposalApi, type AIProposal } from '@/api/ai'
import toast from 'react-hot-toast'

interface AISuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  onSuccess: () => void
}

export function AISuggestionModal({ isOpen, onClose, projectId, projectName, onSuccess }: AISuggestionModalProps) {
    const [description, setDescription] = useState('')
    const [step, setStep] = useState<'input' | 'thinking' | 'results'>('input')
    const [proposal, setProposal] = useState<AIProposal | null>(null)
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
    const [isImporting, setIsImporting] = useState(false)

    const handleGenerate = async () => {
        if (!description.trim() || description.length < 10) {
            toast.error('Por favor, describe tu proyecto con un poco más de detalle.')
            return
        }

        setStep('thinking')
        try {
            const data = await generateBacklogApi(projectId, description)
            setProposal(data)
            setSelectedIndices(new Set(data.data.map((_, i) => i))) // Seleccionar todos por defecto
            setStep('results')
        } catch (err) {
            toast.error('Error al generar el backlog. Intenta de nuevo.')
            setStep('input')
        }
    }

    const toggleSelect = (index: number) => {
        const newSet = new Set(selectedIndices)
        if (newSet.has(index)) newSet.delete(index)
        else newSet.add(index)
        setSelectedIndices(newSet)
    }

    const handleImport = async () => {
        if (!proposal || selectedIndices.size === 0) return

        setIsImporting(true)
        try {
            await importProposalApi(projectId, proposal.id, Array.from(selectedIndices))
            toast.success(`${selectedIndices.size} tareas importadas con éxito ✨`)
            onSuccess()
            onClose()
            // Reset for next time
            setProposal(null)
            setDescription('')
            setStep('input')
        } catch (err) {
            toast.error('Error al importar las tareas.')
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Nexus AI: Generador de Backlog"
            maxWidth="600px"
        >
            {step === 'input' && (
                <div className="flex flex-col gap-6 py-2">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                        <Zap size={20} className="text-blue-400 shrink-0" />
                        <p className="text-sm text-blue-100 leading-relaxed">
                            Contanos de qué se trata tu proyecto. Nexus AI generará una lista de épicas e historias de usuario para que empieces a trabajar de inmediato.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción del Proyecto</label>
                        <textarea
                            className="ai-textarea"
                            placeholder="Ej: Un sistema de gestión para una clínica veterinaria con turnos, historias clínicas y stock de farmacia..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                        />
                    </div>

                    <button 
                        className="btn-primary w-full justify-center h-12 gap-2" 
                        onClick={handleGenerate}
                        disabled={!description.trim() || description.length < 10}
                    >
                        <Sparkles size={18} /> Generar Sugerencias
                    </button>
                </div>
            )}

            {step === 'thinking' && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="ai-pulse">
                        <Sparkles size={48} className="text-blue-500" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white">Nexus está analizando tu idea</h3>
                        <p className="text-sm text-slate-400 mt-1">Estructurando requerimientos y prioridades...</p>
                    </div>
                </div>
            )}

            {step === 'results' && proposal && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">
                            {proposal.data.length} tareas sugeridas
                        </span>
                        <button 
                            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                            onClick={() => setStep('input')}
                        >
                            <RefreshCcw size={14} /> Refinar descripción
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 flex flex-col gap-2">
                        {proposal.data.map((item, index) => (
                            <div 
                                key={index} 
                                className={`suggestion-card ${selectedIndices.has(index) ? 'active' : ''}`}
                                onClick={() => toggleSelect(index)}
                            >
                                <div className="flex gap-3">
                                    <div className={`checkbox ${selectedIndices.has(index) ? 'checked' : ''}`}>
                                        {selectedIndices.has(index) && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h5 className="text-sm font-semibold text-white">{item.title}</h5>
                                            <span className={`priority-pill ${item.priority}`}>{item.priority}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-400">
                            {selectedIndices.size} seleccionadas
                        </span>
                        <div className="flex gap-3">
                            <button className="btn-ghost" onClick={onClose} disabled={isImporting}>
                                Cancelar
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={handleImport}
                                disabled={selectedIndices.size === 0 || isImporting}
                            >
                                {isImporting ? (
                                    <><Loader2 className="animate-spin" size={16} /> Importando...</>
                                ) : (
                                    <><Plus size={16} /> Importar al Backlog</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .ai-textarea {
                    width: 100%;
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 8px;
                    padding: 12px;
                    color: white;
                    font-size: 0.9375rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .ai-textarea:focus { border-color: #3b82f6; }
                .ai-pulse {
                    animation: pulse-glow 2s infinite ease-in-out;
                    filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5));
                }
                @keyframes pulse-glow {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
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
