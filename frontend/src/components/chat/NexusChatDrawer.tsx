import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { X, Send, Loader2, Sparkles } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { MessageBubble } from './MessageBubble'
import { sendMessageApi, getChatHistoryApi } from '@/api/ai'
import toast from 'react-hot-toast'

export function NexusChatDrawer() {
  const { projectId } = useParams<{ projectId: string }>()
  const { isOpen, setIsOpen, messages, setMessages, addMessage } = useChatStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingHistory, setIsFetchingHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadHistory = async () => {
    if (!projectId) return
    setIsFetchingHistory(true)
    try {
      const history = await getChatHistoryApi(projectId)
      setMessages(history)
    } catch (err) {
      console.error('History fail', err)
    } finally {
      setIsFetchingHistory(false)
    }
  }

  useEffect(() => {
    if (isOpen && projectId) {
      loadHistory()
    }
  }, [isOpen, projectId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !projectId || isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      created_at: new Date().toISOString()
    }

    addMessage(userMsg)
    setInput('')
    setIsLoading(true)

    try {
      const aiRes = await sendMessageApi(projectId, userMsg.content)
      addMessage(aiRes)
    } catch {
      toast.error('Nexus AI offline')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] z-50 bg-bg border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <header className="p-4 border-bottom flex items-center justify-between bg-surface-2/50">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-cyan-400" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-white">Nexus_Intelligence</h2>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </header>

      <main 
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none custom-scroll"
        ref={scrollRef}
      >
        {isFetchingHistory ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50">
            <Loader2 size={24} className="animate-spin text-cyan-500" />
            <span className="text-[10px] font-mono">SYNCING_HISTORY...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
            <div className="w-12 h-12 rounded-full border border-dashed border-gray-500 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <p className="text-xs font-mono">NO_DATA_LOGS. INITIATE_QUERY.</p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        {isLoading && (
          <div className="flex justify-start items-center gap-2 p-4 text-cyan-400/60 font-mono text-[10px]">
            <Loader2 size={12} className="animate-spin" />
            <span>NEXUS_CALCULATING...</span>
          </div>
        )}
      </main>

      <footer className="p-4 bg-surface-2/30 border-t border-white/5">
        <form onSubmit={handleSend} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            placeholder="Type command..."
            className="w-full bg-bg border border-white/10 p-3 pr-12 text-sm text-white resize-none outline-none focus:border-cyan-500/50 transition-all font-mono"
            rows={2}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bottom-3 p-1.5 text-cyan-500 hover:text-cyan-400 disabled:opacity-20 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[9px] font-mono text-gray-600 mt-2 text-center">
          SYSTEM_ACCESS: PROJECT_CONTEXT_AWARE
        </p>
      </footer>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}
