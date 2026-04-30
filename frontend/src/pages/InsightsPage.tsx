import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts'
import { TrendingDown, Users, PieChart as PieIcon, Loader2, AlertCircle } from 'lucide-react'
import { getProjectAnalyticsApi } from '@/api/projects'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

export default function InsightsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['project-analytics', projectId],
    queryFn: () => getProjectAnalyticsApi(projectId!).then(res => res.data),
    enabled: !!projectId
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p className="text-lg font-medium">Cargando métricas del proyecto...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 p-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Error al cargar datos</h2>
        <p>No pudimos obtener las analíticas. Verifica tu conexión o intenta más tarde.</p>
      </div>
    )
  }

  const priorityData = Object.entries(data.priorities).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Project Insights</h1>
        <p className="text-slate-400">Analíticas detalladas y rendimiento del equipo para {data.sprint_name || 'el proyecto'}.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Burndown Chart */}
        <section className="bg-[#1a2235] rounded-xl border border-[#2a3655] p-6 shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingDown className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Sprint Burndown</h2>
              <p className="text-xs text-slate-500">Puntos restantes vs. Ideal</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {data.burndown.length > 0 ? (
                <AreaChart data={data.burndown}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3655" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #2a3655', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Real" />
                  <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={2} name="Ideal" />
                </AreaChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 italic">
                  No hay un sprint activo con tareas estimadas.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Priority Distribution */}
        <section className="bg-[#1a2235] rounded-xl border border-[#2a3655] p-6 shadow-xl group">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <PieIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Distribución de Prioridades</h2>
              <p className="text-xs text-slate-500">Balance del backlog por criticidad</p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {priorityData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #2a3655', borderRadius: '8px' }}
                  />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 italic">
                  No hay tareas registradas en este proyecto.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Team Workload */}
        <section className="bg-[#1a2235] rounded-xl border border-[#2a3655] p-6 shadow-xl lg:col-span-2 group">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Carga de Trabajo del Equipo</h2>
              <p className="text-xs text-slate-500">Número de tareas asignadas por miembro</p>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {data.workload.length > 0 ? (
                <BarChart data={data.workload}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3655" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1a2235', border: '1px solid #2a3655', borderRadius: '8px' }}
                  />
                  <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Tareas" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 italic">
                  No hay miembros con tareas asignadas.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  )
}
