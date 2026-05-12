import { useState, useEffect } from 'react'
import { Sparkles, Loader2, Check, Plus, Layout, Zap, RefreshCcw, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Modal } from '../Modal'
import { generateBacklogApi, generateUserStoriesApi, importProposalApi, type AIProposal, type AIStoryProposal } from '@/api/ai'
import toast from 'react-hot-toast'

interface AISuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onSuccess: () => void
}

export function AISuggestionModal({ isOpen, onClose, projectId, onSuccess }: AISuggestionModalProps) {
    const [description, setDescription] = useState('')
    const [step, setStep] = useState<'input' | 'thinking' | 'results'>('input')
    const [mode, setMode] = useState<'backlog' | 'stories'>('stories')
    const [proposal, setProposal] = useState<AIProposal | null>(null)
    const [selectedIndices, setSelectedIndices] = useState<Set<string>>(new Set())
    const [editableItems, setEditableItems] = useState<AIStoryProposal[]>([])
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
    const [isImporting, setIsImporting] = useState(false)

    // Reset when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep('input')
            setProposal(null)
            setSelectedIndices(new Set())
            setEditableItems([])
            setEditingIdx(null)
        }
    }, [isOpen])

    const handleGenerate = async (genMode: 'backlog' | 'stories') => {
        if (!description.trim() || description.length < 10) {
            toast.error('Por favor, describe tu proyecto con un poco más de detalle.')
            return
        }

        setMode(genMode)
        setStep('thinking')
        try {
            const data = genMode === 'backlog' 
                ? await generateBacklogApi(projectId, description)
                : await generateUserStoriesApi(projectId, description)
            
            setProposal(data)
            
            const initial = new Set<string>()
            if (genMode === 'backlog') {
                data.data.forEach((epic: { items: any[] }, eIdx: number) => {
                    epic.items.forEach((_: any, iIdx: number) => {
                        initial.add(`${eIdx}-${iIdx}`)
                    })
                })
            } else {
                // Para historias de usuario, guardamos una copia editable
                setEditableItems(data.data as AIStoryProposal[])
                data.data.forEach((_: any, idx: number) => {
                    initial.add(idx.toString())
                })
            }
            setSelectedIndices(initial)
            setStep('results')
        } catch (_err) {
            toast.error('Error al generar las sugerencias. Intenta de nuevo.')
            setStep('input')
        }
    }

    const toggleSelect = (index: string) => {
        const newSet = new Set(selectedIndices)
        if (newSet.has(index)) newSet.delete(index)
        else newSet.add(index)
        setSelectedIndices(newSet)
    }

    const handleDiscard = (idx: number) => {
        const newItems = [...editableItems]
        newItems.splice(idx, 1)
        setEditableItems(newItems)
        
        // Actualizar índices seleccionados (re-mapear)
        const newSelected = new Set<string>()
        selectedIndices.forEach(val => {
            const i = parseInt(val)
            if (i < idx) newSelected.add(val)
            else if (i > idx) newSelected.add((i - 1).toString())
        })
        setSelectedIndices(newSelected)
        toast.success('Historia descartada')
    }

    const handleSaveEdit = (idx: number, updatedItem: AIStoryProposal) => {
        const newItems = [...editableItems]
        newItems[idx] = updatedItem
        setEditableItems(newItems)
        setEditingIdx(null)
        toast.success('Cambios guardados')
    }

    const handleImport = async () => {
        if (!proposal || selectedIndices.size === 0) return

        setIsImporting(true)
        try {
            if (mode === 'stories') {
                // Enviamos los items editados que están seleccionados
                const itemsToImport = editableItems.filter((_, idx) => selectedIndices.has(idx.toString()))
                await importProposalApi(projectId, proposal.id, [], itemsToImport)
            } else {
                await importProposalApi(projectId, proposal.id, Array.from(selectedIndices))
            }
            
            toast.success(`${selectedIndices.size} tareas importadas con éxito ✨`)
            onSuccess()
            onClose()
        } catch (_err) {
            toast.error('Error al importar las tareas.')
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={mode === 'stories' ? "Nexus AI: Historias de Usuario" : "Nexus AI: Generador de Backlog"}
            maxWidth="650px"
        >
            {step === 'input' && (
                <div className="flex flex-col gap-6 py-2">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                        <Zap size={20} className="text-blue-400 shrink-0" />
                        <p className="text-sm text-blue-100 leading-relaxed">
                            Contanos de qué se trata tu requerimiento. Nexus AI generará historias de usuario con criterios de aceptación o un backlog completo.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">¿Qué quieres construir?</label>
                        <textarea
                            className="ai-textarea"
                            placeholder="Ej: Un sistema de autenticación con Google y notificaciones en tiempo real..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            className="btn-secondary h-12 gap-2 justify-center" 
                            onClick={() => handleGenerate('backlog')}
                            disabled={!description.trim() || description.length < 10}
                        >
                            <Layout size={18} /> Generar Backlog
                        </button>
                        <button 
                            className="btn-primary h-12 gap-2 justify-center" 
                            onClick={() => handleGenerate('stories')}
                            disabled={!description.trim() || description.length < 10}
                        >
                            <Sparkles size={18} /> Generar Historias
                        </button>
                    </div>
                </div>
            )}

            {step === 'thinking' && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="ai-pulse">
                        <Sparkles size={48} className="text-blue-500" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white">Nexus está analizando tu idea</h3>
                        <p className="text-sm text-slate-400 mt-1">Estructurando requerimientos y criterios...</p>
                    </div>
                </div>
            )}

            {step === 'results' && proposal && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">
                            {mode === 'stories' ? 'Historias de usuario generadas' : 'Propuesta organizada por módulos'}
                        </span>
                        <button 
                            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                            onClick={() => setStep('input')}
                        >
                            <RefreshCcw size={14} /> Refinar descripción
                        </button>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto pr-2 flex flex-col gap-4">
                        {mode === 'backlog' ? (
                            // Renderizado de Backlog (Épicas)
                            (proposal.data as any[]).map((epic: { epic: string, items: any[] }, eIdx: number) => (
                                <div key={eIdx} className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                        <Layout size={14} className="text-blue-400" />
                                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{epic.epic}</h4>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {epic.items.map((item: { title: string, priority: string, description: string }, iIdx: number) => {
                                            const key = `${eIdx}-${iIdx}`
                                            return (
                                                <div 
                                                    key={key} 
                                                    className={`suggestion-card ${selectedIndices.has(key) ? 'active' : ''}`}
                                                    onClick={() => toggleSelect(key)}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`checkbox ${selectedIndices.has(key) ? 'checked' : ''}`}>
                                                            {selectedIndices.has(key) && <Check size={12} strokeWidth={3} />}
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
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Renderizado de Historias de Usuario con Edición
                            editableItems.map((item, idx) => {
                                const isEditing = editingIdx === idx
                                const isExpanded = expandedIdx === idx
                                const key = idx.toString()
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className={`suggestion-card relative ${selectedIndices.has(key) ? 'active' : ''} ${isEditing ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                                    >
                                        {isEditing ? (
                                            <StoryEditor 
                                                item={item} 
                                                onSave={(updated) => handleSaveEdit(idx, updated)}
                                                onCancel={() => setEditingIdx(null)}
                                            />
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <div 
                                                        className={`checkbox ${selectedIndices.has(key) ? 'checked' : ''}`}
                                                        onClick={() => toggleSelect(key)}
                                                    >
                                                        {selectedIndices.has(key) && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                    <div className="flex-1" onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h5 className="text-sm font-bold text-white">{item.title}</h5>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`priority-pill ${item.priority}`}>{item.priority}</span>
                                                                {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-xs text-slate-300 italic">
                                                                "Como <span className="text-blue-400">{item.role}</span>, 
                                                                quiero <span className="text-blue-400">{item.action}</span>, 
                                                                para <span className="text-blue-400">{item.benefit}</span>"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="pl-8 pt-2 border-t border-slate-700/50 mt-2">
                                                        <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Criterios de Aceptación</h6>
                                                        <ul className="space-y-1.5">
                                                            {item.acceptance_criteria?.map((ac, acIdx) => (
                                                                <li key={acIdx} className="text-xs text-slate-400 flex gap-2">
                                                                    <span className="text-blue-500 mt-1">•</span>
                                                                    {ac}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-800">
                                                    <button 
                                                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                                        onClick={() => setEditingIdx(idx)}
                                                        title="Editar historia"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                        className="p-1.5 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400 transition-colors"
                                                        onClick={() => handleDiscard(idx)}
                                                        title="Descartar"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-400">
                            {selectedIndices.size} ítems seleccionados
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
                                    <><Plus size={16} /> {mode === 'stories' ? 'Aprobar e Importar' : 'Importar al Backlog'}</>
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

                .edit-input {
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 4px;
                    padding: 4px 8px;
                    color: white;
                    font-size: 0.8125rem;
                    width: 100%;
                    outline: none;
                }
                .edit-input:focus { border-color: #3b82f6; }
            `}</style>
        </Modal>
    )
}

function StoryEditor({ item, onSave, onCancel }: { item: AIStoryProposal, onSave: (updated: AIStoryProposal) => void, onCancel: () => void }) {
    const [editItem, setEditItem] = useState<AIStoryProposal>({ ...item })

    const handleACChange = (idx: number, value: string) => {
        const newACs = [...(editItem.acceptance_criteria || [])]
        newACs[idx] = value
        setEditItem({ ...editItem, acceptance_criteria: newACs })
    }

    const handleAddAC = () => {
        const newACs = [...(editItem.acceptance_criteria || []), '']
        setEditItem({ ...editItem, acceptance_criteria: newACs })
    }

    const handleRemoveAC = (idx: number) => {
        const newACs = [...(editItem.acceptance_criteria || [])]
        newACs.splice(idx, 1)
        setEditItem({ ...editItem, acceptance_criteria: newACs })
    }

    return (
        <div className="flex flex-col gap-4 py-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Título</label>
                <input 
                    className="edit-input font-bold" 
                    value={editItem.title} 
                    onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Como...</label>
                    <input 
                        className="edit-input" 
                        value={editItem.role} 
                        onChange={(e) => setEditItem({ ...editItem, role: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quiero...</label>
                    <input 
                        className="edit-input" 
                        value={editItem.action} 
                        onChange={(e) => setEditItem({ ...editItem, action: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Para...</label>
                    <input 
                        className="edit-input" 
                        value={editItem.benefit} 
                        onChange={(e) => setEditItem({ ...editItem, benefit: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Criterios de Aceptación</label>
                    <button 
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        onClick={handleAddAC}
                    >
                        <Plus size={12} /> Añadir
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {editItem.acceptance_criteria?.map((ac, acIdx) => (
                        <div key={acIdx} className="flex gap-2">
                            <input 
                                className="edit-input text-xs" 
                                value={ac} 
                                onChange={(e) => handleACChange(acIdx, e.target.value)}
                                placeholder="Describa el criterio..."
                            />
                            <button 
                                className="p-1 text-slate-500 hover:text-red-400"
                                onClick={() => handleRemoveAC(acIdx)}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {(!editItem.acceptance_criteria || editItem.acceptance_criteria.length === 0) && (
                        <p className="text-[10px] text-slate-500 italic">No hay criterios definidos.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button className="btn-ghost h-8 px-3 text-xs gap-1.5" onClick={onCancel}>
                    <X size={14} /> Cancelar
                </button>
                <button className="btn-primary h-8 px-3 text-xs gap-1.5" onClick={() => onSave(editItem)}>
                    <Save size={14} /> Guardar Cambios
                </button>
            </div>
        </div>
    )
}
