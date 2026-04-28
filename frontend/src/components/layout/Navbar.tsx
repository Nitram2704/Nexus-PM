import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LogOut, ChevronRight, LayoutDashboard, Settings, ListTodo } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'

export function Navbar() {
  const location = useLocation()
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  // Read from global store — no extra API call
  const activeProject = useProjectStore((s) => s.activeProject)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isProjectSection = !!projectId
  const isKanban = location.pathname.includes('/kanban')
  const isBacklog = location.pathname.includes('/backlog')

  return (
    <nav className="h-14 bg-[#1a2235]/90 backdrop-blur-md border-b border-[#2a3655] flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      {/* Left: branding & breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 hover:text-white transition-colors py-1.5 px-2 rounded-md hover:bg-white/5 group"
        >
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none" className="group-hover:scale-105 transition-transform">
            <rect width="40" height="40" rx="8" fill="#3b82f6" fillOpacity="0.2" />
            <path d="M10 28L20 12L30 28" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="3" fill="#3b82f6" />
          </svg>
          <span className="hidden sm:inline font-semibold text-slate-200">Nexus PM</span>
        </Link>

        {isProjectSection && activeProject && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            <Link
              to={`/project/${activeProject.id}/kanban`}
              className="hover:text-white transition-colors truncate max-w-[150px] sm:max-w-[200px]"
              title={activeProject.name}
            >
              {activeProject.name}
            </Link>
          </>
        )}

        {isProjectSection && (isKanban || isBacklog) && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mx-1" />
            <div className="flex items-center p-1 gap-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Link
                to={`/project/${projectId}/kanban`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isKanban
                    ? 'bg-slate-700 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Kanban
              </Link>
              <Link
                to={`/project/${projectId}/backlog`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isBacklog
                    ? 'bg-slate-700 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                Planificación
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Right: user actions */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-white/5"
          title="Ajustes"
        >
          <Settings className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors p-2 rounded-md hover:bg-white/5"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Salir</span>
        </button>
      </div>
    </nav>
  )
}
