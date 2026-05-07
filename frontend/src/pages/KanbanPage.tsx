import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Loader2, Plus, User, Bot } from 'lucide-react'
import { getProjectDetailApi } from '@/api/projects'
import { getSprintsApi } from '@/api/sprints'
import { createTaskApi } from '@/api/tasks'
import type { Project, Sprint, Task } from '@/types/project'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { TaskDetailDrawer } from '@/components/kanban/TaskDetailDrawer'
import { ColumnMenu } from '@/components/kanban/ColumnMenu'
import { 
  renameColumnApi, 
  clearColumnTasksApi, 
  moveAllTasksApi, 
  deleteColumnApi,
  reorderTasksApi
} from '@/api/columns'
import { ConfirmDialog } from '@/components/kanban/ConfirmDialog'
import { supabase } from '@/lib/supabase'
import { RiskBadge } from '@/components/feedback/RiskBadge'
import { ForesightPanel } from '@/components/kanban/ForesightPanel'

export function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const [project, setProject] = useState<Project | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // States for Inline Task Creation
  const [addingTaskToColumn, setAddingTaskToColumn] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  // States for Actions and Confirmations
  const [busyColumnId, setBusyColumnId] = useState<string | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: 'clear' | 'move_all' | 'delete' | null;
    columnId: string;
    targetColumnId?: string;
    columnName: string;
    targetColumnName?: string;
  }>({
    isOpen: false,
    type: null,
    columnId: '',
    columnName: ''
  })

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return

    // Subscribe to task and column changes for realtime updates
    const channel = supabase
      .channel('kanban-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks_task'
        },
        (_payload: any) => {
          // Optional: only refresh if the task belongs to this project
          // (Requires checking payload.new.project_id if available)
          loadProject()
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects_column'
        },
        () => {
          loadProject()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const handleCreateTask = async (columnId: string) => {
    if (!newTaskTitle.trim() || !project || !activeSprint) return
    setIsCreating(true)
    try {
      const res = await createTaskApi({
        title: newTaskTitle.trim(),
        project: project.id,
        column: columnId,
        sprint: activeSprint.id,
        priority: 'medium',
        type: 'task'
      })
      setProject(prev => {
        if (!prev) return null
        return {
          ...prev,
          columns: prev.columns.map(c => 
            c.id === columnId 
              ? { ...c, tasks: [...c.tasks, res.data] } 
              : c
          )
        }
      })
      setNewTaskTitle('')
      setAddingTaskToColumn(null)
      toast.success('Tarea creada')
    } catch (err) {
      toast.error('Error al crear tarea')
    } finally {
      setIsCreating(false)
    }
  }

  const loadProject = async () => {
    if (!projectId) return
    try {
      const [projRes, sprintRes] = await Promise.all([
        getProjectDetailApi(projectId),
        getSprintsApi(projectId)
      ])
      setProject(projRes.data)
      setActiveProject(projRes.data) // Share with Navbar via global store
      setSprints(sprintRes.data)
    } catch (err) {
      toast.error('Error al cargar el tablero')
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup project from store on unmount
  useEffect(() => () => { setActiveProject(null) }, [])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result

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

    // Build the ordered list of task IDs for the destination column
    const targetColumn = newColumns.find(c => c.id === destination.droppableId)
    const taskIds = targetColumn ? targetColumn.tasks.map(t => t.id) : []

    // API Call
    try {
      await reorderTasksApi(destination.droppableId, taskIds)
      // Opcional: silenciamos el toast para no saturar 
      // toast.success('Orden actualizado', { duration: 1500, position: 'bottom-right' })
    } catch (err) {
      toast.error('Error al reordenar la tarea')
      loadProject() // Rollback
    }
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    if (!project) return
    const newColumns = project.columns.map(col => ({
      ...col,
      tasks: col.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }))
    setProject({ ...project, columns: newColumns })
    setSelectedTask(updatedTask)
  }

  const handleRenameColumn = async (columnId: string, newName: string) => {
    try {
      setBusyColumnId(columnId)
      await renameColumnApi(columnId, newName)
      setProject(prev => {
        if (!prev) return null
        return {
          ...prev,
          columns: prev.columns.map(col => col.id === columnId ? { ...col, name: newName } : col)
        }
      })
      toast.success('Columna renombrada')
    } catch (err) {
      toast.error('Error al renombrar columna')
    } finally {
      setBusyColumnId(null)
    }
  }

  const handleConfirmAction = async () => {
    const { type, columnId, targetColumnId, columnName, targetColumnName } = confirmConfig
    if (!type || !columnId) return

    setBusyColumnId(columnId)
    setConfirmConfig(prev => ({ ...prev, isOpen: false }))

    try {
      if (type === 'clear') {
        const res = await clearColumnTasksApi(columnId)
        setProject(prev => {
          if (!prev) return null
          return {
            ...prev,
            columns: prev.columns.map(col => col.id === columnId ? { ...col, tasks: [] } : col)
          }
        })
        toast.success(res.data.message || 'Columna vaciada')
      } else if (type === 'move_all' && targetColumnId) {
        const res = await moveAllTasksApi(columnId, targetColumnId)
        await loadProject() // Reload to sync state correctly
        toast.success(res.data.message || `Tareas movidas a ${targetColumnName}`)
      } else if (type === 'delete') {
        await deleteColumnApi(columnId)
        setProject(prev => {
          if (!prev) return null
          return {
            ...prev,
            columns: prev.columns.filter(col => col.id !== columnId)
          }
        })
        toast.success(`Columna '${columnName}' eliminada`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al procesar la acción')
    } finally {
      setBusyColumnId(null)
      setConfirmConfig({ isOpen: false, type: null, columnId: '', columnName: '' })
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
  
  const boardColumns = project?.columns ? project.columns.map(col => ({
    ...col,
    tasks: col.tasks.filter(t => t.sprint === (activeSprint?.id || null))
  })) : []

  return (
    <div className="kanban-wrapper">
      <header className="kanban-header">
        <div className="kanban-header-left">
          <h1 className="kanban-project-title">{project?.name || 'Cargando...'}</h1>
          <span className="kanban-project-key">{project?.key}</span>
          {activeSprint && (
            <div className="flex items-center gap-2">
              <div className="active-sprint-badge">
                <span className="dot"></span>
                {activeSprint.name}
              </div>
              <RiskBadge />
            </div>
          )}
        </div>
        <div className="kanban-header-actions">
          <button 
            className="btn-primary"
            onClick={() => {
              if (boardColumns.length > 0) {
                setAddingTaskToColumn(boardColumns[0].id);
                setNewTaskTitle('');
              } else {
                toast.error('No hay columnas para añadir tareas');
              }
            }}
          >
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
          <ForesightPanel />
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {boardColumns.map((column) => (
              <div key={column.id} className="kanban-column">
                <div className="column-header">
                  <h3 className="column-title">
                    {column.name}
                    <span className="column-count">{column.tasks.length}</span>
                  </h3>
                  <ColumnMenu 
                    column={column}
                    otherColumns={boardColumns.filter(c => c.id !== column.id)}
                    isLoading={busyColumnId === column.id}
                    onRename={(newName) => handleRenameColumn(column.id, newName)}
                    onClear={() => setConfirmConfig({
                      isOpen: true,
                      type: 'clear',
                      columnId: column.id,
                      columnName: column.name
                    })}
                    onMoveAll={(targetId) => {
                      const target = project?.columns.find(c => c.id === targetId)
                      setConfirmConfig({
                        isOpen: true,
                        type: 'move_all',
                        columnId: column.id,
                        targetColumnId: targetId,
                        columnName: column.name,
                        targetColumnName: target?.name || 'otra columna'
                      })
                    }}
                    onDelete={() => setConfirmConfig({
                      isOpen: true,
                      type: 'delete',
                      columnId: column.id,
                      columnName: column.name
                    })}
                  />
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
                              onClick={() => setSelectedTask(task)}
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
                                  <div className="assignee-avatar" style={{ opacity: (task.assignee || task.ai_assignee) ? 1 : 0.3 }} title={task.ai_assignee || 'Unassigned'}>
                                    {task.ai_assignee ? (
                                      <Bot size={12} className={task.ai_assignee === 'product_manager' ? 'text-purple-400' : task.ai_assignee === 'backend_architect' ? 'text-blue-400' : 'text-cyan-400'} />
                                    ) : (
                                      <User size={12} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {addingTaskToColumn === column.id && (
                        <div className="add-task-inline">
                          <input
                            autoFocus
                            type="text"
                            placeholder="¿Qué hay que hacer?"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleCreateTask(column.id)
                              if (e.key === 'Escape') {
                                setAddingTaskToColumn(null)
                                setNewTaskTitle('')
                              }
                            }}
                            disabled={isCreating}
                            className="add-task-input"
                          />
                          <div className="add-task-actions">
                            <button 
                              className="btn-primary btn-sm"
                              onClick={() => handleCreateTask(column.id)}
                              disabled={isCreating || !newTaskTitle.trim()}
                            >
                              {isCreating ? 'Guardando...' : 'Añadir'}
                            </button>
                            <button 
                              className="btn-icon"
                              onClick={() => {
                                setAddingTaskToColumn(null)
                                setNewTaskTitle('')
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>

                {addingTaskToColumn !== column.id && (
                  <div className="column-footer">
                    <button 
                      className="btn-add-inline"
                      onClick={() => {
                        setAddingTaskToColumn(column.id)
                        setNewTaskTitle('')
                      }}
                    >
                      <Plus size={16} /> Añadir tarea
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DragDropContext>
        </main>
      )}

      <TaskDetailDrawer 
        task={selectedTask}
        members={project?.members || []}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
      />

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={handleConfirmAction}
        isLoading={!!busyColumnId}
        title={
          confirmConfig.type === 'clear' ? '¿Vaciar columna?' :
          confirmConfig.type === 'move_all' ? '¿Mover tareas?' :
          '¿Eliminar columna?'
        }
        description={
          confirmConfig.type === 'clear' ? `¿Estás seguro de que quieres eliminar todas las tareas de la columna "${confirmConfig.columnName}"? Esta acción no se puede deshacer.` :
          confirmConfig.type === 'move_all' ? `¿Quieres mover todas las tareas de "${confirmConfig.columnName}" a "${confirmConfig.targetColumnName}"?` :
          `¿Estás seguro de eliminar la columna "${confirmConfig.columnName}"? Todas las tareas que contenga se perderán permanentemente.`
        }
        confirmText={
          confirmConfig.type === 'clear' ? 'Vaciar tareas' :
          confirmConfig.type === 'move_all' ? 'Mover ahora' :
          'Eliminar columna'
        }
        variant={confirmConfig.type === 'move_all' ? 'info' : 'danger'}
      />

      <style>{`
        .kanban-wrapper { height: calc(100vh - 48px); display: flex; flex-direction: column; background: var(--color-bg); }
        .kanban-header { padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .kanban-header-left { display: flex; align-items: center; gap: 12px; }
        .kanban-project-title { font-family: var(--font-mono); font-size: 0.875rem; font-weight: 700; color: var(--color-text-primary); text-transform: uppercase; letter-spacing: 0.1em; }
        .kanban-project-key { padding: 2px 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 0.625rem; font-weight: 600; color: var(--color-primary); letter-spacing: 0.05em; }
        .kanban-board-container { flex: 1; overflow-x: auto; padding: 0 24px 24px; }
        .kanban-board { display: flex; gap: 12px; align-items: flex-start; height: 100%; min-width: max-content; }
        .kanban-column { width: 280px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; max-height: 100%; position: relative; }
        .kanban-column::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 1px; background: var(--color-primary); }
        .column-header { padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .column-title { font-family: var(--font-mono); font-size: 0.625rem; font-weight: 700; color: var(--color-text-secondary); display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.15em; }
        .column-count { font-family: var(--font-mono); font-size: 0.625rem; background: rgba(255,255,255,0.03); color: var(--color-primary); padding: 1px 6px; border: 1px solid rgba(255,255,255,0.06); }
        .column-content { flex: 1; padding: 6px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; min-height: 100px; transition: background 0.2s; }
        .column-content--active { background: rgba(34, 211, 238, 0.02); border-color: rgba(34, 211, 238, 0.1); }
        .task-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 10px 12px; cursor: grab; transition: all 0.15s; position: relative; }
        .task-card:hover { border-color: var(--color-primary); background: rgba(34, 211, 238, 0.03); }
        .task-card--dragging { cursor: grabbing; border-color: var(--color-primary); box-shadow: 0 4px 20px rgba(0,0,0,0.4); z-index: 10; }
        .task-priority-tag { font-family: var(--font-mono); font-size: 0.5625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 1px 5px; display: inline-block; margin-bottom: 6px; border: 1px solid; }
        .task-priority-tag[data-priority="high"] { border-color: rgba(244, 63, 94, 0.3); color: #fb7185; background: rgba(244, 63, 94, 0.05); }
        .task-priority-tag[data-priority="medium"] { border-color: rgba(34, 211, 238, 0.2); color: #67e8f9; background: rgba(34, 211, 238, 0.05); }
        .task-priority-tag[data-priority="low"] { border-color: rgba(74, 222, 128, 0.2); color: #86efac; background: rgba(74, 222, 128, 0.05); }
        .task-title { font-size: 0.8125rem; font-weight: 500; color: var(--color-text-primary); margin-bottom: 8px; line-height: 1.4; }
        .task-footer { display: flex; align-items: center; justify-content: space-between; }
        .task-meta { display: flex; align-items: center; gap: 8px; }
        .task-id { font-family: var(--font-mono); font-size: 0.625rem; color: var(--color-text-muted); letter-spacing: 0.05em; }
        .assignee-avatar { width: 20px; height: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
        .kanban-loading { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--color-text-secondary); font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; }
        .btn-secondary { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--color-text-primary); padding: 6px 14px; font-family: var(--font-mono); font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
        .active-sprint-badge { display: flex; align-items: center; gap: 6px; padding: 3px 10px; background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); color: #10b981; font-family: var(--font-mono); font-size: 0.625rem; font-weight: 700; margin-left: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
        .active-sprint-badge .dot { width: 4px; height: 4px; background: #10b981; box-shadow: 0 0 6px #10b981; }
        .no-active-sprint-warning { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--color-text-secondary); font-family: var(--font-mono); }
        .no-active-sprint-warning h3 { font-size: 1rem; color: var(--color-text-primary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
        .btn-primary { background: rgba(34, 211, 238, 0.1); color: var(--color-primary); border: 1px solid rgba(34, 211, 238, 0.3); padding: 6px 14px; display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-weight: 700; font-size: 0.6875rem; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.15s; }
        .btn-primary:hover { background: rgba(34, 211, 238, 0.2); border-color: rgba(34, 211, 238, 0.5); }
        .mt-4 { margin-top: 1rem; }
        
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-sm { padding: 3px 10px; font-size: 0.625rem; }
        .btn-icon { background: none; border: 1px solid transparent; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; }
        .btn-icon:hover { border-color: rgba(255,255,255,0.08); color: var(--color-text-primary); }
        
        .add-task-inline { padding: 8px; background: rgba(34, 211, 238, 0.03); border: 1px solid rgba(34, 211, 238, 0.15); margin-top: 4px; }
        .add-task-input { width: 100%; border: none; background: transparent; color: var(--color-text-primary); font-family: var(--font-mono); font-size: 0.8125rem; padding: 4px 0; margin-bottom: 8px; outline: none; }
        .add-task-input::placeholder { color: var(--color-text-muted); }
        .add-task-actions { display: flex; align-items: center; justify-content: space-between; }
        
        .column-footer { padding: 6px 10px 12px; }
        .btn-add-inline { width: 100%; background: transparent; border: 1px solid transparent; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; display: flex; align-items: center; gap: 6px; padding: 6px 8px; cursor: pointer; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.1em; }
        .btn-add-inline:hover { border-color: rgba(255,255,255,0.06); color: var(--color-text-primary); }
      `}</style>
    </div>
  )
}
