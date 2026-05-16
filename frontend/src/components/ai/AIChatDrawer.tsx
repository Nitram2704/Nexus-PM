import { useState, useRef, useEffect } from 'react'
import { Send, X, MessageSquare as Bot, Loader2, Plus, Zap as Sparkles } from 'lucide-react'
import { projectChatApi, type ChatMessage } from '@/api/ai'
import { createTaskApi } from '@/api/tasks'
import type { Project } from '@/types/project'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-[48px] right-0 bottom-0 w-[400px] bg-[#020617]/90 backdrop-blur-xl border-l border-white/10 flex flex-col z-50 shadow-2xl"
        >
          {/* HUD Header Decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/20 overflow-hidden">
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-1/3 h-full bg-cyan-400/40" 
            />
          </div>

          <header className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 relative">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-[0.15em]">
                  NEXUS_AGENT // <span className="text-cyan-400">LIVE_LINK</span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                    PROJECT_CONTEXT: {project?.key || 'GLOBAL'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-white/20 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar scroll-smooth">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 space-y-4">
                 <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 relative group">
                    <Bot size={32} className="text-cyan-400/20 group-hover:text-cyan-400 transition-colors duration-500" />
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400/40" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400/40" />
                 </div>
                 <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.1em] leading-relaxed">
                   Initializing neural interface... <br/>
                   I am your Nexus strategic assistant. <br/>
                   How may I assist with your operations?
                 </p>
              </div>
            )}

            {messages.map((msg, idx) => {
              const partText = Array.isArray(msg.parts) ? msg.parts[0]?.text : (typeof msg.parts === 'string' ? msg.parts : '')
              const text = partText || ''
              const suggestion = msg.role === 'model' ? parseSuggestion(text) : null
              const cleanText = text.replace(/\[SUGGESTION: {.*?}\]/, '').trim()

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/20">
                      {msg.role === 'user' ? 'OPERATOR' : 'NEXUS_AI'}
                    </span>
                    <div className={`w-1 h-1 ${msg.role === 'user' ? 'bg-white/20' : 'bg-cyan-400'}`} />
                  </div>

                  <div className={`
                    p-3 text-[11px] font-sans leading-relaxed relative
                    ${msg.role === 'user' 
                      ? 'bg-white/5 border border-white/10 text-white rounded-l-lg rounded-tr-sm' 
                      : 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-50/90 rounded-r-lg rounded-tl-sm'
                    }
                  `}>
                    {cleanText}
                    
                    {suggestion && (
                      <div className="mt-3 p-3 bg-black/40 border border-cyan-500/30 space-y-3 relative group">
                        <div className="absolute -top-px -right-px w-2 h-2 border-t border-r border-cyan-400" />
                        
                        <div className="flex items-center gap-2">
                           <Plus className="w-3 h-3 text-cyan-400" />
                           <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                             ACTION_PROPOSAL: CREATE_TASK
                           </span>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-white uppercase">{suggestion.title}</div>
                          <p className="text-[9px] text-white/40 leading-tight italic">{suggestion.description}</p>
                        </div>

                        <button 
                          onClick={() => handleCreateSuggestedTask(suggestion)}
                          disabled={isCreatingTask}
                          className="w-full py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-30"
                        >
                          {isCreatingTask ? 'EXECUTING...' : 'AUTHORIZE_EXECUTION'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="self-start flex flex-col gap-2 max-w-[85%]">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/20">NEXUS_AI</span>
                  <div className="w-1 h-1 bg-cyan-400 animate-pulse" />
                </div>
                <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-r-lg rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-cyan-400/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-cyan-400/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-cyan-400/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="relative group">
              <input
                type="text"
                placeholder="ENTER COMMAND OR QUERY..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                className="w-full bg-black/40 border border-white/10 p-3 pr-12 text-[11px] font-mono text-white placeholder:text-white/10 focus:border-cyan-500/50 outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400/40 hover:text-cyan-400 disabled:opacity-10 transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
               <span className="text-[6px] text-white/10 uppercase tracking-[0.3em]">SECURE_CHANNEL_v4.2</span>
               <span className="text-[6px] text-white/10 uppercase tracking-[0.3em]">TOKEN_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
