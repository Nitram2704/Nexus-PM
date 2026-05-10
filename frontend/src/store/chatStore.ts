import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type AIMessage } from '@/api/ai'

interface ChatState {
  isOpen: boolean
  isMinimized: boolean
  messages: AIMessage[]
  isLoading: boolean
  
  setIsOpen: (open: boolean) => void
  setIsMinimized: (min: boolean) => void
  setMessages: (msgs: AIMessage[] | ((prev: AIMessage[]) => AIMessage[])) => void
  setIsLoading: (loading: boolean) => void
  addMessage: (msg: AIMessage) => void
  clearHistory: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      isMinimized: false,
      messages: [],
      isLoading: false,

      setIsOpen: (open) => set({ isOpen: open }),
      setIsMinimized: (min) => set({ isMinimized: min }),
      setMessages: (msgs) => set((state) => ({ 
        messages: typeof msgs === 'function' ? msgs(state.messages) : msgs 
      })),
      setIsLoading: (loading) => set({ isLoading: loading }),
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearHistory: () => set({ messages: [] })
    }),
    {
      name: 'nexus-chat-storage',
      partialize: (state) => ({ messages: state.messages }), // Persist only history
    }
  )
)
