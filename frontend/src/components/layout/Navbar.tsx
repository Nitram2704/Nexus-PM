import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LogOut, Settings, Command, Cpu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import { useChatStore } from '@/store/chatStore'
import { NotificationBell } from '../notifications/NotificationBell'

export function Navbar() {
  const location = useLocation()
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const activeProject = useProjectStore((s) => s.activeProject)
  const { setIsOpen, isOpen } = useChatStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isProjectSection = !!projectId
  const isKanban = location.pathname.includes('/kanban')
  const isBacklog = location.pathname.includes('/backlog')
  const isInsights = location.pathname.includes('/insights')

  return (
    <nav className="h-12 bg-black/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-1.5 text-[10px] font-medium data-label">
        <Link to="/dashboard" className="flex items-center gap-3 hover:text-cyan-400 transition-colors py-1 group">
          <div className="relative w-5 h-5 flex items-center justify-center border border-cyan-400/30 group-hover:border-cyan-400 transition-colors">
             <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-400"></div>
             <div className="w-2 h-2 bg-cyan-400/20 group-hover:bg-cyan-400/40 transition-colors"></div>
          </div>
          <span className="hidden sm:inline font-bold tracking-widest text-white">NEXUS_PM // INIT</span>
        </Link>

        {isProjectSection && activeProject && (
          <>
            <div className="w-2 h-px bg-white/20 mx-2" />
            <Link to={`/project/${activeProject.id}/kanban`} className="hover:text-cyan-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]" title={activeProject.name}>
              SYS_{activeProject.name.toUpperCase()}
            </Link>
          </>
        )}

        {isProjectSection && (isKanban || isBacklog || isInsights) && (
          <>
            <div className="w-2 h-px bg-white/20 mx-2" />
            <div className="flex items-center gap-1 border-l border-white/10 pl-3">
              <Link to={`/project/${projectId}/kanban`} className={`px-3 py-1 border transition-all ${isKanban ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-white/40 hover:text-white'}`}>KANBAN</Link>
              <Link to={`/project/${projectId}/backlog`} className={`px-3 py-1 border transition-all ${isBacklog ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-white/40 hover:text-white'}`}>PLAN_DATA</Link>
              <Link to={`/project/${projectId}/insights`} className={`px-3 py-1 border transition-all ${isInsights ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-white/40 hover:text-white'}`}>INTEL_REPORT</Link>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 text-[10px] data-label">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1 border transition-all flex items-center gap-2 ${isOpen ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-white/10 text-white/40 hover:text-white'}`}
        >
          <Cpu className={`w-3 h-3 ${isOpen ? 'animate-pulse' : ''}`} />
          <span>INTEL_HUB</span>
        </button>
        <NotificationBell />
        <button className="text-white/40 hover:text-white transition-colors flex items-center gap-2">
          <Settings className="w-3 h-3" />
          <span className="hidden lg:inline">CONFIG</span>
        </button>
        <button onClick={handleLogout} className="text-white/40 hover:text-rose-400 transition-colors flex items-center gap-2 border border-white/5 hover:border-rose-400/30 px-3 py-1">
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">EXIT_SESSION</span>
        </button>
      </div>
    </nav>
  )
}
