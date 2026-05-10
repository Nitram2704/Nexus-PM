import React, { useState } from 'react';
import { ShieldAlert, Zap, Users, Calendar, BarChart3, RefreshCcw } from 'lucide-react';

interface SimulationResult {
  risk_level: string;
  risk_index: number;
  ai_analysis: string;
  indicators: {
    time_elapsed_pct: number;
    work_completed_pct: number;
    sim_total_points: number;
    original_risk_index: number;
  }
}

interface SimulationControlsProps {
  onSimulate: (params: { capacity: number; scope: number; deadline_shift: number }) => Promise<SimulationResult>;
}

export function SimulationControls({ onSimulate }: SimulationControlsProps) {
  const [params, setParams] = useState({ capacity: 1.0, scope: 1.0, deadline_shift: 0 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const data = await onSimulate(params);
      setResult(data);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-rose-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-emerald-500';
    }
  };

  return (
    <div className="bg-black/40 border border-white/10 p-6 space-y-8 h-full overflow-y-auto">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xs font-bold tracking-[0.2em] text-white">PRE_CRIME // SIMULATOR</h2>
      </div>

      <div className="space-y-6">
        {/* Capacity Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase font-medium tracking-wider">
            <span className="flex items-center gap-2 text-white/50"><Users className="w-3 h-3" /> Capacidad de Equipo</span>
            <span className="text-cyan-400 font-mono">{(params.capacity * 100).toFixed(0)}%</span>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1" 
            value={params.capacity} 
            onChange={(e) => setParams({...params, capacity: parseFloat(e.target.value)})}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Scope Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase font-medium tracking-wider">
            <span className="flex items-center gap-2 text-white/50"><BarChart3 className="w-3 h-3" /> Alcance (Scope)</span>
            <span className="text-cyan-400 font-mono">{(params.scope * 100).toFixed(0)}%</span>
          </div>
          <input 
            type="range" min="0.5" max="2.5" step="0.1" 
            value={params.scope} 
            onChange={(e) => setParams({...params, scope: parseFloat(e.target.value)})}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Deadline Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase font-medium tracking-wider">
            <span className="flex items-center gap-2 text-white/50"><Calendar className="w-3 h-3" /> Desvío Deadline (Días)</span>
            <span className="text-cyan-400 font-mono">{params.deadline_shift > 0 ? `+${params.deadline_shift}` : params.deadline_shift} d</span>
          </div>
          <input 
            type="range" min="-7" max="14" step="1" 
            value={params.deadline_shift} 
            onChange={(e) => setParams({...params, deadline_shift: parseInt(e.target.value)})}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      <button 
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-4 border border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10 text-cyan-400 text-[10px] font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
        EJECUTAR_ANALISIS_ORACULO
      </button>

      {result && (
        <div className="pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Riesgo Proyectado</span>
              <span className={`text-lg font-mono font-bold ${getRiskColor(result.risk_level)}`}>
                {result.risk_level.toUpperCase()}
              </span>
            </div>
            
            <div className="bg-white/5 border-l-2 border-cyan-400 p-4">
              <p className="text-[11px] text-cyan-100 font-mono leading-relaxed italic">
                "{result.ai_analysis}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 border border-white/5">
                <span className="block text-[8px] text-white/30 uppercase mb-1">Impacto Desviación</span>
                <span className="text-xs font-mono text-white">{(result.risk_index - result.indicators.original_risk_index).toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5">
                <span className="block text-[8px] text-white/30 uppercase mb-1">Carga Sim.</span>
                <span className="text-xs font-mono text-white">{result.indicators.sim_total_points.toFixed(0)} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
