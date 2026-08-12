import { useState, useEffect } from 'react'
import { X, User, MessageSquare, Send, ChevronDown } from 'lucide-react'
import { getTaskCommentsApi, addCommentApi, updateTaskApi } from '@/api/tasks'
import type { Task, Comment, Member } from '@/types/project'
import toast from 'react-hot-toast'

interface TaskDetailDrawerProps {
  task: Task | null
  members: Member[]
  onClose: () => void
  onUpdate: (updatedTask: Task) => void
}

export function TaskDetailDrawer({ task, members, onClose, onUpdate }: TaskDetailDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [assignee, setAssignee] = useState<number | null>(null)

  const loadComments = async () => {
    if (!task) return
    try {
      const res = await getTaskCommentsApi(task.id)
      setComments(res.data)
    } catch {
      console.error('Error loading comments')
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await addCommentApi(task.id, newComment)
      setComments([...comments, res.data])
      setNewComment('')
      toast.success('Comentario añadido')
    } catch {
      toast.error('Error al añadir comentario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateField = async (field: keyof Task, value: Task[keyof Task]) => {
    if (!task) return
    try {
      const res = await updateTaskApi(task.id, { [field]: value })
      onUpdate(res.data)
    } catch {
      toast.error('Error al actualizar')
    }
  }

  useEffect(() => {
    if (task) {
      loadComments()
      setDescription(task.description || '')
      setPriority(task.priority)
      setAssignee(task.assignee)
    }
  }, [task])

  if (!task) return null

  return (
    <>
      <div className={`drawer-overlay ${task ? 'active' : ''}`} onClick={onClose} />
      <div className={`task-drawer ${task ? 'active' : ''}`}>
        <header className="drawer-header">
          <div className="drawer-header-left">
            <span className="task-key">{task.key}</span>
            <h2 className="task-title">{task.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="drawer-content">
          <div className="drawer-section">
            <label className="section-label">Descripción</label>
            {isEditingDescription ? (
              <div className="edit-description-wrapper">
                <textarea
                  className="description-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Añade una descripción más detallada..."
                  autoFocus
                />
                <div className="edit-actions">
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => {
                      handleUpdateField('description', description)
                      setIsEditingDescription(false)
                    }}
                  >
                    Guardar
                  </button>
                  <button 
                    className="btn-ghost btn-sm"
                    onClick={() => {
                      setDescription(task.description || '')
                      setIsEditingDescription(false)
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="description-view"
                onClick={() => setIsEditingDescription(true)}
              >
                {description || <span className="text-muted">Añade una descripción...</span>}
              </div>
            )}
          </div>

          <div className="drawer-grid">
            <div className="drawer-section">
              <label className="section-label">Prioridad</label>
              <div className="select-wrapper">
                <select 
                  className="drawer-select"
                  value={priority}
                  onChange={(e) => {
                    const val = e.target.value as Task['priority']
                    setPriority(val)
                    handleUpdateField('priority', val)
                  }}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
                <ChevronDown size={14} className="select-icon" />
              </div>
            </div>

            <div className="drawer-section">
              <label className="section-label">Responsable</label>
              <div className="select-wrapper">
                <select 
                  className="drawer-select"
                  value={assignee || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null
                    setAssignee(val)
                    handleUpdateField('assignee', val)
                  }}
                >
                  <option value="">Sin asignar</option>
                  {members.map(member => (
                    <option key={member.id} value={member.user}>
                      {member.user_name || member.user_email}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="select-icon" />
              </div>
            </div>
          </div>

          <div className="drawer-section comments-section">
            <label className="section-label">
              <MessageSquare size={14} /> Comentarios
            </label>
            
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    <User size={12} />
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author_email}</span>
                      <span className="comment-date">
                        {new Intl.DateTimeFormat('es-ES', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }).format(new Date(comment.created_at))}
                      </span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="no-comments">No hay comentarios aún. Sé el primero.</p>
              )}
            </div>

            <form className="comment-form" onSubmit={handleAddComment}>
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(6px);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .drawer-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        .task-drawer {
          position: fixed;
          top: 0;
          right: -500px;
          width: 500px;
          height: 100vh;
          background: var(--color-surface);
          border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 101;
          display: flex;
          flex-direction: column;
          transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .task-drawer.active {
          right: 0;
        }
        .drawer-header {
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .task-key {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
          display: block;
        }
        .task-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .close-btn {
          background: none;
          border: 1px solid transparent;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          transition: all 0.15s;
        }
        .close-btn:hover { border-color: rgba(255,255,255,0.08); color: var(--color-text-primary); }
        .drawer-content { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 24px; }
        .drawer-section { display: flex; flex-direction: column; gap: 6px; }
        .section-label { font-family: var(--font-mono); font-size: 0.625rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.15em; display: flex; align-items: center; gap: 6px; }
        .description-view { padding: 10px; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; color: var(--color-text-primary); line-height: 1.6; font-size: 0.875rem; }
        .description-view:hover { border-color: rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
        .edit-description-wrapper { display: flex; flex-direction: column; gap: 10px; }
        .description-textarea { width: 100%; min-height: 100px; background: rgba(255,255,255,0.02); border: 1px solid rgba(34,211,238,0.3); padding: 10px; color: var(--color-text-primary); font-family: var(--font-mono); font-size: 0.8125rem; resize: vertical; outline: none; }
        .edit-actions { display: flex; gap: 8px; }
        .btn-sm { padding: 3px 10px; font-size: 0.6875rem; }
        .btn-ghost { background: none; border: 1px solid transparent; color: var(--color-text-secondary); cursor: pointer; font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; }
        .btn-ghost:hover { color: var(--color-text-primary); border-color: rgba(255,255,255,0.06); }
        .drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .select-wrapper { position: relative; }
        .drawer-select { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 8px 28px 8px 10px; color: var(--color-text-primary); font-family: var(--font-mono); font-size: 0.75rem; appearance: none; cursor: pointer; outline: none; transition: all 0.15s; }
        .drawer-select:hover { border-color: rgba(34,211,238,0.3); }
        .select-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
        .comments-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .comment-item { display: flex; gap: 10px; }
        .comment-avatar { width: 24px; height: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; }
        .comment-body { flex: 1; }
        .comment-header { display: flex; gap: 8px; align-items: baseline; margin-bottom: 3px; }
        .comment-author { font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; color: var(--color-text-primary); }
        .comment-date { font-family: var(--font-mono); font-size: 0.625rem; color: var(--color-text-muted); }
        .comment-text { font-size: 0.8125rem; color: var(--color-text-secondary); line-height: 1.4; }
        .no-comments { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); text-align: center; padding: 16px 0; text-transform: uppercase; letter-spacing: 0.1em; }
        .comment-input-wrapper { position: relative; display: flex; gap: 6px; }
        .comment-input { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 8px 40px 8px 12px; color: var(--color-text-primary); font-family: var(--font-mono); font-size: 0.8125rem; outline: none; transition: all 0.15s; }
        .comment-input:focus { border-color: rgba(34,211,238,0.3); }
        .send-btn { position: absolute; right: 2px; top: 2px; bottom: 2px; width: 32px; background: rgba(34,211,238,0.15); color: var(--color-primary); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
        .send-btn:disabled { background: rgba(255,255,255,0.03); color: var(--color-text-muted); cursor: not-allowed; }
        .send-btn:not(:disabled):hover { background: rgba(34,211,238,0.25); }
      `}</style>
    </>
  )
}
