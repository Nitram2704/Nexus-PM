import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  LayoutDashboard, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, Calendar, Briefcase, ExternalLink, Loader2,
  FolderOpen, Rocket
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
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-slate-400 bg-[#0b101d]">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
        <p className="text-xl font-medium tracking-tight">Preparando tu workspace...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b101d] text-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:px-12 lg:py-16 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-white/5">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
              Nexus / {user?.first_name || 'User'}
            </h1>
            <p className="text-slate-500 text-lg font-medium">Control central de tus proyectos y tareas activas.</p>
          </div>
          <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full shadow-lg shadow-blue-500/5">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-blue-400 text-sm font-bold uppercase tracking-widest">En Vivo</span>
          </div>
        </header>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            title="Total Tareas" 
            value={data?.stats.total_assigned || 0} 
            icon={<Briefcase className="w-6 h-6 text-indigo-400" />}
            color="indigo"
          />
          <StatCard 
            title="Pendientes" 
            value={data?.stats.pending || 0} 
            icon={<Clock className="w-6 h-6 text-amber-400" />}
            color="amber"
          />
          <StatCard 
            title="Completadas" 
            value={data?.stats.completed || 0} 
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          {/* Main Content: Global Task List */}
          <section className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                Tu Agenda de Tareas
              </h2>
            </div>

            <div className="bg-[#161d31] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl group/list">
              {data?.tasks && data.tasks.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {data.tasks.map((task) => (
                    <Link 
                      key={task.id} 
                      to={`/project/${task.project_id}/kanban`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/[0.03] transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-5">
                        <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 shadow-md ${
                          task.priority === 'high' ? 'bg-rose-500 shadow-rose-500/40' : 
                          task.priority === 'medium' ? 'bg-amber-500 shadow-amber-500/40' : 'bg-blue-500 shadow-blue-500/40'
                        }`} />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-2 py-0.5 rounded">
                              {task.key}
                            </span>
                            <span className="text-xs font-bold text-blue-400/80 group-hover:text-blue-400 transition-colors uppercase tracking-widest">
                              {task.project_name}
                            </span>
                          </div>
                          <p className="text-slate-100 font-bold text-xl group-hover:translate-x-1 transition-transform duration-300">
                            {task.title}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="hidden sm:block w-6 h-6 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<Rocket className="w-16 h-16 text-slate-700" />}
                  message="No tienes tareas pendientes."
                  sub="¡Excelente! Estás al día con tus responsabilidades."
                />
              )}
            </div>
          </section>

          {/* Sidebar: Recent Projects */}
          <aside className="lg:col-span-4 space-y-12">
            <section className="space-y-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <LayoutDashboard className="w-6 h-6 text-purple-500" />
                </div>
                Proyectos
              </h2>
              <div className="grid gap-5">
                {data?.projects && data.projects.length > 0 ? (
                  data.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="bg-[#161d31] border border-dashed border-white/10 p-10 rounded-3xl text-center space-y-4">
                    <FolderOpen className="w-12 h-12 text-slate-800 mx-auto" />
                    <p className="text-slate-500 font-medium leading-tight">No eres miembro de ningún proyecto activo.</p>
                    <Link to="/project/create" className="text-blue-400 text-sm font-bold hover:underline block">
                      Crear primer proyecto →
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* PM Insight Card */}
            <section className="bg-linear-to-br from-indigo-600/10 via-blue-600/5 to-transparent border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Rocket className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="font-black text-indigo-400 text-xs uppercase tracking-[0.3em] flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4" />
                  PM Insight
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed italic">
                  "Prioriza lo que está en Rojo antes de empezar nuevas tareas. Mantén la velocidad constante."
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 hover:border-indigo-500/40',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-500/40',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40'
  }
  
  return (
    <div className={`bg-linear-to-br ${colorMap[color]} bg-[#161d31] border p-8 rounded-3xl shadow-lg transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-6">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <span className="text-5xl font-black text-white tabular-nums tracking-tighter">{value}</span>
      </div>
      <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">{title}</p>
    </div>
  )
}

function ProjectCard({ project }: any) {
  return (
    <Link 
      to={`/project/${project.id}/kanban`}
      className="bg-[#161d31] border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-xl hover:border-blue-500/40 hover:bg-white/[0.04] transition-all duration-300 group"
    >
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-xl shadow-inner group-hover:scale-105 transition-transform">
          {project.key}
        </div>
        <div>
          <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg tracking-tight leading-none mb-1">
            {project.name}
          </h3>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            {project.role}
          </span>
        </div>
      </div>
      <ExternalLink className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors" />
    </Link>
  )
}

function EmptyState({ icon, message, sub }: any) {
  return (
    <div className="p-20 text-center space-y-6">
      <div className="inline-block p-8 bg-white/[0.02] border border-dashed border-white/10 rounded-full animate-pulse transition-all">
        {icon}
      </div>
      <div className="space-y-2">
        <p className="text-white font-bold text-2xl tracking-tight">{message}</p>
        <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">{sub}</p>
      </div>
    </div>
  )
}
