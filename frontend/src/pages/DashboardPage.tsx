import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, Briefcase, Loader2,
  FolderOpen, Rocket, Terminal
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
      <div className="flex items-center justify-center h-[calc(100vh-48px)] bg-(--color-bg)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border border-cyan-400/30 flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">SYS_LOADING...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-48px)] bg-(--color-bg) text-white/60 flex flex-col overflow-hidden">
      
      {/* HEADER — compact */}
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <Terminal className="w-3.5 h-3.5 text-cyan-400/60" />
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              Nexus<span className="text-cyan-400">_</span>PM
            </h1>
            <p className="font-mono text-[9px] text-white/25 mt-0.5">
              USER: {user?.first_name?.toUpperCase() || 'OPERATOR'} // STATUS: ONLINE
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-[9px] text-white/15 leading-relaxed">
          <div>BUILD: v0.7.2</div>
          <div>UPTIME: {new Date().toLocaleDateString('es-CO')}</div>
        </div>
      </header>

      {/* MAIN GRID — fills remaining height */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 overflow-hidden">
        
        {/* LEFT COLUMN: Stats */}
        <div className="lg:col-span-3 flex flex-col gap-2 overflow-auto">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 px-1 mb-1">
            // ESTADO_LOCAL
          </div>
          
          <StatRow 
            label="ASSIGNED" 
            value={data?.stats.total_assigned || 0} 
            icon={<Briefcase className="w-3 h-3 text-cyan-400" />} 
            accent="cyan"
          />
          <StatRow 
            label="PENDING" 
            value={data?.stats.pending || 0} 
            icon={<Clock className="w-3 h-3 text-amber-400" />} 
            accent="amber"
          />
          <StatRow 
            label="COMPLETED" 
            value={data?.stats.completed || 0} 
            icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />} 
            accent="emerald"
          />

          {/* System quote — pushed to bottom */}
          <div className="mt-auto border border-white/5 p-3 relative">
            <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-400" />
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3 h-3 text-amber-400/60" />
              <span className="font-mono text-[8px] uppercase tracking-widest text-white/20">SYS_ADVISORY</span>
            </div>
            <p className="text-[11px] text-white/35 leading-relaxed italic">
              "Enfócate en la calidad. La velocidad vendrá después."
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: Operations */}
        <main className="lg:col-span-6 flex flex-col min-h-0 overflow-hidden">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 px-1 mb-1 flex items-center gap-2 shrink-0">
            <div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
            // OPERACIONES_ACTIVAS
          </div>

          <div className="border border-white/5 flex-1 min-h-0 relative overflow-auto">
            <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400/50" />
            <div className="absolute top-0 right-0 w-1 h-1 bg-cyan-400/30" />
            
            {data?.tasks && data.tasks.length > 0 ? (
              <div className="divide-y divide-white/5">
                {data.tasks.map((task: any) => (
                  <WorkItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center gap-4">
                <div className="w-10 h-10 border border-white/5 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white/10" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white/50 tracking-tight">CLEAR_SKY</p>
                  <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest">No pending operations detected.</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Projects */}
        <div className="lg:col-span-3 flex flex-col gap-2 overflow-auto">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 px-1 mb-1 flex items-center gap-2">
            <FolderOpen className="w-3 h-3 text-white/15" />
            // ECOSYSTEM
          </div>
          <div className="space-y-2">
            {data?.projects?.map((project: any) => (
              <ProjectMiniCard key={project.id} project={project} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function StatRow({ label, value, icon, accent }: any) {
  const borderColor = accent === 'cyan' ? 'border-l-cyan-400/30' : accent === 'amber' ? 'border-l-amber-400/30' : 'border-l-emerald-400/30'
  return (
    <div className={`border border-white/5 ${borderColor} border-l-2 p-3 flex items-center justify-between hover:bg-white/2 transition-colors`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">{label}</span>
      </div>
      <span className="font-mono text-xl font-bold text-white tabular-nums">{value}</span>
    </div>
  )
}

function WorkItem({ task }: any) {
  return (
    <Link 
      to={`/project/${task.project_id}/kanban`}
      className="flex group items-center justify-between px-4 py-3 hover:bg-white/2 transition-all border-l-2 border-transparent hover:border-l-cyan-400/50"
    >
      <div className="flex items-center gap-4">
        <div className={`w-0.5 h-8 ${
          task.priority === 'high' ? 'bg-rose-500/60' : 'bg-white/5'
        }`} />
        <div className="space-y-1">
          <div className="flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.15em] text-white/20">
            <span>{task.key}</span>
            <span className="text-white/5">|</span>
            <span>{task.project_name}</span>
          </div>
          <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors tracking-tight">
            {task.title}
          </p>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
    </Link>
  )
}

function ProjectMiniCard({ project }: any) {
  return (
    <Link 
      to={`/project/${project.id}/kanban`}
      className="border border-white/5 p-3 flex items-center justify-between group hover:bg-white/2 hover:border-white/10 transition-all relative"
    >
      <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-400/30 group-hover:bg-cyan-400 transition-colors" />
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 border border-white/10 flex items-center justify-center font-mono text-[9px] font-bold text-white/30 group-hover:border-cyan-400/30 group-hover:text-cyan-400 transition-all">
          {project.key}
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors tracking-tight">{project.name}</h3>
          <p className="font-mono text-[8px] text-white/15 uppercase tracking-widest">{project.role}</p>
        </div>
      </div>
      <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-cyan-400 transition-colors" />
    </Link>
  )
}
