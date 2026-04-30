import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  CheckCircle2, Clock, AlertTriangle, 
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
      <div className="flex items-center justify-center min-h-screen bg-[#020203]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020203] text-slate-400 p-8 lg:p-14 xl:p-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-20 items-start">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-3">
          <header className="px-4 pt-4">
             <h1 className="text-6xl font-black tracking-tighter text-white leading-none mb-10">
                Nexus<span className="text-blue-500">.</span>
             </h1>
             <p className="text-slate-500 text-lg font-medium leading-tight">
                Bienvenido, {user?.first_name}. <br />
                Sistema operativo y estable.
             </p>
          </header>

          {/* POSICIÓN INTERMEDIA FORZADA CON PIXELES */}
          <div style={{ marginTop: '280px' }}>
             <div className="px-6 mb-8 text-[11px] font-black uppercase tracking-[0.5em] text-slate-800">Estado Local</div>
             <div className="card-premium p-10 space-y-12 bg-white/0.5">
                <StatRow label="Asignadas" value={data?.stats.total_assigned || 0} icon={<Briefcase className="w-4 h-4 text-blue-500" />} />
                <div className="h-px bg-white/2" />
                <StatRow label="Pendientes" value={data?.stats.pending || 0} icon={<Clock className="w-4 h-4 text-slate-500" />} />
                <div className="h-px bg-white/2" />
                <StatRow label="Terminadas" value={data?.stats.completed || 0} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
             </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL */}
        <main className="lg:col-span-6 pt-4">
           <div className="flex items-center gap-6 px-10 mb-10">
             <Calendar className="w-4 h-4 text-blue-500/40" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Operaciones</h2>
           </div>

           <div className="card-premium min-h-[750px] flex flex-col bg-white/0.5">
              {data?.tasks && data.tasks.length > 0 ? (
                <div className="divide-y divide-white/2">
                   {data.tasks.map((task: any) => (
                     <WorkItem key={task.id} task={task} />
                   ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center gap-8">
                   <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/2 flex items-center justify-center">
                      <Rocket className="w-10 h-10 text-slate-800" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-3xl font-bold text-slate-300 tracking-tight">Cielo despejado</p>
                      <p className="text-slate-600 text-lg font-light">Sin tareas pendientes hoy.</p>
                   </div>
                </div>
              )}
           </div>
        </main>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-3">
           <section className="pt-4">
              <div className="flex items-center gap-6 px-8 mb-10">
                <FolderOpen className="w-4 h-4 text-indigo-500/40" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Ecosistema</h2>
              </div>
              <div className="space-y-4">
                 {data?.projects?.map((project: any) => (
                   <ProjectMiniCard key={project.id} project={project} />
                 ))}
              </div>
           </section>

           {/* INSIGHTS: POSICIÓN MEDIA FIJA (mt-32) */}
           <section style={{ marginTop: '280px' }}>
              <div className="card-premium p-12 bg-blue-500/1 border-blue-500/4">
                 <div className="flex flex-col gap-10">
                    <div className="flex items-center gap-5 text-blue-500/60">
                       <AlertTriangle className="w-6 h-6" />
                       <span className="text-[11px] font-black uppercase tracking-[0.3em]">Consejo Nexus</span>
                    </div>
                    <p className="text-2xl text-slate-500 font-medium italic tracking-tight leading-relaxed">
                       "Enfócate en la calidad. La velocidad vendrá después."
                    </p>
                 </div>
              </div>
           </section>
        </div>

      </div>
    </div>
  )
}

function StatRow({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between py-2 px-2">
      <div className="flex items-center gap-8">
        <div className="p-3 rounded-lg bg-white/2">
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-700">{label}</span>
      </div>
      <span className="text-5xl font-black text-white tracking-widest tabular-nums">{value}</span>
    </div>
  )
}

function WorkItem({ task }: any) {
  return (
    <Link 
      to={`/project/${task.project_id}/kanban`}
      className="flex group items-center justify-between p-10 hover:bg-white/1.5 transition-all border-l-2 border-transparent hover:border-blue-500/20"
    >
      <div className="flex items-center gap-14">
        <div className={`w-2 h-16 rounded-full ${
          task.priority === 'high' ? 'bg-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-slate-900'
        }`} />
        <div className="space-y-4">
          <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-600">
            <span>{task.key}</span>
            <span className="text-blue-500/10">|</span>
            <span>{task.project_name}</span>
          </div>
          <p className="text-3xl font-black text-slate-200 group-hover:text-white transition-colors tracking-tighter">
            {task.title}
          </p>
        </div>
      </div>
      <ChevronRight className="w-8 h-8 text-slate-950 group-hover:text-blue-500 group-hover:translate-x-4 transition-all duration-500" />
    </Link>
  )
}

function ProjectMiniCard({ project }: any) {
  return (
    <Link 
      to={`/project/${project.id}/kanban`}
      className="card-premium p-10 flex items-center justify-between group border-transparent"
    >
      <div className="flex items-center gap-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center font-black text-slate-700 text-lg shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
          {project.key}
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-300 group-hover:text-white transition-colors tracking-tighter leading-none">{project.name}</h3>
          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest leading-none">{project.role}</p>
        </div>
      </div>
      <ExternalLink className="w-5 h-5 text-slate-900 group-hover:text-blue-500 transition-colors" />
    </Link>
  )
}
