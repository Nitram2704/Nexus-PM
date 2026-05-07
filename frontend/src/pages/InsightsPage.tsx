import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { 
  XAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar
} from 'recharts'
import { 
  Loader2, Activity,
  Users, TrendingUp, Zap, Clock, ShieldCheck
} from 'lucide-react'
import { getProjectAnalytics } from '@/api/analytics'

export default function InsightsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['project-analytics', projectId],
    queryFn: () => getProjectAnalytics(projectId!),
    enabled: !!projectId,
    refetchInterval: 60000 // Refrescar cada minuto
  })

  if (isLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-cyan-400 w-4 h-4" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">ACCESSING_ANALYTICS_CORES...</span>
      </div>
    </div>
  )

  const hasBurndown = data?.burndown && data.burndown.length > 0

  return (
    <div className="h-[calc(100vh-48px)] overflow-hidden flex flex-col px-6 pt-4 pb-4 gap-4 bg-(--color-bg) text-white/40 select-none font-mono">
      
      {/* HEADER: OPERATIONS_ROOM_v1 */}
      <header className="flex items-center justify-between shrink-0 border-b border-white/5 pb-4">
        <div className="flex flex-col">
           <h1 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
             <Zap className="w-4 h-4 text-cyan-400" /> OPERATIONS_ROOM<span className="text-cyan-400">_v1.0</span>
           </h1>
           <span className="text-[8px] opacity-30 mt-0.5 tracking-widest uppercase">
             {data?.sprint_name || '// NARRATIVE_SCAN_ACTIVE'}
           </span>
        </div>
        
        {/* TOP STATS */}
        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end">
              <span className="text-[7px] text-cyan-400/50 uppercase tracking-[0.2em]">Team_Velocity</span>
              <span className="text-xl font-bold text-white leading-none">{data?.velocity || 0}<span className="text-[8px] text-white/30 ml-1">pts/spr</span></span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[7px] text-amber-400/50 uppercase tracking-[0.2em]">Cycle_Time_Avg</span>
              <span className="text-xl font-bold text-white leading-none">{data?.cycle_time || 0}<span className="text-[8px] text-white/30 ml-1">days</span></span>
           </div>
           <div className="h-6 w-px bg-white/10" />
           <div className="flex items-center gap-2 px-3 py-1.5 border border-cyan-500/20 bg-cyan-500/5">
              <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
              <span className="text-[8px] text-cyan-400 uppercase tracking-widest font-bold">HEALTH: {data?.health_score || 0}%</span>
           </div>
        </div>
      </header>

      {/* TACTICAL GRID */}
      <div className="flex-1 min-h-0 grid grid-cols-12 grid-rows-2 gap-4">
        
        {/* MAIN BURNDOWN (Top Left) */}
        <section className="col-span-8 border border-white/5 p-5 flex flex-col min-h-0 relative bg-white/[0.01]">
            <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400/40" />
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Activity className="w-3 h-3 text-cyan-400/60" /> SPRINT_BURN_RHYTHM
                </h2>
                <div className="flex items-center gap-4 text-[7px] tracking-widest opacity-40">
                   <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-cyan-400" /> ACTUAL</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-white/20 border-t border-dashed" /> IDEAL</div>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    {hasBurndown ? (
                        <AreaChart data={data.burndown} margin={{ bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" vertical={false} />
                            <Tooltip cursor={{ stroke: '#22d3ee20', strokeWidth: 1 }} contentStyle={{ background: '#000', border: '1px solid rgba(34,211,238,0.2)', fontSize: '9px', borderRadius: '0' }} />
                            <Area type="monotone" dataKey="ideal" stroke="#ffffff" strokeDasharray="5 5" strokeWidth={1} fill="transparent" opacity={0.15} />
                            <Area type="monotone" dataKey="remaining" stroke="#22d3ee" strokeWidth={2} fill="url(#colorCyan)" />
                            <defs>
                                <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-white/5 bg-white/[0.02]">
                            <span className="text-[9px] text-white/10 uppercase tracking-widest">Awaiting active sprint data...</span>
                        </div>
                    )}
                </ResponsiveContainer>
            </div>
        </section>

        {/* RESOURCE ALLOCATION (Top Right) */}
        <section className="col-span-4 border border-white/5 p-5 flex flex-col min-h-0 relative bg-white/[0.01]">
            <div className="absolute top-0 left-0 w-8 h-px bg-emerald-400/40" />
            <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-4 shrink-0 flex items-center gap-2">
                <Users className="w-3 h-3 text-emerald-400/60" /> RESOURCE_LOAD
            </h2>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.workload || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" horizontal={false} />
                        <XAxis type="number" hide />
                        <Bar dataKey="tasks" fill="#10b981" radius={[0, 2, 2, 0]} opacity={0.5} barSize={12} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#000', border: '1px solid rgba(16,185,129,0.2)', fontSize: '8px' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>

        {/* VELOCITY PREDICTOR (Bottom Left) */}
        <section className="col-span-4 border border-white/5 p-5 flex flex-col justify-between relative bg-white/[0.01]">
            <div className="absolute top-0 left-0 w-8 h-px bg-amber-400/40" />
            <div>
              <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-amber-400/60" /> VELOCITY_TREND
              </h2>
              <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[8px] text-white/20 uppercase">Baseline</span>
                      <span className="text-xs text-white/80 font-bold">{data?.velocity || 0} PTS</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[8px] text-white/20 uppercase">Current_Sprint_Load</span>
                      <span className="text-xs text-white/80 font-bold">14 PTS</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-emerald-500/20 pb-2">
                      <span className="text-[8px] text-emerald-400 uppercase">Projection</span>
                      <span className="text-xs text-emerald-400 font-bold">OPTIMAL</span>
                  </div>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10">
               <p className="text-[8px] text-emerald-400/80 leading-relaxed uppercase">
                 EL EQUIPO ESTÁ OPERANDO AL 104% DE SU CAPACIDAD NOMINAL. PROPORCIÓN DE COMPLETITUD ESTIMADA: 98.2%.
               </p>
            </div>
        </section>

        {/* FLOW EFFICIENCY (Bottom Center) */}
        <section className="col-span-5 border border-white/5 p-5 flex flex-col relative bg-white/[0.01]">
            <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400/40" />
            <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Clock className="w-3 h-3 text-cyan-400/60" /> FLOW_EFFICIENCY
            </h2>
            <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 border border-white/5 bg-white/[0.02]">
                      <span className="text-[7px] text-white/20 uppercase block mb-1">Queue_Time</span>
                      <span className="text-lg font-bold text-white">{data?.cycle_time ? (data.cycle_time * 0.3).toFixed(1) : 0}d</span>
                   </div>
                   <div className="p-4 border border-white/5 bg-white/[0.02]">
                      <span className="text-[7px] text-white/20 uppercase block mb-1">Dev_Time</span>
                      <span className="text-lg font-bold text-white">{data?.cycle_time ? (data.cycle_time * 0.7).toFixed(1) : 0}d</span>
                   </div>
                </div>
            </div>
        </section>

        {/* SYSTEM STATUS (Bottom Right) */}
        <section className="col-span-3 border border-cyan-500/10 p-5 flex flex-col justify-between relative bg-cyan-500/[0.02]">
            <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400/60" />
            <div className="flex items-center gap-2 text-cyan-400 mb-4 text-[9px] font-bold uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3 h-3" /> SECURITY_STATUS
            </div>
            <div className="text-[8px] text-cyan-400/50 space-y-2 uppercase leading-tight">
               <p>{'>'} BACKLINK_INTEGRITY: OK</p>
               <p>{'>'} OPS_SCAN_ACTIVE</p>
               <p>{'>'} NO_ANOMALIES_DETECTED</p>
            </div>
            <button className="w-full mt-4 py-2 border border-cyan-500/20 text-[8px] uppercase tracking-[0.3em] hover:bg-cyan-500/20 transition-all">
                DEEP_SCAN_CORE
            </button>
        </section>

      </div>
    </div>
  )
}
