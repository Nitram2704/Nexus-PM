import { useState, useEffect } from 'react'
import { Loader2, Sparkles, Copy, Check, ShieldAlert, FileText } from 'lucide-react'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

export function SprintAISummary({ sprintId }: { sprintId: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchSummary = async () => {
    setLoading(true)
    setIsUnauthorized(false)
    try {
      const response = await apiClient.get(`/sprints/${sprintId}/summary/`)
      setSummary(response.data.summary)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        setIsUnauthorized(true)
      } else {
        toast.error('No se pudo generar el resumen con IA.')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [sprintId])

  const handleCopy = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    setCopied(true)
    toast.success('Resumen copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-[#1a2235]/50 rounded-xl border border-[#2a3655] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-slate-300 font-medium animate-pulse">Nexus AI está analizando el sprint...</p>
      </div>
    )
  }

  if (isUnauthorized) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-rose-500/5 rounded-xl border border-rose-500/20 p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Acceso Restringido</h3>
        <p className="text-slate-400">Solo Administradores pueden generar resúmenes ejecutivos.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1a2235] border border-[#2a3655] rounded-xl overflow-hidden shadow-xl flex flex-col h-[500px]">
      <header className="px-6 py-4 border-bottom border-[#2a3655] bg-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold text-white">Resumen Ejecutivo Nexus AI</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2a3655] hover:bg-[#3b4b75] text-white text-xs font-semibold rounded-md transition-all"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button 
            onClick={fetchSummary}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-all"
          >
            Regenerar
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-indigo max-w-none prose-sm scrollbar-thin">
        {summary ? (
          <ReactMarkdown>{summary}</ReactMarkdown>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>No se pudo generar el resumen.</p>
          </div>
        )}
      </div>
    </div>
  )
}
