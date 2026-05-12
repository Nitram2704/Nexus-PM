import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { Loader2, TrendingUp, AlertCircle, ShieldAlert } from 'lucide-react'
import apiClient from '@/lib/apiClient'

interface VelocityData {
  name: string
  planned: number
  completed: number
}

export function VelocityReport({ projectId }: { projectId: string }) {
  const [data, setData] = useState<VelocityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnauthorized, setIsUnauthorized] = useState(false)

  useEffect(() => {
    fetchVelocity()
  }, [projectId])

  const fetchVelocity = async () => {
    setLoading(true)
    setError(null)
    setIsUnauthorized(false)
    try {
      const response = await apiClient.get(`/projects/${projectId}/velocity/`)
      setData(response.data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsUnauthorized(true)
      } else {
        setError('No se pudo cargar el reporte de velocidad.')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-[#1a2235]/50 rounded-xl border border-[#2a3655]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (isUnauthorized) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-rose-500/5 rounded-xl border border-rose-500/20 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Acceso Restringido</h3>
        <p className="text-slate-400 max-w-xs mx-auto">
          Solo los Administradores y Propietarios pueden ver los reportes de rendimiento del equipo.
        </p>
      </div>
    )
  }

  if (error || data.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-[#1a2235]/50 rounded-xl border border-[#2a3655] p-8 text-center">
        <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-slate-400">{error || 'No hay suficientes datos de sprints para mostrar la velocidad.'}</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1a2235] border border-[#2a3655] rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Velocidad del Equipo
          </h3>
          <p className="text-sm text-slate-400">Comparativa de Story Points por Sprint</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-slate-600" />
            <span className="text-xs text-slate-300">Planificados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-xs text-slate-300">Completados</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3655" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Bar 
              dataKey="planned" 
              name="Planificados" 
              fill="#475569" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
            />
            <Bar 
              dataKey="completed" 
              name="Completados" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
