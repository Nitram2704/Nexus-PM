import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  LayoutDashboard, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, Calendar, User, Briefcase, ExternalLink, Loader2
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getDashboardDataApi } from '@/api/dashboard'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['user-dashboard'],
    queryFn: () => getDashboardDataApi().then(res => res.data)
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
        <p className="text-xl font-medium">Cargando tu panel personal...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Hola, {user?.first_name || 'usuario'} 👋
          </h1>
          <p className="text-slate-400 text-lg">Aquí tienes un resumen de tu actividad en Nexus PM.</p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a2235] border border-[#2a3655] p-6 rounded-2xl shadow-xl flex items-center gap-5 group hover:border-blue-500/50 transition-all">
          <div className="p-4 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
            <Briefcase className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Tareas</p>
            <p className="text-3xl font-bold text-white">{data?.stats.total_assigned || 0}</p>
          </div>
        </div>

        <div className="bg-[#1a2235] border border-[#2a3655] p-6 rounded-2xl shadow-xl flex items-center gap-5 group hover:border-amber-500/50 transition-all">
          <div className="p-4 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-bold text-white">{data?.stats.pending || 0}</p>
          </div>
        </div>

        <div className="bg-[#1a2235] border border-[#2a3655] p-6 rounded-2xl shadow-xl flex items-center gap-5 group hover:border-emerald-500/50 transition-all">
          <div className="p-4 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completadas</p>
            <p className="text-3xl font-bold text-white">{data?.stats.completed || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Task List */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              Tus Tareas Próximas
            </h2>
          </div>

          <div className="bg-[#1a2235] border border-[#2a3655] rounded-2xl overflow-hidden shadow-2xl">
            {data?.tasks && data.tasks.length > 0 ? (
              <div className="divide-y divide-[#2a3655]">
                {data.tasks.map((task) => (
                  <Link 
                    key={task.id} 
                    to={`/project/${task.project_id}/kanban`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${
                        task.priority === 'high' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <h3 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors uppercase text-xs tracking-widest mb-1">
                          {task.key} — {task.project_name}
                        </h3>
                        <p className="text-slate-300 font-medium text-lg leading-tight">{task.title}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="inline-block p-4 bg-slate-800 rounded-full text-slate-500 italic">
                  No tienes tareas asignadas pendientes.
                </div>
                <p className="text-slate-500">¡Buen trabajo! Disfruta de la tranquilidad.</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar: Recent Projects & Quick Jump */}
        <aside className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-blue-500" />
              Proyectos Habituales
            </h2>
            <div className="grid gap-4">
              {data?.projects.map((project) => (
                <Link 
                  key={project.id}
                  to={`/project/${project.id}/kanban`}
                  className="bg-[#1a2235] border border-[#2a3655] p-5 rounded-2xl flex items-center justify-between shadow-lg hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-blue-500 text-lg">
                      {project.key}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{project.role}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <h3 className="font-bold text-blue-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Tip del PM
              </h3>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "Prioriza lo que está en Rojo (High) antes de empezar nuevas tareas 'Easy'. Mantén el flujo constante."
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
