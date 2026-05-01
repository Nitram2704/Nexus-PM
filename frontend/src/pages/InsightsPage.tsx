import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { 
  XAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts'
import { 
  Loader2, Activity,
  Users, TrendingUp
} from 'lucide-react'
import { getProjectAnalyticsApi } from '@/api/projects'

const COLORS = ['#22d3ee', '#4ade80', '#fbbf24', '#f43f5e', '#a78bfa']

export default function InsightsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['project-analytics', projectId],
    queryFn: () => getProjectAnalyticsApi(projectId!).then(res => res.data),
    enabled: !!projectId
  })

  if (isLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-cyan-400 w-4 h-4" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">LOADING_INTEL...</span>
      </div>
    </div>
  )

  const priorityData = Object.entries(data?.priorities || {}).map(([name, value]) => ({ name, value }))
  const hasBurndown = data?.burndown && data.burndown.length > 0

  return (
    <div className="h-[calc(100vh-48px)] overflow-hidden flex flex-col px-4 pt-4 pb-4 gap-4 bg-[var(--color-bg)] text-white/40 select-none">
      
      {/* HEADER */}
      <header className="flex items-center justify-between shrink-0 border-b border-white/5 pb-3">
        <div className="flex items-center gap-4">
           <h1 className="font-mono text-sm font-bold text-white uppercase tracking-[0.15em]">
             INTEL<span className="text-cyan-400">_</span>REPORT
           </h1>
           <div className="h-3 w-[1px] bg-white/10" />
           <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
             {data?.sprint_name || '// WORKFLOW_ANALYTICS'}
           </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 border border-white/5">
           <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
           <span className="font-mono text-[8px] text-white/30 uppercase tracking-widest">Active Intelligence</span>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
        
        {/* ROW 1 */}
        <div className="grid grid-cols-12 gap-3 min-h-0">
           <section className="col-span-9 border border-white/5 p-4 flex flex-col min-h-0 relative">
              <div className="absolute top-0 left-0 w-6 h-[1px] bg-cyan-400/40" />
              <div className="flex items-center justify-between mb-2 shrink-0">
                 <h2 className="font-mono text-[9px] text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                   <Activity className="w-3 h-3 text-cyan-400/60" /> BURN_VELOCITY
                 </h2>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  {hasBurndown ? (
                    <AreaChart data={data.burndown} margin={{ bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" vertical={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', fontSize: '9px', fontFamily: 'JetBrains Mono' }} />
                      <Area type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={1.5} fill="url(#colorCyan)" />
                      <defs>
                        <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.08}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white/5" />
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
           </section>

           <section className="col-span-3 border border-white/5 p-4 flex flex-col min-h-0 relative">
              <div className="absolute top-0 left-0 w-4 h-[1px] bg-amber-400/40" />
              <h2 className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-3 shrink-0 flex items-center gap-2">
                PRIORITY_MAP
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} innerRadius="65%" outerRadius="90%" paddingAngle={3} dataKey="value" stroke="none">
                      {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.4} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </section>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-12 gap-3 min-h-0">
           <section className="col-span-9 border border-white/5 p-4 flex flex-col min-h-0 relative">
              <div className="absolute top-0 left-0 w-6 h-[1px] bg-emerald-400/40" />
              <h2 className="font-mono text-[9px] text-white/30 uppercase tracking-[0.3em] mb-3 shrink-0 flex items-center gap-2">
                <Users className="w-3 h-3 text-emerald-400/60" /> TEAM_LOAD
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data?.workload || []} margin={{ bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff15" fontSize={9} tickLine={false} axisLine={false} dy={10} fontFamily="JetBrains Mono" />
                      <Bar dataKey="tasks" fill="#22d3ee" radius={[0, 0, 0, 0]} barSize={35} opacity={0.5} />
                   </BarChart>
                </ResponsiveContainer>
              </div>
           </section>

           <div className="col-span-3 border border-rose-400/10 p-4 flex flex-col justify-center relative bg-rose-500/[0.02]">
              <div className="absolute top-0 left-0 w-4 h-[1px] bg-rose-400/50" />
              <div className="flex items-center gap-2 text-rose-400/60 mb-3 font-mono text-[9px] uppercase tracking-[0.2em] font-bold">
                RISK_SENTINEL
              </div>
              <p className="text-xs text-white/50 font-semibold leading-tight uppercase tracking-tight">
                Active anomalies detected.
              </p>
              <div className="mt-4 flex items-center gap-2">
                 <div className="w-1 h-1 bg-rose-400 animate-pulse" />
                 <button className="font-mono text-[8px] uppercase text-rose-400/40 tracking-widest hover:text-rose-400 transition-colors">
                   START_AUDIT →
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
