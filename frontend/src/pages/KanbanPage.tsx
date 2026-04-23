import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Loader2, Plus, MoreHorizontal, User } from 'lucide-react'
import { getProjectDetailApi } from '@/api/projects'
import { getSprintsApi } from '@/api/sprints'
import { updateTaskApi } from '@/api/tasks'
import type { Project, Sprint } from '@/types/project'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    if (!projectId) return
    try {
      const [projRes, sprintRes] = await Promise.all([
        getProjectDetailApi(projectId),
        getSprintsApi(projectId)
      ])
      setProject(projRes.data)
      setSprints(sprintRes.data)
    } catch (err) {
      toast.error('Error al cargar el tablero')
    } finally {
      setIsLoading(false)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Optimistic UI update
    const sourceCol = project?.columns.find(c => c.id === source.droppableId)
    const destCol = project?.columns.find(c => c.id === destination.droppableId)
    
    if (!project || !sourceCol || !destCol) return

    const newColumns = [...project.columns]
    const sourceTasks = Array.from(sourceCol.tasks)
    const [movedTask] = sourceTasks.splice(source.index, 1)
    
    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask)
      const colIndex = newColumns.findIndex(c => c.id === sourceCol.id)
      newColumns[colIndex] = { ...sourceCol, tasks: sourceTasks }
    } else {
      const destTasks = Array.from(destCol.tasks)
      destTasks.splice(destination.index, 0, movedTask)
      
      const sIndex = newColumns.findIndex(c => c.id === sourceCol.id)
      const dIndex = newColumns.findIndex(c => c.id === destCol.id)
      
      newColumns[sIndex] = { ...sourceCol, tasks: sourceTasks }
      newColumns[dIndex] = { ...destCol, tasks: destTasks }
    }

    setProject({ ...project, columns: newColumns })

    // API Call
    try {
      await updateTaskApi(draggableId, { column: destination.droppableId })
      toast.success('Estado actualizado', { duration: 1500, position: 'bottom-right' })
    } catch (err) {
      toast.error('Error al guardar el cambio')
      loadProject() // Rollback
    }
  }

  if (isLoading) {
    return (
      <div className="kanban-loading">
        <Loader2 className="btn-spinner" size={48} />
        <p>Sincronizando tablero...</p>
      </div>
    )
  }

  const activeSprint = sprints.find(s => s.status === 'active')
  
  const boardColumns = project.columns.map(col => ({
    ...col,
    tasks: col.tasks.filter(t => t.sprint === (activeSprint?.id || null))
  }))

  return (
    <div className="kanban-wrapper">
      <header className="kanban-header">
        <div className="kanban-header-left">
          <h1 className="kanban-project-title">{project?.name}</h1>
          <span className="kanban-project-key">{project?.key}</span>
          {activeSprint && (
            <div className="active-sprint-badge">
              <span className="dot"></span>
              {activeSprint.name}
            </div>
          )}
        </div>
        <div className="kanban-header-actions">
          <Link to={`/project/${projectId}/backlog`} className="btn-secondary">
            Planificación
          </Link>
          <button className="btn-primary">
            <Plus size={16} /> Nuevo Ítem
          </button>
        </div>
      </header>

      {!activeSprint && (
        <div className="no-active-sprint-warning">
          <h3>No hay un sprint activo</h3>
          <p>Ve a planificación para iniciar uno o trabajar en el backlog.</p>
          <Link to={`/project/${projectId}/backlog`} className="btn-primary mt-4">
            Ir a Planificación
          </Link>
        </div>
      )}

      {activeSprint && (
        <main className="kanban-board-container">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {boardColumns.map((column) => (
              <div key={column.id} className="kanban-column">
                <div className="column-header">
                  <h3 className="column-title">
                    {column.name}
                    <span className="column-count">{column.tasks.length}</span>
                  </h3>
                  <button className="column-menu-btn"><MoreHorizontal size={16} /></button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`column-content ${snapshot.isDraggingOver ? 'column-content--active' : ''}`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card ${snapshot.isDragging ? 'task-card--dragging' : ''}`}
                            >
                              <div className="task-priority-tag" data-priority={task.priority}>
                                {task.priority}
                              </div>
                              <h4 className="task-title">{task.title}</h4>
                              <div className="task-footer">
                                <div className="task-meta">
                                  <span className="task-id">{task.key}</span>
                                </div>
                                <div className="task-assignee">
                                  <div className="assignee-avatar">
                                    <User size={12} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
        </main>
      )}

      <style>{`
        .kanban-wrapper { height: calc(100vh - 60px); display: flex; flex-direction: column; background: var(--color-bg); }
        .kanban-header { padding: 24px; display: flex; align-items: center; justify-content: space-between; }
        .kanban-header-left { display: flex; align-items: center; gap: 12px; }
        .kanban-project-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); }
        .kanban-project-key { padding: 2px 8px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); }
        .kanban-board-container { flex: 1; overflow-x: auto; padding: 0 24px 24px; }
        .kanban-board { display: flex; gap: 20px; align-items: flex-start; height: 100%; min-width: max-content; }
        .kanban-column { width: 300px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; display: flex; flex-direction: column; max-height: 100%; }
        .column-header { padding: 16px; display: flex; align-items: center; justify-content: space-between; }
        .column-title { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px; }
        .column-count { font-size: 0.75rem; background: var(--color-surface-2); color: var(--color-text-muted); padding: 2px 8px; border-radius: 10px; }
        .column-content { flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; min-height: 100px; transition: background 0.2s; }
        .column-content--active { background: rgba(59, 130, 246, 0.03); }
        .task-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; cursor: grab; transition: all 0.2s; position: relative; }
        .task-card:hover { border-color: var(--color-accent); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .task-card--dragging { cursor: grabbing; border-color: var(--color-accent); box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 10; }
        .task-priority-tag { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
        .task-priority-tag[data-priority="high"] { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
        .task-priority-tag[data-priority="medium"] { background: rgba(59, 130, 246, 0.1); color: #93c5fd; }
        .task-priority-tag[data-priority="low"] { background: rgba(16, 185, 129, 0.1); color: #6ee7b7; }
        .task-title { font-size: 0.9375rem; font-weight: 500; color: var(--color-text-primary); margin-bottom: 12px; line-height: 1.4; }
        .task-footer { display: flex; align-items: center; justify-content: space-between; }
        .task-meta { display: flex; align-items: center; gap: 8px; }
        .task-id { font-size: 0.75rem; color: var(--color-text-muted); }
        .assignee-avatar { width: 24px; height: 24px; background: var(--color-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
        .kanban-loading { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--color-text-secondary); }
        .btn-secondary { display: flex; align-items: center; gap: 6px; background: var(--color-surface-2); border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
        .active-sprint-badge { display: flex; align-items: center; gap: 8px; padding: 4px 12px; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 20px; font-size: 0.75rem; font-weight: 700; margin-left: 12px; }
        .active-sprint-badge .dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        .no-active-sprint-warning { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--color-text-secondary); }
        .no-active-sprint-warning h3 { font-size: 1.5rem; color: var(--color-text-primary); margin-bottom: 8px; }
        .btn-primary { background: var(--color-accent); color: white; border: none; padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; }
        .mt-4 { margin-top: 1rem; }
      `}</style>
    </div>
  )
}
