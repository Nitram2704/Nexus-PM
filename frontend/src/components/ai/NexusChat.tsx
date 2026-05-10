import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Terminal, Send, X, 
  ChevronUp, ChevronDown, Command,
  Activity, Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { sendMessageApi, getChatHistoryApi, type AIMessage } from '@/api/ai'
import { useProjectStore } from '@/store/projectStore'
import { useChatStore } from '@/store/chatStore'

export function NexusChat() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { 
    isOpen, setIsOpen, 
    isMinimized, setIsMinimized,
    messages, setMessages,
    isLoading, setIsLoading,
    addMessage
  } = useChatStore()
  
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { setTaskModalTitle, setAiSuggestionPrompt } = useProjectStore()

  useEffect(() => {
    if (projectId && isOpen && messages.length === 0) {
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
    setIsLoading(true)
    try {
      const history = await getChatHistoryApi(projectId)
      setMessages(history)
    } catch (error) {
      console.error('Failed to load chat history', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommand = (cmd: string): boolean => {
    const lowerCmd = cmd.toLowerCase().trim()
    if (lowerCmd.startsWith('/tarea ')) {
      const title = cmd.slice(7).trim()
      setTaskModalTitle(title)
      addSystemMessage(`Abriendo panel de creación: "${title}"`)
      return true
    }
    if (lowerCmd.startsWith('/backlog ')) {
      const prompt = cmd.slice(9).trim()
      setAiSuggestionPrompt(prompt)
      addSystemMessage(`Iniciando generador de backlog para: "${prompt}"`)
      navigate(`/project/${projectId}/backlog`)
      return true
    }
    if (lowerCmd === '/intel') {
      navigate(`/project/${projectId}/insights`)
      addSystemMessage('Navegando a Intel_Report...')
      return true
    }
    if (lowerCmd === '/help') {
      addSystemMessage(`
        COMANDOS:
        /tarea [n] - Crear tarea
        /backlog [i] - Gen Backlog
        /intel - Insights
        /scan - Velocity_Scan
        /help - Lista
      `)
      return true
    }
    return false
  }

  const addSystemMessage = (content: string) => {
    addMessage({
      id: Math.random().toString(),
      role: 'assistant',
      content,
      created_at: new Date().toISOString()
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setInput('')
    
    if (userMsg.startsWith('/')) {
      if (handleCommand(userMsg)) return
    }

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      created_at: new Date().toISOString()
    })
    
    setIsLoading(true)
    try {
      const response = await sendMessageApi(projectId || 'global', userMsg)
      addMessage(response)
    } catch (error) {
      addSystemMessage('ERROR: IA nuclear offline.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed top-12 right-0 bottom-0 z-40 font-mono transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[320px]'}`}>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-cyan-900/40 border border-cyan-400/40 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-cyan-500/20 transition-all group"
        >
          <Terminal className="w-5 h-5 group-hover:scale-110" />
        </motion.button>
      )}

      <div className={`w-[320px] h-full bg-black/95 border-l border-white/10 backdrop-blur-2xl flex flex-col overflow-hidden relative shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse"></div>
            <span className="text-[9px] font-bold tracking-widest text-cyan-400">NEXUS_COORD_CENTER</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/30 hover:text-white">
              {isMinimized ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-rose-400">
              <X size={12} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <Command size={32} />
                  <p className="text-[10px] mt-2">AWAITING COMMAND...</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-2 text-[11px] ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-400/20 text-white' : 'bg-white/5 border border-white/10 text-white/70'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-cyan-400/50 animate-pulse text-[9px]">ANALYZING...</div>}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ENTER COMMAND..."
                  className="w-full bg-white/5 border border-white/10 py-2 pl-3 pr-8 text-[10px] text-white focus:outline-none focus:border-cyan-400/50"
                />
                <button type="submit" disabled={isLoading} className="absolute right-2 text-white/20 hover:text-cyan-400">
                  <Send size={14} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
