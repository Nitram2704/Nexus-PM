import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Command, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { sendMessageApi, getChatHistoryApi } from '@/api/ai'
import { useProjectStore } from '@/store/projectStore'
import { useChatStore } from '@/store/chatStore'

export default function NexusChat() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { 
    messages, setMessages,
    isLoading, setIsLoading,
    addMessage
  } = useChatStore()
  
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { setTaskModalTitle, setAiSuggestionPrompt } = useProjectStore()

  const loadHistory = async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const history = await getChatHistoryApi(projectId)
      setMessages(history)
    } catch {
      console.error('Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (projectId && messages.length === 0) {
      loadHistory()
    }
  }, [projectId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleCommand = (cmd: string): boolean => {
    const lowerCmd = cmd.toLowerCase().trim()
    if (lowerCmd.startsWith('/tarea ')) {
      const title = cmd.slice(7).trim()
      setTaskModalTitle(title)
      addSystemMessage(`Acción: Creando tarea "${title}"`)
      return true
    }
    if (lowerCmd.startsWith('/backlog ')) {
      const prompt = cmd.slice(9).trim()
      setAiSuggestionPrompt(prompt)
      addSystemMessage(`Acción: Generando backlog "${prompt}"`)
      navigate(`/project/${projectId}/backlog`)
      return true
    }
    if (lowerCmd === '/intel') {
      navigate(`/project/${projectId}/insights`)
      addSystemMessage('Navegando a Intel_Hub...')
      return true
    }
    if (lowerCmd === '/help') {
      addSystemMessage(`
        COMANDOS_SOPORTADOS:
        /tarea [n] - Crear tarea
        /backlog [i] - Gen Backlog
        /intel - Ir a Insights
        /help - Ver comandos
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
    if (!input.trim() || isLoading) return

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
    } catch {
      addSystemMessage('ERROR: Respuesta fallida del CORE_IA.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent">
        {/* Messages Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 text-center grayscale">
              <Command size={48} className="animate-pulse" />
              <p className="text-[10px] mt-4 font-mono tracking-[0.3em]">AWAITING_COMMANDS</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[95%] p-3 text-[11px] font-mono leading-relaxed relative ${
                msg.role === 'user' 
                  ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                  : 'bg-white/5 border-l-2 border-gray-600 text-gray-300'
              }`}>
                <div className="text-[8px] opacity-30 mb-1 uppercase tracking-widest">
                    {msg.role === 'user' ? 'COMMANDER' : 'NEXUS_A.I.'}
                </div>
                <div className="markdown-chat prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400/50 text-[9px] font-mono animate-pulse pl-2 uppercase tracking-widest">
              <Loader2 className="w-3 h-3 animate-spin" /> Procesando_Matriz...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-cyan-500/10 bg-black/40">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escriba su comando..."
              disabled={isLoading}
              className="w-full bg-[#0a0a0a] border border-cyan-500/20 py-3 pl-4 pr-12 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-all disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="absolute right-3 p-1.5 text-cyan-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between opacity-20">
             <span className="text-[7px] text-white uppercase tracking-tighter">Enter to send</span>
             <span className="text-[7px] text-white uppercase tracking-tighter">v2.1_TACTICAL</span>
          </div>
        </div>
    </div>
  )
}
