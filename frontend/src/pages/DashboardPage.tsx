import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, Briefcase, Loader2,
  FolderOpen, Rocket, Terminal, Activity, Shield
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
      
      {/* HEADER — single compact row */}
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-cyan-400/60" />
          <h1 className="text-sm font-bold tracking-tight text-white leading-none">
            Nexus<span className="text-cyan-400">_</span>PM
          </h1>
          <span className="font-mono text-[9px] text-white/20 ml-1">
            // {user?.first_name?.toUpperCase() || 'OPERATOR'} — ONLINE
          </span>
        </div>
        <div className="font-mono text-[8px] text-white/15 flex items-center gap-4">
          <span>BUILD: v0.7.2</span>
          <span>{new Date().toLocaleDateString('es-CO')}</span>
        </div>
      </header>

      {/* ─── MAIN: 3-col × 2-row grid filling viewport ─── */}
      <div className="flex-1 min-h-0 grid grid-cols-12 grid-rows-2 gap-3 p-3 overflow-hidden">

        {/* ▌ LEFT — Stats panel (spans both rows) */}
        <div className="col-span-3 row-span-2 border border-white/5 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-6 h-px bg-cyan-400/50" />
          
          {/* Section label */}
          <div className="px-4 pt-3 pb-2 border-b border-white/5 shrink-0">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/20">
              // ESTADO_LOCAL
            </div>
          </div>

          {/* Stats — centered vertically */}
          <div className="flex-1 flex flex-col justify-center p-3 gap-2">
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

            {/* Advisory */}
            <div className="border border-white/5 p-3 relative mt-4">
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
        </div>

        {/* ▌ CENTER TOP — Active Operations */}
        <div className="col-span-6 row-span-1 border border-white/5 flex flex-col min-h-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-px bg-emerald-400/50" />

          <div className="px-4 pt-3 pb-2 border-b border-white/5 shrink-0 flex items-center justify-between">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              OPERACIONES_ACTIVAS
            </div>
            <span className="font-mono text-[8px] text-white/10">{data?.tasks?.length || 0} ITEMS</span>
          </div>
          
          <div className="flex-1 min-h-0 overflow-auto">
            {data?.tasks && data.tasks.length > 0 ? (
              <div className="divide-y divide-white/5">
                {data.tasks.map((task: any) => (
                  <WorkItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <div className="w-8 h-8 border border-white/5 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white/10" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/40 tracking-tight">CLEAR_SKY</p>
                  <p className="font-mono text-[8px] text-white/15 uppercase tracking-widest mt-1">No pending operations detected.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ▌ RIGHT TOP — Ecosystem / Projects */}
        <div className="col-span-3 row-span-1 border border-white/5 flex flex-col min-h-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-px bg-cyan-400/40" />

          <div className="px-4 pt-3 pb-2 border-b border-white/5 shrink-0">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/20 flex items-center gap-2">
              <FolderOpen className="w-3 h-3 text-white/15" />
              ECOSYSTEM
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-2 space-y-2">
            {data?.projects?.map((project: any) => (
              <ProjectMiniCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* ▌ CENTER BOTTOM — Activity feed */}
        <div className="col-span-6 row-span-1 border border-white/5 flex flex-col min-h-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-6 h-px bg-amber-400/40" />

          <div className="px-4 pt-3 pb-2 border-b border-white/5 shrink-0">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/20 flex items-center gap-2">
              <Activity className="w-3 h-3 text-amber-400/40" />
              ACTIVITY_STREAM
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-4">
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="font-mono text-[8px] text-white/10 uppercase tracking-[0.3em]">
                Recent project activity will appear here
              </div>
              <div className="flex items-center gap-4 font-mono text-[9px] text-white/8 mt-2">
                <span>COMMITS</span>
                <span className="text-white/5">·</span>
                <span>DEPLOYMENTS</span>
                <span className="text-white/5">·</span>
                <span>REVIEWS</span>
              </div>
            </div>
          </div>
        </div>

        {/* ▌ RIGHT BOTTOM — System status */}
        <div className="col-span-3 row-span-1 border border-white/5 flex flex-col min-h-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-px bg-emerald-400/40" />

          <div className="px-4 pt-3 pb-2 border-b border-white/5 shrink-0">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/20 flex items-center gap-2">
              <Shield className="w-3 h-3 text-emerald-400/40" />
              SYS_HEALTH
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 flex flex-col gap-3">
            <HealthMetric label="API_LATENCY" status="nominal" value="< 120ms" />
            <HealthMetric label="DB_POOL" status="nominal" value="ACTIVE" />
            <HealthMetric label="AUTH_SERVICE" status="nominal" value="ONLINE" />
            <div className="mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[8px] text-emerald-400/50 uppercase tracking-widest">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─────────────── Sub-components ─────────────── */

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
      className="flex group items-center justify-between px-4 py-2.5 hover:bg-white/2 transition-all border-l-2 border-transparent hover:border-l-cyan-400/50"
    >
      <div className="flex items-center gap-3">
        <div className={`w-0.5 h-6 ${
          task.priority === 'high' ? 'bg-rose-500/60' : 'bg-white/5'
        }`} />
        <div>
          <div className="flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.15em] text-white/20">
            <span>{task.key}</span>
            <span className="text-white/5">|</span>
            <span>{task.project_name}</span>
          </div>
          <p className="text-[13px] font-medium text-white/70 group-hover:text-white transition-colors tracking-tight mt-0.5">
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
      className="border border-white/5 p-2.5 flex items-center justify-between group hover:bg-white/2 hover:border-white/10 transition-all relative"
    >
      <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-400/30 group-hover:bg-cyan-400 transition-colors" />
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 border border-white/10 flex items-center justify-center font-mono text-[8px] font-bold text-white/30 group-hover:border-cyan-400/30 group-hover:text-cyan-400 transition-all">
          {project.key}
        </div>
        <div>
          <h3 className="text-[11px] font-semibold text-white/60 group-hover:text-white transition-colors tracking-tight">{project.name}</h3>
          <p className="font-mono text-[7px] text-white/15 uppercase tracking-widest">{project.role}</p>
        </div>
      </div>
      <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-cyan-400 transition-colors" />
    </Link>
  )
}

function HealthMetric({ label, status, value }: { label: string; status: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-1 ${status === 'nominal' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-mono text-[9px] text-white/40">{value}</span>
    </div>
  )
}
