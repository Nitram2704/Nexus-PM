import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Loader2, Plus, ChevronDown, ChevronRight, MoreHorizontal, User } from 'lucide-react'
import { getProjectDetailApi } from '@/api/projects'
import { getSprintsApi } from '@/api/sprints'
import { getTasksApi, updateTaskApi } from '@/api/tasks'
import type { Project, Sprint, Task } from '@/types/project'
import toast from 'react-hot-toast'

export function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([])
  const [sprintTasks, setSprintTasks] = useState<Record<string, Task[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (projectId) {
      loadData()
    }
  }, [projectId])

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
      setSprints(sprintRes.data)
      
      // Organize tasks
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
      
      // Expand active sprint by default
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
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const destId = destination.droppableId

    // Move task locally (Simplified for now, real implementation needs state update)
    try {
      const sprintId = destId === 'backlog' ? null : destId
      await updateTaskApi(draggableId, { sprint: sprintId })
      toast.success('Planificación actualizada')
      loadData() // Reload to get fresh state
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
        <Loader2 className="btn-spinner" size={48} />
        <p>Cargando planing...</p>
      </div>
    )
  }

  return (
    <div className="backlog-wrapper">
      <header className="backlog-header">
        <div className="backlog-header-left">
          <h1 className="backlog-project-title">{project?.name} / Backlog</h1>
          <span className="backlog-project-key">{project?.key}</span>
        </div>
        <div className="backlog-header-actions">
          <button className="btn-primary">
            <Plus size={16} /> Crear Sprint
          </button>
        </div>
      </header>

      <main className="backlog-container">
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Sprints Section */}
          <div className="sprints-section">
            {sprints.map(sprint => (
              <SprintContainer 
                key={sprint.id} 
                sprint={sprint} 
                tasks={sprintTasks[sprint.id] || []}
                isExpanded={expandedSprints[sprint.id]}
                onToggle={() => toggleExpand(sprint.id)}
              />
            ))}
          </div>

          {/* Backlog Section */}
          <div className="backlog-section">
            <div className="backlog-list-header" onClick={() => toggleExpand('backlog')}>
              <div className="flex items-center gap-2">
                {expandedSprints['backlog'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <h2 className="section-title">Backlog</h2>
                <span className="count-badge">{backlogTasks.length} temas</span>
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

      <style>{`
        .backlog-wrapper { height: calc(100vh - 60px); display: flex; flex-direction: column; background: var(--color-bg); overflow-y: auto; }
        .backlog-header { padding: 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--color-border); }
        .backlog-header-left { display: flex; align-items: center; gap: 12px; }
        .backlog-project-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); }
        .backlog-project-key { padding: 2px 8px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); }
        .backlog-container { flex: 1; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 32px; }
        
        .section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); }
        .count-badge { font-size: 0.75rem; color: var(--color-text-muted); }
        
        .task-list { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: 8px; margin-top: 8px; min-height: 50px; }
        .task-item { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-bottom: 1px solid var(--color-border-subtle); background: var(--color-surface); transition: background 0.2s; }
        .task-item:last-child { border-bottom: none; }
        .task-item:hover { background: var(--color-surface-2); }
        .empty-state { padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }

        .sprint-container { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
        .sprint-header { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; background: var(--color-surface-2); cursor: pointer; }
        .sprint-info { display: flex; align-items: center; gap: 12px; }
        .sprint-status-tag { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; }
        .sprint-status-tag[data-status="active"] { background: rgba(16, 185, 129, 0.1); color: #6ee7b7; }
        .sprint-status-tag[data-status="planning"] { background: rgba(59, 130, 246, 0.1); color: #93c5fd; }
        
        .backlog-loading { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--color-text-secondary); }
        
        .task-type-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border-radius: 2px; font-size: 10px; font-weight: 800; color: white; }
        .icon-story { background: #6366f1; }
        .icon-bug { background: #ef4444; }
        .icon-task { background: #3b82f6; }
        
        .btn-primary { background: var(--color-accent); color: white; border: none; padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  )
}

function SprintContainer({ sprint, tasks, isExpanded, onToggle }: { sprint: Sprint, tasks: Task[], isExpanded: boolean, onToggle: () => void }) {
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
          {sprint.status === 'planning' && (
            <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
              Iniciar Sprint
            </button>
          )}
          {sprint.status === 'active' && (
            <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem', borderColor: '#10b981', color: '#6ee7b7' }}>
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
              {tasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
              {tasks.length === 0 && <div className="empty-state">No hay tareas en este sprint. Arrastra una aquí.</div>}
            </div>
          )}
        </Droppable>
      )}
    </div>
  )
}

function TaskItem({ task, index }: { task: Task, index: number }) {
  const typeIcons = {
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
          className={`task-item ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          {typeIcons[task.type]}
          <span className="text-muted text-xs font-mono w-16">{task.key}</span>
          <span className="flex-1 text-sm">{task.title}</span>
          {task.story_points && <span className="count-badge bg-surface-2 px-2 rounded-full">{task.story_points}</span>}
          <div className="assignee-avatar" style={{ opacity: task.assignee ? 1 : 0.3 }}>
            <User size={12} />
          </div>
        </div>
      )}
    </Draggable>
  )
}
