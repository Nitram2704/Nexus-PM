import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Loader2, Plus, ChevronDown, ChevronRight, MoreHorizontal, User, Sparkles, Bot } from 'lucide-react'
import { getProjectDetailApi } from '@/api/projects'
import { Modal } from '@/components/Modal'
import { getSprintsApi, createSprintApi, startSprintApi, completeSprintApi } from '@/api/sprints'
import { getTasksApi, createTaskApi, updateTaskApi } from '@/api/tasks'
import { AISuggestionModal } from '@/components/kanban/AISuggestionModal'
import { AgentOrchestrationModal } from '@/components/kanban/AgentOrchestrationModal'
import type { Project, Sprint, Task } from '@/types/project'
import toast from 'react-hot-toast'
import { useProjectStore } from '@/store/projectStore'

export function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([])
  const [sprintTasks, setSprintTasks] = useState<Record<string, Task[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({})
  
   const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [newTaskSprintId, setNewTaskSprintId] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadData()
    }
  }, [projectId])

  // Cleanup project from store on unmount
  useEffect(() => () => { setActiveProject(null) }, [])

  const loadData = async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const [projRes, sprintRes, taskRes] = await Promise.all([
        getProjectDetailApi(projectId),
        getSprintsApi(projectId),
        getTasksApi(projectId)
      ])

      setProject(projRes.data)
      setActiveProject(projRes.data) // Share with Navbar via global store
      setSprints(sprintRes.data)
      
      const backlog: Task[] = []
      const bySprint: Record<string, Task[]> = {}
      
      taskRes.data.forEach(task => {
        if (task.sprint) {
          if (!bySprint[task.sprint]) bySprint[task.sprint] = []
          bySprint[task.sprint].push(task)
        } else {
          backlog.push(task)
        }
      })

      setBacklogTasks(backlog)
      setSprintTasks(bySprint)
      
      const initialExpanded: Record<string, boolean> = { backlog: true }
      sprintRes.data.forEach(s => {
        if (s.status === 'active') initialExpanded[s.id] = true
      })
      setExpandedSprints(initialExpanded)

    } catch (err) {
      toast.error('Error al cargar datos del backlog')
    } finally {
      setIsLoading(false)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result
    if (!destination) return
    
    const destId = destination.droppableId
    try {
      const sprintId = destId === 'backlog' ? null : destId
      await updateTaskApi(draggableId, { sprint: sprintId })
      toast.success('Planificación actualizada', { duration: 1500 })
      loadData()
    } catch (err) {
      toast.error('Error al mover la tarea')
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedSprints(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (isLoading) {
    return (
      <div className="backlog-loading">
        <Loader2 className="btn-spinner" size={24} style={{ color: 'rgba(34, 211, 238, 0.4)' }} />
        <p>LOADING_PLAN_DATA...</p>
      </div>
    )
  }

  return (
    <div className="backlog-wrapper">
      <header className="backlog-header">
        <div className="backlog-header-left">
          <h1 className="backlog-project-title">{project?.name?.toUpperCase()} / BACKLOG</h1>
          <span className="backlog-project-key">{project?.key}</span>
        </div>
         <div className="backlog-header-actions">
          <button 
            className="btn-secondary flex items-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={() => setIsAIModalOpen(true)}
          >
            <Sparkles size={16} /> Generar con IA
          </button>
          <button 
            className="btn-secondary flex items-center gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => setIsAgentModalOpen(true)}
          >
            <Sparkles size={16} /> Ops-Room
          </button>
          <button className="btn-primary" onClick={() => setIsSprintModalOpen(true)}>
            <Plus size={16} /> Crear Sprint
          </button>
        </div>
      </header>

      <main className="backlog-container">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="sprints-section">
            {sprints.map(sprint => (
              <SprintContainer 
                key={sprint.id} 
                sprint={sprint} 
                tasks={sprintTasks[sprint.id] || []}
                isExpanded={expandedSprints[sprint.id]}
                onToggle={() => toggleExpand(sprint.id)}
                onCreateTask={() => {
                  setNewTaskSprintId(sprint.id)
                  setIsTaskModalOpen(true)
                }}
              />
            ))}
          </div>

          <div className="backlog-section">
            <div className="backlog-list-header" onClick={() => toggleExpand('backlog')}>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  {expandedSprints['backlog'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <h2 className="section-title">Backlog</h2>
                  <span className="count-badge">{backlogTasks.length} temas</span>
                </div>
                <button className="btn-ghost" onClick={(e) => {
                  e.stopPropagation()
                  setNewTaskSprintId(null)
                  setIsTaskModalOpen(true)
                }}>
                  <Plus size={14} /> Crear Tarea
                </button>
              </div>
            </div>
            
            {expandedSprints['backlog'] && (
              <Droppable droppableId="backlog">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="task-list">
                    {backlogTasks.map((task, index) => (
                      <TaskItem key={task.id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                    {backlogTasks.length === 0 && <div className="empty-state">Backlog vacío</div>}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </DragDropContext>
      </main>

      <CreateSprintModal 
        isOpen={isSprintModalOpen} 
        onClose={() => setIsSprintModalOpen(false)} 
        projectId={projectId!}
        onSuccess={loadData}
      />
      
       <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setNewTaskSprintId(null)
        }}
        projectId={projectId!}
        sprintId={newTaskSprintId}
        onSuccess={loadData}
      />

      <AISuggestionModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        projectId={projectId!}
        onSuccess={loadData}
      />

      <AgentOrchestrationModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        projectId={projectId!}
      />

      <style>{`
        .backlog-wrapper { height: calc(100vh - 48px); display: flex; flex-direction: column; background: var(--color-bg); overflow-y: auto; }
        .backlog-header { padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .backlog-header-left { display: flex; align-items: center; gap: 12px; }
        .backlog-header-actions { display: flex; align-items: center; gap: 8px; }
        .backlog-project-title { font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; color: white; letter-spacing: 0.15em; text-transform: uppercase; }
        .backlog-project-key { padding: 2px 6px; border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; }
        .backlog-container { flex: 1; padding: 20px; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; }
        .section-title { font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.15em; }
        .count-badge { font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.2); letter-spacing: 0.1em; }
        .task-list { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); margin-top: 6px; min-height: 40px; }
        .task-item { display: flex; align-items: center; gap: 12px; padding: 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.03); background: transparent; transition: all 0.15s; cursor: grab; border-left: 2px solid transparent; }
        .task-item:last-child { border-bottom: none; }
        .task-item:hover { background: rgba(255,255,255,0.02); border-left-color: rgba(34, 211, 238, 0.4); }
        .empty-state { padding: 20px; text-align: center; font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.15); text-transform: uppercase; letter-spacing: 0.2em; }
        .sprint-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); overflow: hidden; margin-bottom: 12px; position: relative; }
        .sprint-container::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 1px; background: rgba(34, 211, 238, 0.4); }
        .sprint-header { padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .sprint-info { display: flex; align-items: center; gap: 10px; }
        .sprint-status-tag { font-family: var(--font-mono); font-size: 8px; font-weight: 700; padding: 2px 6px; text-transform: uppercase; letter-spacing: 0.1em; }
        .sprint-status-tag[data-status="active"] { background: rgba(16, 185, 129, 0.08); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .sprint-status-tag[data-status="planning"] { background: rgba(34, 211, 238, 0.08); color: rgba(34, 211, 238, 0.7); border: 1px solid rgba(34, 211, 238, 0.15); }
        .backlog-loading { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
        .backlog-loading p { font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.3em; }
        .task-type-icon { width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: white; }
        .icon-story { background: rgba(99, 102, 241, 0.8); }
        .icon-bug { background: rgba(239, 68, 68, 0.8); }
        .icon-task { background: rgba(34, 211, 238, 0.6); }
        .btn-primary { background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); padding: 5px 12px; display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .btn-primary:hover { background: rgba(34, 211, 238, 0.15); }
        .btn-ghost { background: transparent; border: none; color: rgba(255,255,255,0.2); display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
        .btn-ghost:hover { color: rgba(34, 211, 238, 0.6); }
        .btn-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); padding: 4px 10px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
        
        .form-group { margin-bottom: 14px; }
        .form-group label { display: block; font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.15em; }
        .form-control { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px; color: rgba(255,255,255,0.7); outline: none; font-family: var(--font-mono); font-size: 11px; transition: border-color 0.15s; }
        .form-control:focus { border-color: rgba(34, 211, 238, 0.4); }
      `}</style>
    </div>
  )
}

function SprintContainer({ sprint, tasks, isExpanded, onToggle, onCreateTask }: any) {
  return (
    <div className="sprint-container">
      <div className="sprint-header" onClick={onToggle}>
        <div className="sprint-info">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <h3 className="section-title">{sprint.name}</h3>
          <span className="sprint-status-tag" data-status={sprint.status}>{sprint.status}</span>
          <span className="count-badge">{tasks.length} temas</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onCreateTask(); }}>
            <Plus size={14} /> Crear Tarea
          </button>
          {sprint.status === 'planning' && (
            <button className="btn-secondary" onClick={async (e) => {
              e.stopPropagation()
              try {
                await startSprintApi(sprint.id)
                toast.success('Sprint iniciado 🚀')
                onToggle() // Maybe reload data instead
                window.location.reload() // Quick fix to refresh state
              } catch {
                toast.error('Error al iniciar sprint')
              }
            }}>
              Iniciar Sprint
            </button>
          )}
          {sprint.status === 'active' && (
            <button className="btn-secondary" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={async (e) => {
              e.stopPropagation()
              if (!confirm('¿Deseas cerrar el sprint? Las tareas incompletas volverán al backlog.')) return
              try {
                await completeSprintApi(sprint.id)
                toast.success('Sprint completado! 🎉')
                window.location.reload()
              } catch {
                toast.error('Error al completar sprint')
              }
            }}>
              Completar Sprint
            </button>
          )}
          <MoreHorizontal size={18} className="text-muted" />
        </div>
      </div>
      
      {isExpanded && (
        <Droppable droppableId={sprint.id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="task-list">
              {tasks.map((task: Task, index: number) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
              {tasks.length === 0 && <div className="empty-state">Sprint vacío. Arrastra una tarea aquí.</div>}
            </div>
          )}
        </Droppable>
      )}
    </div>
  )
}

function TaskItem({ task, index }: { task: Task, index: number }) {
  const typeIcons: any = {
    story: <div className="task-type-icon icon-story">S</div>,
    bug: <div className="task-type-icon icon-bug">B</div>,
    task: <div className="task-type-icon icon-task">T</div>,
    feature: <div className="task-type-icon icon-story">F</div>,
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-item ${snapshot.isDragging ? 'opacity-50 shadow-lg' : ''}`}
        >
          {typeIcons[task.type] || <div className="task-type-icon icon-task">U</div>}
          <span className="text-muted text-xs font-mono w-16">{task.key}</span>
          <span className="flex-1 text-sm truncate">{task.title}</span>
          {task.story_points && <span className="count-badge bg-surface-2 px-2 rounded-full">{task.story_points}</span>}
          <div className="assignee-avatar" style={{ opacity: (task.assignee || task.ai_assignee) ? 1 : 0.3 }} title={task.ai_assignee || 'Unassigned'}>
            {task.ai_assignee ? (
              <Bot size={12} className={task.ai_assignee === 'product_manager' ? 'text-purple-400' : task.ai_assignee === 'backend_architect' ? 'text-blue-400' : 'text-cyan-400'} />
            ) : (
              <User size={12} />
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

function CreateSprintModal({ isOpen, onClose, projectId, onSuccess }: any) {
  const [formData, setFormData] = useState({ name: '', goal: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createSprintApi({ ...formData, project: projectId })
      toast.success('Sprint creado')
      onSuccess()
      onClose()
      setFormData({ name: '', goal: '' })
    } catch {
      toast.error('Error al crear el sprint')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Sprint">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Sprint</label>
          <input 
            className="form-control" 
            placeholder="Ej: Sprint 1" 
            required 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Objetivo</label>
          <textarea 
            className="form-control" 
            rows={3} 
            placeholder="¿Qué queremos lograr?"
            value={formData.goal}
            onChange={e => setFormData({ ...formData, goal: e.target.value })}
          />
        </div>
        <button className="btn-primary w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Sprint'}
        </button>
      </form>
    </Modal>
  )
}

function CreateTaskModal({ isOpen, onClose, projectId, sprintId, onSuccess }: any) {
  const [formData, setFormData] = useState({ title: '', type: 'task', priority: 'medium', story_points: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createTaskApi({ ...formData, project: projectId, sprint: sprintId } as any)
      toast.success('Tarea creada')
      onSuccess()
      onClose()
      setFormData({ title: '', type: 'task', priority: 'medium', story_points: 0 })
    } catch {
      toast.error('Error al crear la tarea')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Crear Tarea en ${sprintId ? 'Sprint' : 'Backlog'}`}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título</label>
          <input 
            className="form-control" 
            required 
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label>Tipo</label>
            <select 
              className="form-control"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="task">Tarea</option>
              <option value="story">Historia</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prioridad</label>
            <select 
              className="form-control"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Story Points</label>
          <input 
            type="number" 
            className="form-control" 
            value={formData.story_points}
            onChange={e => setFormData({ ...formData, story_points: parseInt(e.target.value) || 0 })}
          />
        </div>
        <button className="btn-primary w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Tarea'}
        </button>
      </form>
    </Modal>
  )
}
