import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { NexusChat } from '../ai/NexusChat'
import { useChatStore } from '@/store/chatStore'

export function MainLayout() {
  const { isOpen } = useChatStore()
  
  return (
    <div className="flex flex-col h-screen bg-black text-slate-100 font-sans overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ${isOpen ? 'mr-[320px]' : ''}`}>
          <Outlet />
        </main>
        <NexusChat />
      </div>
    </div>
  )
}
