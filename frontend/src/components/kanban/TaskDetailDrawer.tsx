import { useState, useEffect } from 'react'
import { X, User, MessageSquare, Send, ChevronDown, Trash2, Calendar, AlertCircle } from 'lucide-react'
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

  useEffect(() => {
    if (task) {
      loadComments()
      setDescription(task.description || '')
      setPriority(task.priority)
      setAssignee(task.assignee)
    }
  }, [task])

  const loadComments = async () => {
    if (!task) return
    try {
      const res = await getTaskCommentsApi(task.id)
      setComments(res.data)
    } catch (err) {
      console.error('Error loading comments', err)
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
    } catch (err) {
      toast.error('Error al añadir comentario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateField = async (field: keyof Task, value: any) => {
    if (!task) return
    try {
      const res = await updateTaskApi(task.id, { [field]: value })
      onUpdate(res.data)
    } catch (err) {
      toast.error('Error al actualizar')
    }
  }

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
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
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
          border-left: 1px solid var(--color-border);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
          z-index: 101;
          display: flex;
          flex-direction: column;
          transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .task-drawer.active {
          right: 0;
        }
        .drawer-header {
          padding: 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border);
        }
        .task-key {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
          display: block;
        }
        .task-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .close-btn:hover { background: var(--color-surface-2); color: var(--color-text-primary); }
        .drawer-content { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 32px; }
        .drawer-section { display: flex; flex-direction: column; gap: 8px; }
        .section-label { font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
        .description-view { padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--color-text-primary); line-height: 1.6; }
        .description-view:hover { background: var(--color-surface-2); }
        .edit-description-wrapper { display: flex; flex-direction: column; gap: 12px; }
        .description-textarea { width: 100%; min-height: 120px; background: var(--color-surface-2); border: 1px solid var(--color-accent); border-radius: 8px; padding: 12px; color: var(--color-text-primary); font-family: inherit; font-size: 0.9375rem; resize: vertical; outline: none; }
        .edit-actions { display: flex; gap: 8px; }
        .btn-sm { padding: 4px 12px; font-size: 0.8125rem; }
        .btn-ghost { background: none; border: none; color: var(--color-text-secondary); cursor: pointer; font-weight: 500; }
        .btn-ghost:hover { color: var(--color-text-primary); }
        .drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .select-wrapper { position: relative; }
        .drawer-select { width: 100%; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 32px 10px 12px; color: var(--color-text-primary); font-size: 0.875rem; appearance: none; cursor: pointer; outline: none; transition: all 0.2s; }
        .drawer-select:hover { border-color: var(--color-accent); }
        .select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
        .comments-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .comment-item { display: flex; gap: 12px; }
        .comment-avatar { width: 28px; height: 28px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; }
        .comment-body { flex: 1; }
        .comment-header { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
        .comment-author { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary); }
        .comment-date { font-size: 0.75rem; color: var(--color-text-muted); }
        .comment-text { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.4; }
        .no-comments { font-size: 0.875rem; color: var(--color-text-muted); text-align: center; padding: 20px 0; }
        .comment-input-wrapper { position: relative; display: flex; gap: 8px; }
        .comment-input { flex: 1; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 20px; padding: 10px 48px 10px 16px; color: var(--color-text-primary); font-size: 0.875rem; outline: none; transition: all 0.2s; }
        .comment-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .send-btn { position: absolute; right: 4px; top: 4px; bottom: 4px; width: 32px; background: var(--color-accent); color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .send-btn:disabled { background: var(--color-border); cursor: not-allowed; }
        .send-btn:not(:disabled):hover { transform: scale(1.05); }
      `}</style>
    </>
  )
}
