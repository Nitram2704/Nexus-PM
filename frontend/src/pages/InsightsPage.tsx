import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts'
import { 
  Loader2, ShieldCheck, Activity,
  Users, PieChart as PieIcon, TrendingUp
} from 'lucide-react'
import { getProjectAnalyticsApi } from '@/api/projects'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function InsightsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['project-analytics', projectId],
    queryFn: () => getProjectAnalyticsApi(projectId!).then(res => res.data),
    enabled: !!projectId
  })

  if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>

  const priorityData = Object.entries(data?.priorities || {}).map(([name, value]) => ({ name, value }))
  const hasBurndown = data?.burndown && data.burndown.length > 0

  return (
    <div className="h-[calc(100vh-130px)] overflow-hidden flex flex-col px-[10px] pt-[10px] pb-[10px] gap-6 bg-[#020203] text-slate-500 select-none animate-in fade-in duration-700">
      
      {/* HEADER: AÑADIMOS PADDING DE 10PX */}
      <header className="flex items-center justify-between shrink-0 mb-2 px-[10px]">
        <div className="flex items-center gap-6">
           <h1 className="text-3xl font-black text-white tracking-tighter">Insights<span className="text-blue-500">.</span></h1>
           <div className="h-4 w-px bg-white/10" />
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
             {data?.sprint_name || 'Workflow Analytics'}
           </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
           <ShieldCheck className="w-3 h-3 text-blue-500" />
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Intelligence</span>
        </div>
      </header>

      {/* DASHBOARD: PADDING INTERNO DE 10PX EN LAS TARJETAS ABAJO TAMBIÉN */}
      <div className="flex-1 min-h-0 grid grid-rows-2 gap-[10px] px-[10px]">
        
        {/* ROW 1: CORE METRICS */}
        <div className="grid grid-cols-12 gap-[10px] min-h-0">
           <section className="col-span-9 card-premium p-[10px] bg-white/[0.015] flex flex-col min-h-0 border-white/[0.03]">
              <div className="flex items-center justify-between mb-2 shrink-0 px-[10px]">
                 <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                   <Activity className="w-3 h-3 text-blue-500" /> Velocity Burn Rhythm
                 </h2>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  {hasBurndown ? (
                    <AreaChart data={data.burndown} margin={{ bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff02" vertical={false} />
                      <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '4px', fontSize: '9px' }} />
                      <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} fill="url(#colorBlue)" />
                      <defs>
                        <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-5"><TrendingUp className="w-8 h-8" /></div>
                  )}
                </ResponsiveContainer>
              </div>
           </section>

           <section className="col-span-3 card-premium p-[10px] bg-white/[0.015] flex flex-col min-h-0 border-white/[0.03]">
              <h2 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 shrink-0 flex items-center gap-3 px-[10px]">
                <PieIcon className="w-3 h-3 opacity-20 text-amber-500" /> Integrity
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} innerRadius="65%" outerRadius="90%" paddingAngle={3} dataKey="value" stroke="none">
                      {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.3} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </section>
        </div>

        {/* ROW 2: TEAM OPS */}
        <div className="grid grid-cols-12 gap-[10px] min-h-0">
           <section className="col-span-9 card-premium p-[10px] bg-white/[0.015] flex flex-col min-h-0 border-blue-500/5">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 shrink-0 flex items-center gap-3 px-[10px]">
                <Users className="w-3 h-3 text-emerald-500" /> Team Equilibrium
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data?.workload || []} margin={{ bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff20" fontSize={9} tickLine={false} axisLine={false} dy={10} />
                      <Bar dataKey="tasks" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={45} opacity={0.7} />
                   </BarChart>
                </ResponsiveContainer>
              </div>
           </section>

           <div className="col-span-3 card-premium p-[10px] bg-rose-500/[0.02] border-rose-500/10 flex flex-col justify-center">
              <div className="px-[10px]">
                 <div className="flex items-center gap-2 text-rose-500 mb-3 font-black uppercase text-[8px] tracking-[0.2em]">Risk Sentinel</div>
                 <p className="text-sm text-slate-200 font-bold leading-tight uppercase tracking-tight">Active anomalies detected.</p>
                 <div className="mt-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <button className="text-[8px] font-black uppercase text-rose-400/60 tracking-widest hover:text-rose-400 transition-colors">Start Audit Logic →</button>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
