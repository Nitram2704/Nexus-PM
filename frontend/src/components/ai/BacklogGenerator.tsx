import { useState } from 'react'
import { Sparkles, Loader2, Check, Plus, AlertCircle } from 'lucide-react'
import { generateBacklogApi, importProposalApi, type AIProposal } from '@/api/ai'
import toast from 'react-hot-toast'

interface BacklogGeneratorProps {
    projectId: string
    onImported: () => void
}

export function BacklogGenerator({ projectId, onImported }: BacklogGeneratorProps) {
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [proposal, setProposal] = useState<AIProposal | null>(null)
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])
    const [isImporting, setIsImporting] = useState(false)

    const handleGenerate = async () => {
        if (!description.trim() || description.length < 10) {
            toast.error('Por favor, describe tu proyecto con un poco más de detalle.')
            return
        }

        setIsLoading(true)
        try {
            const data = await generateBacklogApi(projectId, description)
            setProposal(data)
            setSelectedIndices(data.data.map((_, i) => i)) // Seleccionar todos por defecto
            toast.success('¡Backlog sugerido generado!')
        } catch (err) {
            toast.error('Error al generar el backlog. Intenta de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const handleImport = async () => {
        if (!proposal || selectedIndices.length === 0) return

        setIsImporting(true)
        try {
            await importProposalApi(projectId, proposal.id, selectedIndices)
            toast.success(`${selectedIndices.length} tareas importadas al backlog`)
            setProposal(null)
            setDescription('')
            onImported()
        } catch (err) {
            toast.error('Error al importar las tareas.')
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="ai-generator-card">
            <div className="ai-generator-header">
                <div className="ai-badge">
                    <Sparkles size={14} className="text-blue-400" />
                    <span>Nexus AI</span>
                </div>
                <h3 className="ai-generator-title">Generador de Backlog</h3>
                <p className="ai-generator-subtitle">
                    Describe tu idea y Nexus AI creará una estructura inicial de tareas para vos.
                </p>
            </div>

            {!proposal ? (
                <div className="ai-input-section">
                    <textarea
                        className="ai-textarea"
                        placeholder="Ej: Un sistema de gestión para una clínica veterinaria con turnos, historias clínicas y stock de farmacia..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        className="ai-btn-generate" 
                        onClick={handleGenerate}
                        disabled={isLoading || !description.trim()}
                    >
                        {isLoading ? (
                            <><Loader2 size={18} className="animate-spin" /> Generando...</>
                        ) : (
                            <><Sparkles size={18} /> Generar Sugerencias</>
                        )}
                    </button>
                </div>
            ) : (
                <div className="ai-results-section animate-in">
                    <div className="ai-results-header">
                        <span>{proposal.data.length} sugerencias encontradas</span>
                        <button className="text-blue-400 text-sm hover:underline" onClick={() => setProposal(null)}>
                            Cambiar descripción
                        </button>
                    </div>
                    
                    <div className="ai-proposal-list">
                        {proposal.data.map((item, index) => (
                            <div 
                                key={index} 
                                className={`ai-proposal-item ${selectedIndices.includes(index) ? 'selected' : ''}`}
                                onClick={() => toggleSelection(index)}
                            >
                                <div className="ai-checkbox">
                                    {selectedIndices.includes(index) && <Check size={14} />}
                                </div>
                                <div className="ai-item-content">
                                    <div className="ai-item-top">
                                        <span className="ai-item-title">{item.title}</span>
                                        <span className={`ai-priority-badge priority-${item.priority}`}>
                                            {item.priority}
                                        </span>
                                    </div>
                                    <p className="ai-item-desc">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="ai-footer">
                        <button 
                            className="ai-btn-import" 
                            onClick={handleImport}
                            disabled={isImporting || selectedIndices.length === 0}
                        >
                            {isImporting ? (
                                <><Loader2 size={18} className="animate-spin" /> Importando...</>
                            ) : (
                                <><Plus size={18} /> Importar {selectedIndices.length} ítems</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .ai-generator-card {
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                }
                .ai-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(59, 130, 246, 0.1);
                    color: #60a5fa;
                    padding: 4px 10px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-bottom: 12px;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }
                .ai-generator-title {
                    font-family: var(--font-display);
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                }
                .ai-generator-subtitle {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    margin-top: 4px;
                }
                .ai-textarea {
                    width: 100%;
                    min-height: 120px;
                    background: var(--color-surface-2);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 14px;
                    color: var(--color-text-primary);
                    font-family: inherit;
                    font-size: 0.9375rem;
                    resize: vertical;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .ai-textarea:focus {
                    border-color: var(--color-accent);
                }
                .ai-btn-generate {
                    width: 100%;
                    height: 48px;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: transform 0.1s, opacity 0.2s;
                    margin-top: 12px;
                }
                .ai-btn-generate:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                .ai-btn-generate:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .ai-results-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8125rem;
                    color: var(--color-text-muted);
                    margin-bottom: 12px;
                }
                .ai-proposal-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .ai-proposal-item {
                    display: flex;
                    gap: 14px;
                    padding: 14px;
                    background: var(--color-surface-2);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ai-proposal-item:hover {
                    border-color: var(--color-border-hover);
                    background: rgba(255,255,255,0.03);
                }
                .ai-proposal-item.selected {
                    border-color: var(--color-accent);
                    background: rgba(59, 130, 246, 0.05);
                }
                .ai-checkbox {
                    flex: 0 0 20px;
                    height: 20px;
                    border: 2px solid var(--color-border);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                    color: var(--color-accent);
                }
                .ai-proposal-item.selected .ai-checkbox {
                    background: var(--color-accent);
                    border-color: var(--color-accent);
                    color: white;
                }
                .ai-item-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .ai-item-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .ai-item-title {
                    font-weight: 600;
                    color: var(--color-text-primary);
                    font-size: 0.9375rem;
                }
                .ai-item-desc {
                    font-size: 0.8125rem;
                    color: var(--color-text-secondary);
                    line-height: 1.4;
                }
                .ai-priority-badge {
                    font-size: 0.625rem;
                    text-transform: uppercase;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    letter-spacing: 0.05em;
                }
                .priority-high { background: rgba(239, 68, 68, 0.1); color: #f87171; }
                .priority-medium { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
                .priority-low { background: rgba(16, 185, 129, 0.1); color: #34d399; }
                .ai-footer {
                    margin-top: 12px;
                    padding-top: 16px;
                    border-top: 1px solid var(--color-border);
                }
                .ai-btn-import {
                    width: 100%;
                    height: 46px;
                    background: var(--color-accent);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                }
                .animate-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
