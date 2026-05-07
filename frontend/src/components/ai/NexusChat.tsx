import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Terminal, Send, X, MessageSquare, 
  ChevronUp, ChevronDown, Command,
  AlertTriangle, Rocket, Activity, Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { sendMessageApi, getChatHistoryApi, type AIMessage } from '@/api/ai'
import { useProjectStore } from '@/store/projectStore'

export function NexusChat() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { setTaskModalTitle, setAiSuggestionPrompt } = useProjectStore()

  useEffect(() => {
    if (projectId && isOpen) {
      loadHistory()
    }
  }, [projectId, isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadHistory = async () => {
    if (!projectId) return
    try {
      const history = await getChatHistoryApi(projectId)
      setMessages(history)
    } catch (error) {
      console.error('Failed to load chat history', error)
    }
  }

  const handleCommand = (cmd: string): boolean => {
    const lowerCmd = cmd.toLowerCase().trim()
    
    // /tarea [title]
    if (lowerCmd.startsWith('/tarea ')) {
      const title = cmd.slice(7).trim()
      setTaskModalTitle(title)
      addSystemMessage(`Abriendo panel de creación: "${title}"`)
      return true
    }
    
    // /backlog [prompt]
    if (lowerCmd.startsWith('/backlog ')) {
      const prompt = cmd.slice(9).trim()
      setAiSuggestionPrompt(prompt)
      addSystemMessage(`Iniciando generador de backlog para: "${prompt}"`)
      if (location.pathname !== `/project/${projectId}/backlog`) {
        navigate(`/project/${projectId}/backlog`)
      }
      return true
    }

    // /intel
    if (lowerCmd === '/intel') {
      navigate(`/project/${projectId}/insights`)
      addSystemMessage('Navegando a Intel_Report...')
      return true
    }

    // /kanban
    if (lowerCmd === '/kanban') {
      navigate(`/project/${projectId}/kanban`)
      addSystemMessage('Regresando a Kanban Board...')
      return true
    }

    // /scan
    if (lowerCmd === '/scan') {
      navigate(`/project/${projectId}/insights`)
      addSystemMessage('INICIANDO_VELOCITY_SCAN_CORES...')
      addSystemMessage('Sincronizando métricas de flujo, velocidad y salud del sistema.')
      return true
    }

    // /help
    if (lowerCmd === '/help') {
      addSystemMessage(`
        COMANDOS DISPONIBLES:
        /tarea [nombre] - Crear tarea rápida
        /backlog [idea] - Generar backlog con IA
        /intel - Ver reporte de insights
        /nexus - Ver resumen narrativo (Wins/Risks)
        /scan - Ejecutar Velocity_Scan táctico
        /kanban - Ver tablero
        /help - Ver esta lista
      `)
      return true
    }

    // /nexus handled by AI
    if (lowerCmd === '/nexus') {
        addSystemMessage('Compilando narrativa del proyecto...')
        return false // Let it go to the AI
    }

    return false
  }

  const addSystemMessage = (content: string) => {
    const newMessage: AIMessage = {
      id: Math.random().toString(),
      role: 'assistant',
      content,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !projectId) return

    const userMsg = input.trim()
    setInput('')
    
    // Check for slash commands first
    if (userMsg.startsWith('/')) {
      const handled = handleCommand(userMsg)
      if (handled) return
    }

    // Add user message locally
    const tempUserMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])
    
    setIsLoading(true)
    try {
      const response = await sendMessageApi(projectId, userMsg)
      setMessages(prev => [...prev, response])
    } catch (error) {
      addSystemMessage('ERROR: No se pudo conectar con el núcleo de IA.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!projectId) return null

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-mono">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 bg-cyan-500/10 border border-cyan-400/40 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-cyan-500/20 transition-all group"
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400"></div>
            <Terminal className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 animate-pulse"></div>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              height: isMinimized ? '40px' : '450px'
            }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="w-80 bg-black/80 border border-white/10 backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5 select-none relative`}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse"></div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold tracking-widest text-[#22d3ee]">NEXUS_COMMAND_CENTER_v3</span>
                  <div className="flex items-center gap-1 opacity-40">
                    <div className="w-1 h-2 bg-cyan-400/20"></div>
                    <span className="text-[6px] uppercase">Memoria_Activa (10)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/30 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
                >
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-2">
                      <Command className="w-8 h-8" />
                      <p className="text-[10px] uppercase tracking-widest">Awaiting Command...</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[90%] p-2.5 text-[11px] leading-relaxed relative ${
                        msg.role === 'user' 
                          ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-50' 
                          : 'bg-white/5 border border-white/10 text-white/70'
                      }`}>
                         {msg.role === 'assistant' && (
                            <div className="absolute -top-1 -left-1 w-1 h-1 bg-cyan-400"></div>
                         )}
                         <div className="prose prose-invert prose-xs max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                            </ReactMarkdown>
                         </div>
                      </div>
                      <span className="text-[8px] text-white/10 mt-1 uppercase">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-cyan-400/50">
                      <div className="w-1 h-1 bg-cyan-400 animate-bounce"></div>
                      <div className="w-1 h-1 bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form 
                  onSubmit={handleSubmit}
                  className="p-3 border-t border-white/10 bg-black/40"
                >
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-cyan-400/50 text-[10px]">{'>'}</span>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="ENTER COMMAND OR QUERY..."
                      className="w-full bg-white/5 border border-white/10 py-2 pl-7 pr-10 text-[10px] text-white focus:outline-none focus:border-cyan-400/50 placeholder:text-white/10 uppercase"
                    />
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="absolute right-2 text-white/20 hover:text-cyan-400 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between opacity-30">
                    <span className="text-[7px] uppercase tracking-widest">System_Ready</span>
                    <div className="flex gap-2">
                       <Shield className="w-2.5 h-2.5" />
                       <Activity className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </form>
              </>
            )}
            
            {/* Scanline Effect overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
