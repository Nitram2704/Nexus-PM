import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface ChatState {
  isOpen: boolean
  messages: ChatMessage[]
  setIsOpen: (isOpen: boolean) => void
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  addMessage: (msg: ChatMessage) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (msgs: ChatMessage[]) => set({ messages: msgs }),
  clearMessages: () => set({ messages: [] })
}))
