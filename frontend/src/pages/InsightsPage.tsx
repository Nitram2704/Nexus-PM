import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, LineChart, Line
} from 'recharts'
import { 
  Loader2, Activity,
  Users, TrendingUp, Zap, ShieldCheck,
  Target, Globe, Cpu
} from 'lucide-react'
import { getProjectAnalytics, getHudAnalytics } from '@/api/analytics'
import { motion } from 'framer-motion'

export default function InsightsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['project-analytics', projectId],
    queryFn: () => getProjectAnalytics(projectId!),
    enabled: !!projectId,
    refetchInterval: 60000
  })

  const { data: hudData, isLoading: isHudLoading } = useQuery({
    queryKey: ['project-hud-analytics', projectId],
    queryFn: () => getHudAnalytics(projectId!),
    enabled: !!projectId,
    refetchInterval: 60000
  })

  if (isSummaryLoading || isHudLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-cyan-400 w-4 h-4" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">ACCESSING_ANALYTICS_CORES...</span>
      </div>
    </div>
  )

  const lastSnapshot = hudData && hudData.length > 0 ? hudData[hudData.length - 1] : null

  return (
    <div className="h-[calc(100vh-48px)] overflow-hidden flex flex-col px-6 pt-4 pb-4 gap-4 bg-(--color-bg) text-white/40 select-none font-mono relative">
      
      {/* HUD DECORATIONS */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-[10%] left-[-5%] w-[110%] h-px bg-cyan-500" />
        <div className="absolute top-[90%] left-[-5%] w-[110%] h-px bg-cyan-500" />
        <div className="absolute top-0 left-[10%] w-px h-full bg-cyan-500" />
        <div className="absolute top-0 left-[90%] w-px h-full bg-cyan-500" />
      </div>

      {/* HEADER: OPERATIONS_ROOM_v2 */}
      <header className="flex items-center justify-between shrink-0 border-b border-white/10 pb-4 relative z-10">
        <div className="flex flex-col">
           <h1 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
             <motion.div
               animate={{ opacity: [1, 0.5, 1] }}
               transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
             >
               <Zap className="w-4 h-4 text-cyan-400" />
             </motion.div>
             OPERATIONS_ROOM<span className="text-cyan-400">_HUD_v2.0</span>
           </h1>
           <span className="text-[8px] opacity-30 mt-0.5 tracking-widest uppercase flex items-center gap-2">
              <Globe className="w-2 h-2" /> {summaryData?.sprint_name || '// NARRATIVE_SCAN_ACTIVE'} | LATENCY: 24ms
           </span>
        </div>
        
        {/* TOP STATS */}
        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end">
              <span className="text-[7px] text-cyan-400/50 uppercase tracking-[0.2em]">Velocity_Avg</span>
              <span className="text-xl font-bold text-white leading-none">
                {lastSnapshot?.velocity || summaryData?.velocity || 0}
                <span className="text-[8px] text-white/30 ml-1">pts/spr</span>
              </span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[7px] text-amber-400/50 uppercase tracking-[0.2em]">Throughput</span>
              <span className="text-xl font-bold text-white leading-none">
                {lastSnapshot?.throughput || 0}
                <span className="text-[8px] text-white/30 ml-1">tasks</span>
              </span>
           </div>
           <div className="h-6 w-px bg-white/10" />
           <div className="flex items-center gap-3 px-3 py-1.5 border border-cyan-500/20 bg-cyan-500/5">
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-cyan-400" />
                <div className="absolute -inset-1 bg-cyan-400 animate-ping opacity-20" />
              </div>
              <span className="text-[8px] text-cyan-400 uppercase tracking-widest font-bold">
                SYSTEM_HEALTH: {summaryData?.health_score || 0}%
              </span>
           </div>
        </div>
      </header>

      {/* TACTICAL GRID */}
      <div className="flex-1 min-h-0 grid grid-cols-12 grid-rows-2 gap-4 relative z-10">
        
        {/* FLOW METRICS HISTORY (Top Left) */}
        <section className="col-span-8 border border-white/5 p-5 flex flex-col min-h-0 relative bg-white/1 group overflow-hidden">
            <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400/40 group-hover:w-full transition-all duration-700" />
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Activity className="w-3 h-3 text-cyan-400/60" /> FLOW_DYNAMICS_TIMELINE
                </h2>
                <div className="flex items-center gap-4 text-[7px] tracking-widest opacity-40">
                   <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-cyan-400" /> VELOCITY</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-0.5 bg-emerald-400" /> EFFICIENCY</div>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    {hudData && hudData.length > 0 ? (
                        <AreaChart data={hudData} margin={{ bottom: 0, top: 10 }}>
                            <defs>
                                <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" vertical={false} />
                            <Tooltip 
                              cursor={{ stroke: '#22d3ee20', strokeWidth: 1 }} 
                              contentStyle={{ background: '#000', border: '1px solid rgba(34,211,238,0.2)', fontSize: '9px', borderRadius: '0', color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="velocity" stroke="#22d3ee" strokeWidth={1} fill="url(#colorVelocity)" fillOpacity={1} />
                            <Area type="monotone" dataKey="flow_efficiency" stroke="#10b981" strokeWidth={1} fill="url(#colorEff)" fillOpacity={1} />
                        </AreaChart>
                    ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-white/5 bg-white/2">
                            <span className="text-[9px] text-white/10 uppercase tracking-widest">Compiling historical matrix...</span>
                        </div>
                    )}
                </ResponsiveContainer>
            </div>
            {/* HUD SCAN LINES */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20" style={{ backgroundSize: '100% 2px, 3px 100%' }} />
        </section>

        {/* RESOURCE LOAD MAP (Top Right) */}
        <section className="col-span-4 border border-white/5 p-5 flex flex-col min-h-0 relative bg-white/1 overflow-hidden group">
            <div className="absolute top-0 left-0 w-8 h-px bg-emerald-400/40 group-hover:w-full transition-all duration-700" />
            <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-4 shrink-0 flex items-center gap-2">
                <Users className="w-3 h-3 text-emerald-400/60" /> RESOURCE_ALLOCATION_MATRIX
            </h2>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summaryData?.workload || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} tick={{ fontSize: 6, fill: 'rgba(255,255,255,0.2)' }} />
                        <Bar dataKey="tasks" fill="#10b981" radius={[0, 1, 1, 0]} opacity={0.4} barSize={10} />
                        <Tooltip cursor={{ fill: 'rgba(16,185,129,0.05)' }} contentStyle={{ background: '#000', border: '1px solid rgba(16,185,129,0.2)', fontSize: '8px' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-[6px] tracking-widest text-white/10 uppercase">
              <span>MEMBER_ID</span>
              <span>UTILIZATION_CORE</span>
            </div>
        </section>

        {/* PREDICTIVE ANALYSIS (Bottom Left) */}
        <section className="col-span-4 border border-white/5 p-5 flex flex-col justify-between relative bg-white/1 group">
            <div className="absolute top-0 left-0 w-8 h-px bg-amber-400/40 group-hover:w-full transition-all duration-700" />
            <div>
              <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-amber-400/60" /> PERFORMANCE_PROJECTION
              </h2>
              <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[8px] text-white/20 uppercase flex items-center gap-1"><Target className="w-2 h-2" /> Cycle_Time_Target</span>
                      <span className="text-xs text-white/80 font-bold">5.0d</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <span className="text-[8px] text-white/20 uppercase">Current_Cycle_Avg</span>
                      <span className="text-xs text-white/80 font-bold">{lastSnapshot?.cycle_time_avg?.toFixed(1) || summaryData?.cycle_time || 0}d</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
                      <span className="text-[8px] text-cyan-400 uppercase">Deviation</span>
                      <span className="text-xs text-cyan-400 font-bold">
                        {lastSnapshot?.cycle_time_avg ? (lastSnapshot.cycle_time_avg - 5.0).toFixed(1) : 0}d
                      </span>
                  </div>
              </div>
            </div>
            <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 relative overflow-hidden">
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-0 bg-cyan-400/5 w-1/2 -skew-x-12"
               />
               <p className="text-[8px] text-cyan-400/80 leading-relaxed uppercase relative z-10">
                 {'>'} AI_ADVISORY: BLOQUEO DETECTADO EN SECTOR_QC. LA VELOCIDAD DE FLUJO HA DISMINUIDO UN 12% EN LAS ÚLTIMAS 24H.
               </p>
            </div>
        </section>

        {/* WORKLOAD DISTRIBUTION (Bottom Center) */}
        <section className="col-span-5 border border-white/5 p-5 flex flex-col relative bg-white/1">
            <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400/40 group-hover:w-full transition-all duration-700" />
            <h2 className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Cpu className="w-3 h-3 text-cyan-400/60" /> WORKLOAD_DISTRIBUTION
            </h2>
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hudData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" />
                     <XAxis dataKey="date" hide />
                     <YAxis hide />
                     <Line type="stepAfter" dataKey="active_tasks_count" stroke="#22d3ee" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                     <Line type="stepAfter" dataKey="completed_tasks_count" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 px-2">
               <div className="flex flex-col">
                  <span className="text-[6px] text-white/20 uppercase">WIP_Limit</span>
                  <span className="text-xs text-cyan-400 font-bold">{lastSnapshot?.active_tasks_count || 0}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[6px] text-white/20 uppercase">Throughput_Total</span>
                  <span className="text-xs text-emerald-400 font-bold">{lastSnapshot?.completed_tasks_count || 0}</span>
               </div>
            </div>
        </section>

        {/* SYSTEM CORES STATUS (Bottom Right) */}
        <section className="col-span-3 border border-cyan-500/10 p-5 flex flex-col justify-between relative bg-cyan-500/2 group">
            <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400/60 transition-all duration-700" />
            <div className="flex items-center gap-2 text-cyan-400 mb-4 text-[9px] font-bold uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3 h-3" /> CORE_STABILITY
            </div>
            <div className="text-[8px] text-cyan-400/50 space-y-2 uppercase leading-tight">
               <p className="flex justify-between"><span>DATABASE:</span> <span className="text-emerald-400">SYNC</span></p>
               <p className="flex justify-between"><span>AI_ENGINE:</span> <span className="text-cyan-400">READY</span></p>
               <p className="flex justify-between"><span>NETWORK:</span> <span className="text-emerald-400">10G_UP</span></p>
            </div>
            <div className="h-1 bg-white/5 mt-4 relative">
               <motion.div 
                 className="absolute h-full bg-cyan-400"
                 initial={{ width: 0 }}
                 animate={{ width: `${summaryData?.health_score || 0}%` }}
                 transition={{ duration: 1.5, ease: 'easeOut' }}
               />
            </div>
            <button className="w-full mt-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-[8px] uppercase tracking-[0.3em] hover:bg-cyan-500/30 hover:border-cyan-400 transition-all text-cyan-400 font-bold">
                INITIATE_DEEP_SYNC
            </button>
        </section>

      </div>
    </div>
  )
}
