import { useState, useRef, useEffect } from 'react'
import { Send, X, MessageSquare as Bot, User, Loader2, Plus, Zap as Sparkles } from 'lucide-react'
import { projectChatApi, type ChatMessage } from '@/api/ai'
import { createTaskApi } from '@/api/tasks'
import type { Project } from '@/types/project'
import toast from 'react-hot-toast'

interface AIChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  project: Project | null
  onTaskCreated: () => void
}

export function AIChatDrawer({ isOpen, onClose, projectId, project, onTaskCreated }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: input.trim() }]
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await projectChatApi(projectId, input.trim(), messages)
      const aiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: response.response }]
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (_err) {
      toast.error('Error al conectar con el agente')
    } finally {
      setIsLoading(false)
    }
  }

  const parseSuggestion = (text: string) => {
    const match = text.match(/\[SUGGESTION: ({.*?})\]/)
    if (match) {
      try {
        return JSON.parse(match[1])
      } catch (_e) {
        return null
      }
    }
    return null
  }

  const handleCreateSuggestedTask = async (suggestion: { title: string, description: string, type?: string, priority?: string }) => {
    if (!project) return
    setIsCreatingTask(true)
    try {
      await createTaskApi({
        title: suggestion.title,
        description: suggestion.description,
        project: project.id,
        type: (suggestion.type || 'task') as 'feature' | 'bug' | 'task' | 'story',
        priority: (suggestion.priority || 'medium') as 'high' | 'medium' | 'low',
        column: project.columns[0]?.id
      })
      toast.success('Tarea creada desde el chat ✨')
      onTaskCreated()
      
      // Añadir mensaje de confirmación en el chat
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: `✅ ¡Hecho! He creado la tarea: **${suggestion.title}**` }]
      }])
    } catch (_err) {
      toast.error('Error al crear la tarea sugerida')
    } finally {
      setIsCreatingTask(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="ai-chat-drawer">
      <div className="chat-header">
        <div className="flex items-center gap-2">
          <div className="bot-icon">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Nexus Agent {project?.name && `- ${project.name}`}</h3>
            <p className="text-[10px] text-slate-400">Contexto: {project?.name}</p>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <Sparkles size={32} className="text-blue-500 mb-2 opacity-50" />
            <p className="text-xs text-slate-400 text-center px-8">
              ¡Hola! Soy tu asistente Nexus. Puedo ayudarte a organizar tareas o responder dudas sobre el proyecto.
            </p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const partText = Array.isArray(msg.parts) ? msg.parts[0]?.text : (typeof msg.parts === 'string' ? msg.parts : '')
          const text = partText || ''
          const suggestion = msg.role === 'model' ? parseSuggestion(text) : null
          const cleanText = text.replace(/\[SUGGESTION: {.*?}\]/, '').trim()

          return (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="message-icon">
                {msg.role === 'model' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className="message-content">
                <p className="text-xs leading-relaxed">{cleanText}</p>
                
                {suggestion && (
                  <div className="suggestion-box">
                    <div className="suggestion-info">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Sugerencia de Tarea</span>
                      <h4 className="text-xs font-semibold text-white mt-1">{suggestion.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{suggestion.description}</p>
                    </div>
                    <button 
                      className="btn-suggestion"
                      onClick={() => handleCreateSuggestedTask(suggestion)}
                      disabled={isCreatingTask}
                    >
                      {isCreatingTask ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Aprobar y Crear
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {isLoading && (
          <div className="message-wrapper model">
            <div className="message-icon">
              <Bot size={14} />
            </div>
            <div className="message-content">
              <Loader2 size={16} className="animate-spin text-blue-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            placeholder="Pregúntame algo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      <style>{`
        .ai-chat-drawer {
          position: fixed;
          top: 60px;
          right: 0;
          bottom: 0;
          width: 350px;
          background: #0f172a;
          border-left: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          z-index: 50;
          box-shadow: -10px 0 30px rgba(0,0,0,0.5);
          animation: slide-in 0.3s ease-out;
        }

        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .chat-header {
          padding: 16px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1e293b;
        }

        .bot-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .close-btn {
          color: #64748b;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          color: white;
          background: #334155;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty-chat {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .message-wrapper {
          display: flex;
          gap: 12px;
          max-width: 90%;
        }

        .message-wrapper.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .user .message-icon { background: #334155; color: #94a3b8; }
        .model .message-icon { background: #3b82f6; color: white; }

        .message-content {
          background: #1e293b;
          padding: 10px 12px;
          border-radius: 12px;
          color: #cbd5e1;
          border: 1px solid #334155;
        }

        .user .message-content {
          background: #3b82f6;
          border-color: #2563eb;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .model .message-content {
          border-bottom-left-radius: 4px;
        }

        .suggestion-box {
          margin-top: 10px;
          background: #0f172a;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-suggestion {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-suggestion:hover { background: #2563eb; }

        .chat-input-container {
          padding: 16px;
          border-top: 1px solid #1e293b;
        }

        .chat-input-wrapper {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 10px;
          display: flex;
          align-items: center;
          padding: 4px 8px;
        }

        .chat-input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 8px;
          font-size: 0.875rem;
          outline: none;
        }

        .send-btn {
          width: 32px;
          height: 32px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) { background: #2563eb; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
