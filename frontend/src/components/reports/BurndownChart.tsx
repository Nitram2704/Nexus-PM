import { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { Loader2, TrendingDown, AlertCircle, ShieldAlert } from 'lucide-react'
import apiClient from '@/lib/apiClient'

interface BurndownData {
  day: string
  actual: number
  ideal: number
}

export function BurndownChart({ sprintId }: { sprintId: string }) {
  const [data, setData] = useState<BurndownData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnauthorized, setIsUnauthorized] = useState(false)

  const fetchBurndown = async () => {
    setLoading(true)
    setError(null)
    setIsUnauthorized(false)
    try {
      const response = await apiClient.get(`/sprints/${sprintId}/burndown/`)
      setData(response.data)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        setIsUnauthorized(true)
      } else {
        setError('No se pudo cargar el gráfico de Burndown.')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBurndown()
  }, [sprintId])

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-[#1a2235]/50 rounded-xl border border-[#2a3655]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (isUnauthorized) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-rose-500/5 rounded-xl border border-rose-500/20 p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Acceso Restringido</h3>
        <p className="text-slate-400">Solo Administradores pueden ver este reporte.</p>
      </div>
    )
  }

  if (error || data.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-[#1a2235]/50 rounded-xl border border-[#2a3655] p-8 text-center">
        <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-slate-400">{error || 'No hay datos suficientes para el burndown.'}</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1a2235] border border-[#2a3655] rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-indigo-400" />
            Burndown del Sprint
          </h3>
          <p className="text-sm text-slate-400">Puntos restantes vs. Progreso ideal</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-slate-500 border-t border-dashed border-slate-400" />
            <span className="text-xs text-slate-300">Ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-xs text-slate-300">Actual</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3655" vertical={false} />
            <XAxis 
              dataKey="day" 
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
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="ideal" 
              stroke="#64748b" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              dot={false}
              name="Ideal"
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Actual"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
