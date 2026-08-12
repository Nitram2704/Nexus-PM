import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Loader2, Plus, User, Users, MessageSquare, BarChart3, Search, X, AlertCircle, Sparkles } from 'lucide-react'
import { getProjectDetailApi } from '@/api/projects'
import { getSprintsApi } from '@/api/sprints'
import { createTaskApi } from '@/api/tasks'
import type { Project, Sprint, Task } from '@/types/project'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { TaskDetailDrawer } from '@/components/kanban/TaskDetailDrawer'
import { ColumnMenu } from '@/components/kanban/ColumnMenu'
import { AISuggestionModal } from '@/components/kanban/AISuggestionModal'
import { VelocityReport } from '@/components/reports/VelocityReport'
import { BurndownChart } from '@/components/reports/BurndownChart'
import { SprintAISummary } from '@/components/reports/SprintAISummary'
import { Modal } from '@/components/Modal'
import RecommendationsPanel from '@/components/ai/RecommendationsPanel'
import { TeamPanel } from '@/components/projects/TeamPanel'
import { useUIStore } from '@/store/uiStore'
import { 
  renameColumnApi, 
  clearColumnTasksApi, 
  moveAllTasksApi, 
  deleteColumnApi,
  reorderTasksApi,
  createColumnApi,
  reorderColumnsApi
} from '@/api/columns'
import { ConfirmDialog } from '@/components/kanban/ConfirmDialog'


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
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isTeamOpen, setIsTeamOpen] = useState(false)
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false)
  const { toggleIntelligence } = useUIStore()
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [reportTab, setReportTab] = useState<'velocity' | 'burndown' | 'ai_summary'>('velocity')
  
  // Filter States (HU-21)
  const [filterText, setFilterText] = useState('')
  const [onlyMyTasks, setOnlyMyTasks] = useState(false)
  const { user: currentUser } = useAuthStore()
  
  // New Column States
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [isCreatingColumn, setIsCreatingColumn] = useState(false)
  
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

  const loadProject = async () => {
    if (!projectId) return
    try {
      const [projectRes, sprintRes] = await Promise.all([
        getProjectDetailApi(projectId),
        getSprintsApi(projectId)
      ])
      
      setProject(projectRes.data || null)
      setSprints(Array.isArray(sprintRes.data) ? sprintRes.data : [])
      
      if (projectRes.data) {
        setActiveProject(projectRes.data)
      }
    } catch (err) {
      console.error('Error loading project', err)
      toast.error('No se pudo cargar el proyecto.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  // Cleanup project from store on unmount
  useEffect(() => () => { setActiveProject(null) }, [])

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
    } catch {
      toast.error('Error al crear tarea')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !project) return
    setIsCreatingColumn(true)
    try {
      await createColumnApi(project.id, newColumnName.trim())
      setNewColumnName('')
      setIsAddingColumn(false)
      toast.success('Columna creada')
      loadProject() // Refresh to get the new column with its tasks field initialized
    } catch {
      toast.error('Error al crear columna')
    } finally {
      setIsCreatingColumn(false)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Handle Column Reordering
    if (type === 'column') {
      if (!project) return
      
      const newColumns = Array.from(project.columns)
      const [movedColumn] = newColumns.splice(source.index, 1)
      newColumns.splice(destination.index, 0, movedColumn)
      
      setProject({ ...project, columns: newColumns })
      
      try {
        await reorderColumnsApi(project.id, newColumns.map(c => c.id))
      } catch {
        toast.error('Error al reordenar columnas')
        loadProject() // Rollback
      }
      return
    }

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
    } catch {
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
    } catch {
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Error al procesar la acción')
    } finally {
      setBusyColumnId(null)
      setConfirmConfig({ isOpen: false, type: null, columnId: '', columnName: '' })
    }
  }

  const activeSprint = sprints.find(s => s.status === 'active')
  
  const boardColumns = project?.columns ? project.columns.map(col => ({
    ...col,
    tasks: (col.tasks || []).filter(t => t.sprint === (activeSprint ? activeSprint.id : null))
  })) : []

  const filteredColumns = boardColumns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(filterText.toLowerCase()) || 
                           task.key.toLowerCase().includes(filterText.toLowerCase());
      const matchesUser = !onlyMyTasks || (task.assignee === currentUser?.id);
      return matchesSearch && matchesUser;
    })
  }));

  if (isLoading) {
    return (
      <div className="kanban-loading">
        <Loader2 className="btn-spinner" size={48} />
        <p>Sincronizando tablero...</p>
      </div>
    )
  }


  return (
    <div className="kanban-wrapper">
      <header className="kanban-header">
        <div className="kanban-header-left">
          <h1 className="kanban-project-title">{project?.name?.toUpperCase() || 'LOADING...'}</h1>
          <span className="kanban-project-key">{project?.key}</span>
          {activeSprint ? (
            <div className="active-sprint-badge">
              <span className="dot"></span>
              {activeSprint.name.toUpperCase()}
            </div>
          ) : (
            <div className="no-sprint-badge">
              NO_ACTIVE_SPRINT
            </div>
          )}
        </div>
        
        <div className="kanban-filters">
          <div className="search-container">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="FILTER..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="filter-input"
            />
            {filterText && (
              <button onClick={() => setFilterText('')} className="clear-filter">
                <X size={14} />
              </button>
            )}
          </div>
          
          <button 
            className={`filter-chip ${onlyMyTasks ? 'active' : ''}`}
            onClick={() => setOnlyMyTasks(!onlyMyTasks)}
          >
            <User size={14} />
            MY_TASKS
          </button>
        </div>

        <div className="kanban-header-actions">
          <button
            className="btn-tactical"
            onClick={() => setIsTeamOpen(true)}
            title="Gestionar equipo del proyecto"
          >
            <Users size={14} />
            TEAM
          </button>
          <button
            className="btn-tactical"
            onClick={() => setIsRecommendationsOpen(true)}
            title="Ver recomendaciones de la IA"
          >
            AI_RECS
          </button>
          <button 
            className="btn-tactical"
            onClick={() => toggleIntelligence(true)}
            title="Chat con Nexus Agent"
          >
            <MessageSquare size={14} />
            CHAT
          </button>
          <button 
            className="btn-ai"
            onClick={() => setIsAIModalOpen(true)}
            title="Generar historias o backlog con IA"
          >
            ✦ NEXUS_AI
          </button>
          <button 
            className="btn-tactical"
            onClick={() => setIsReportsOpen(true)}
          >
            <BarChart3 size={14} /> REPORTS
          </button>
          <button 
            className="btn-primary-tactical"
            onClick={() => {
              if (boardColumns.length > 0) {
                setAddingTaskToColumn(boardColumns[0].id);
                setNewTaskTitle('');
              } else {
                toast.error('No hay columnas para añadir tareas');
              }
            }}
          >
            <Plus size={14} /> NEW_ITEM
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
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="kanban-board"
                >
                  {filteredColumns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          className={`kanban-column ${snapshot.isDragging ? 'kanban-column--dragging' : ''}`}
                        >
                          <div className="column-header" {...provided.dragHandleProps}>
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

                          <Droppable droppableId={column.id} type="task">
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Add Column Button / Input */}
                  <div className="kanban-column-add">
                    {isAddingColumn ? (
                      <div className="add-column-form">
                        <input
                          autoFocus
                          type="text"
                          className="add-column-input"
                          placeholder="Nombre de la columna..."
                          value={newColumnName}
                          onChange={e => setNewColumnName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleCreateColumn()
                            if (e.key === 'Escape') setIsAddingColumn(false)
                          }}
                          disabled={isCreatingColumn}
                        />
                        <div className="add-column-actions">
                          <button 
                            className="btn-primary btn-sm"
                            onClick={handleCreateColumn}
                            disabled={isCreatingColumn || !newColumnName.trim()}
                          >
                            {isCreatingColumn ? 'Creando...' : 'Añadir Columna'}
                          </button>
                          <button 
                            className="btn-icon"
                            onClick={() => setIsAddingColumn(false)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="btn-add-column"
                        onClick={() => setIsAddingColumn(true)}
                      >
                        <Plus size={20} />
                        <span>Añadir Columna</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </main>
      )}

      <TaskDetailDrawer 
        task={selectedTask}
        members={project?.members || []}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
      />

      <AISuggestionModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        projectId={projectId || ''}
        onSuccess={loadProject}
      />

      {projectId && (
        <RecommendationsPanel
          projectId={projectId}
          isOpen={isRecommendationsOpen}
          onClose={() => setIsRecommendationsOpen(false)}
        />
      )}

      <TeamPanel
        isOpen={isTeamOpen}
        onClose={() => setIsTeamOpen(false)}
        project={project}
        onChanged={loadProject}
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

      <Modal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        title="Reportes de Rendimiento"
        maxWidth="800px"
      >
        <div className="flex flex-col gap-6">
          <div className="flex gap-1 p-1 border border-white/10 self-start">
            <button 
              className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold transition-all ${
                reportTab === 'velocity' 
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30' 
                  : 'text-white/30 hover:text-white border border-transparent'
              }`}
              onClick={() => setReportTab('velocity')}
            >
              VELOCITY
            </button>
            <button 
              className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold transition-all ${
                reportTab === 'burndown' 
                  ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30' 
                  : 'text-white/30 hover:text-white border border-transparent'
              }`}
              onClick={() => setReportTab('burndown')}
            >
              BURNDOWN
            </button>
            <button 
              className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
                reportTab === 'ai_summary' 
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' 
                  : 'text-white/30 hover:text-white border border-transparent'
              }`}
              onClick={() => setReportTab('ai_summary')}
            >
              <Sparkles size={12} />
              AI_SUMMARY
            </button>
          </div>

          <div className="p-2">
            {reportTab === 'velocity' ? (
              projectId && <VelocityReport projectId={projectId} />
            ) : reportTab === 'burndown' ? (
              activeSprint ? (
                <BurndownChart sprintId={activeSprint.id} />
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center bg-[#1a2235]/50 rounded-xl border border-[#2a3655] p-8 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
                  <h3 className="text-white font-medium">Sin Sprint Activo</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">
                    El Burndown Chart requiere un sprint activo para mostrar datos de progreso diario.
                  </p>
                </div>
              )
            ) : (
              activeSprint ? (
                <SprintAISummary sprintId={activeSprint.id} />
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center bg-[#1a2235]/50 rounded-xl border border-[#2a3655] p-8 text-center">
                  <Sparkles className="w-8 h-8 text-slate-500 mb-2" />
                  <h3 className="text-white font-medium">Sin Sprint Activo</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">
                    Nexus AI necesita un sprint activo para generar un resumen ejecutivo de las tareas y el progreso.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </Modal>

      <style>{`
        .kanban-wrapper { height: calc(100vh - 48px); display: flex; flex-direction: column; background: var(--color-bg); }
        .kanban-header { padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .kanban-header-left { display: flex; align-items: center; gap: 12px; }
        
        .kanban-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 4px 10px;
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
        }

        .search-icon {
          color: rgba(255,255,255,0.2);
        }

        .filter-input {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.6);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          outline: none;
          width: 120px;
          transition: width 0.2s;
        }

        .filter-input:focus {
          width: 180px;
          color: rgba(255,255,255,0.8);
        }

        .filter-input::placeholder {
          color: rgba(255,255,255,0.15);
        }

        .clear-filter {
          background: none;
          border: none;
          color: rgba(255,255,255,0.2);
          cursor: pointer;
          display: flex;
          padding: 2px;
        }

        .clear-filter:hover {
          color: rgba(255,255,255,0.6);
        }

        .filter-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-chip:hover {
          color: rgba(255,255,255,0.5);
        }

        .filter-chip.active {
          background: rgba(34, 211, 238, 0.08);
          border-color: rgba(34, 211, 238, 0.25);
          color: #22d3ee;
        }

        .kanban-project-title { font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; color: white; letter-spacing: 0.15em; }
        .kanban-project-key { padding: 2px 6px; border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; }
        .kanban-board-container { flex: 1; overflow-x: auto; padding: 0 20px 20px; }
        .kanban-board { display: flex; gap: 16px; align-items: flex-start; height: 100%; min-width: max-content; }
        .kanban-column { width: 300px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; max-height: 100%; position: relative; }
        .kanban-column::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 1px; background: rgba(34, 211, 238, 0.4); }
        .column-header { padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .column-title { font-family: var(--font-mono); font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.2em; }
        .column-count { font-family: var(--font-mono); font-size: 9px; background: transparent; color: rgba(255,255,255,0.15); padding: 1px 6px; border: 1px solid rgba(255,255,255,0.08); }
        .column-content { flex: 1; padding: 6px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; min-height: 80px; transition: background 0.2s; }
        .column-content--active { background: rgba(34, 211, 238, 0.02); }
        .task-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-left: 2px solid transparent; padding: 10px 12px; cursor: grab; transition: all 0.15s; position: relative; }
        .task-card:hover { border-color: rgba(255,255,255,0.1); border-left-color: rgba(34, 211, 238, 0.5); background: rgba(255,255,255,0.035); }
        .task-card--dragging { cursor: grabbing; border-left-color: #22d3ee; box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 10; }
        .task-priority-tag { font-family: var(--font-mono); font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 1px 5px; display: inline-block; margin-bottom: 6px; }
        .task-priority-tag[data-priority="high"] { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .task-priority-tag[data-priority="medium"] { background: rgba(34, 211, 238, 0.08); color: rgba(34, 211, 238, 0.7); border: 1px solid rgba(34, 211, 238, 0.15); }
        .task-priority-tag[data-priority="low"] { background: rgba(16, 185, 129, 0.08); color: rgba(16, 185, 129, 0.7); border: 1px solid rgba(16, 185, 129, 0.15); }
        .task-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); margin-bottom: 10px; line-height: 1.4; letter-spacing: -0.01em; }
        .task-footer { display: flex; align-items: center; justify-content: space-between; }
        .task-meta { display: flex; align-items: center; gap: 8px; }
        .task-id { font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.15); letter-spacing: 0.1em; }
        .assignee-avatar { width: 20px; height: 20px; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.2); }
        .kanban-loading { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
        .kanban-loading p { font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.3em; }
        .btn-tactical { display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); padding: 5px 12px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .btn-tactical:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.02); }
        .active-sprint-badge { display: flex; align-items: center; gap: 6px; padding: 3px 10px; border: 1px solid rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.05); color: #10b981; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; }
        .active-sprint-badge .dot { width: 4px; height: 4px; background: #10b981; box-shadow: 0 0 6px #10b981; }
        .no-sprint-badge { padding: 3px 10px; border: 1px solid rgba(251, 191, 36, 0.2); background: rgba(251, 191, 36, 0.05); color: rgba(251, 191, 36, 0.6); font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; }
        .no-active-sprint-warning { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .no-active-sprint-warning h3 { font-family: var(--font-mono); font-size: 0.875rem; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
        .no-active-sprint-warning p { font-family: var(--font-mono); font-size: 10px; color: rgba(255,255,255,0.2); letter-spacing: 0.1em; }
        .btn-primary-tactical { background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); padding: 5px 12px; display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .btn-primary-tactical:hover { background: rgba(34, 211, 238, 0.15); border-color: rgba(34, 211, 238, 0.5); }
        .mt-4 { margin-top: 1rem; }
        
        .btn-primary { background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); padding: 5px 12px; display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .btn-primary:hover { background: rgba(34, 211, 238, 0.15); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-sm { padding: 3px 10px; font-size: 9px; }
        .btn-icon { background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; }
        .btn-icon:hover { color: rgba(255,255,255,0.5); }
        
        .add-task-inline { padding: 8px; border: 1px solid rgba(34, 211, 238, 0.3); background: rgba(34, 211, 238, 0.03); margin-top: 4px; }
        .add-task-input { width: 100%; border: none; background: transparent; color: rgba(255,255,255,0.7); font-family: var(--font-mono); font-size: 11px; padding: 4px 0; margin-bottom: 8px; outline: none; }
        .add-task-input::placeholder { color: rgba(255,255,255,0.15); }
        .add-task-actions { display: flex; align-items: center; justify-content: space-between; }
        
        .column-footer { padding: 6px 12px 12px; }
        .btn-add-inline { width: 100%; background: transparent; border: none; color: rgba(255,255,255,0.15); font-family: var(--font-mono); font-size: 9px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 6px; padding: 6px; cursor: pointer; transition: all 0.15s; }
        .btn-add-inline:hover { color: rgba(34, 211, 238, 0.6); }
        
        .btn-ai {
          background: rgba(34, 211, 238, 0.1);
          color: #22d3ee;
          border: 1px solid rgba(34, 211, 238, 0.3);
          padding: 5px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-ai:hover {
          background: rgba(34, 211, 238, 0.18);
          border-color: rgba(34, 211, 238, 0.5);
        }

        .kanban-column--dragging {
          box-shadow: 0 12px 48px rgba(0,0,0,0.5);
          border-color: rgba(34, 211, 238, 0.3);
          background: rgba(255,255,255,0.03);
        }

        .kanban-column-add {
          width: 300px;
          flex-shrink: 0;
        }

        .btn-add-column {
          width: 100%;
          height: 48px;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-add-column:hover {
          background: rgba(34, 211, 238, 0.03);
          border-color: rgba(34, 211, 238, 0.3);
          color: rgba(34, 211, 238, 0.6);
        }

        .add-column-form {
          border: 1px solid rgba(34, 211, 238, 0.3);
          background: rgba(34, 211, 238, 0.03);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .add-column-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 8px;
          color: rgba(255,255,255,0.7);
          outline: none;
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .add-column-input:focus {
          border-color: rgba(34, 211, 238, 0.4);
        }

        .add-column-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .btn-secondary { display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); padding: 5px 12px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
      `}</style>
    </div>
  )
}
