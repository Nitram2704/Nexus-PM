import { User, Bot } from 'lucide-react'
import type { AIMessage } from '@/api/ai'

interface Props {
  message: AIMessage
}

export function MessageBubble({ message }: Props) {
  const isAI = message.role === 'assistant'

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div 
        className={`flex max-w-[85%] gap-3 p-4 border transition-all duration-300 ${
          isAI 
            ? 'bg-surface-2/60 border-cyan-500/20 text-gray-200' 
            : 'bg-primary/10 border-primary/20 text-white ml-auto flex-row-reverse'
        }`}
        style={{ borderRadius: 0 }}
      >
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 font-mono text-xs ${
          isAI ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
        }`}>
          {isAI ? <Bot size={16} /> : <User size={16} />}
        </div>
        
        <div className="flex-1 overflow-hidden" dir="ltr">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500">
              {isAI ? 'Nexus AI' : 'Command User'}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-sans">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  )
}
