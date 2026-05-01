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
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
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
    <div className="min-h-screen bg-[var(--color-bg)] text-white/60 p-6 lg:p-10">
      
      {/* HEADER */}
      <header className="mb-10 flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Terminal className="w-4 h-4 text-cyan-400/60" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">// SYS_DASHBOARD</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Nexus<span className="text-cyan-400">_</span>PM
          </h1>
          <p className="font-mono text-xs text-white/30 mt-1">
            USER: {user?.first_name?.toUpperCase() || 'OPERATOR'} // STATUS: ONLINE
          </p>
        </div>
        <div className="text-right font-mono text-[10px] text-white/20 leading-relaxed">
          <div>BUILD: v0.7.2</div>
          <div>UPTIME: {new Date().toLocaleDateString('es-CO')}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Stats */}
        <div className="lg:col-span-3 space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20 px-1 mb-3">
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

          {/* System quote */}
          <div className="mt-8 border border-white/5 p-4 relative">
            <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-400" />
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3 h-3 text-amber-400/60" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">SYS_ADVISORY</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed italic">
              "Enfócate en la calidad. La velocidad vendrá después."
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: Operations */}
        <main className="lg:col-span-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20 px-1 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
            // OPERACIONES_ACTIVAS
          </div>

          <div className="border border-white/5 min-h-[500px] relative">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyan-400/50" />
            <div className="absolute top-0 right-0 w-1 h-1 bg-cyan-400/30" />
            
            {data?.tasks && data.tasks.length > 0 ? (
              <div className="divide-y divide-white/5">
                {data.tasks.map((task: any) => (
                  <WorkItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center gap-6 min-h-[500px]">
                <div className="w-12 h-12 border border-white/5 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white/10" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-white/60 tracking-tight">CLEAR_SKY</p>
                  <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">No pending operations detected.</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Projects */}
        <div className="lg:col-span-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20 px-1 mb-3 flex items-center gap-2">
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
    <div className={`border border-white/5 ${borderColor} border-l-2 p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</span>
      </div>
      <span className="font-mono text-2xl font-bold text-white tabular-nums">{value}</span>
    </div>
  )
}

function WorkItem({ task }: any) {
  return (
    <Link 
      to={`/project/${task.project_id}/kanban`}
      className="flex group items-center justify-between p-5 hover:bg-white/[0.02] transition-all border-l-2 border-transparent hover:border-l-cyan-400/50"
    >
      <div className="flex items-center gap-6">
        <div className={`w-1 h-10 ${
          task.priority === 'high' ? 'bg-rose-500/60' : 'bg-white/5'
        }`} />
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
            <span>{task.key}</span>
            <span className="text-white/5">|</span>
            <span>{task.project_name}</span>
          </div>
          <p className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors tracking-tight">
            {task.title}
          </p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
    </Link>
  )
}

function ProjectMiniCard({ project }: any) {
  return (
    <Link 
      to={`/project/${project.id}/kanban`}
      className="border border-white/5 p-4 flex items-center justify-between group hover:bg-white/[0.02] hover:border-white/10 transition-all relative"
    >
      <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-400/30 group-hover:bg-cyan-400 transition-colors" />
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 border border-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-white/30 group-hover:border-cyan-400/30 group-hover:text-cyan-400 transition-all">
          {project.key}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors tracking-tight">{project.name}</h3>
          <p className="font-mono text-[9px] text-white/15 uppercase tracking-widest">{project.role}</p>
        </div>
      </div>
      <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-cyan-400 transition-colors" />
    </Link>
  )
}
