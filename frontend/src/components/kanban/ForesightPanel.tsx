import React from 'react';
import { useForesight } from '../../hooks/useForesight';
import { Brain, AlertCircle, TrendingDown, Users } from 'lucide-react';

export const ForesightPanel: React.FC = () => {
  const { data, isLoading, error, getRiskColor } = useForesight();

  if (isLoading) {
    return (
      <div className="animate-pulse mb-4 p-4 border border-white/5 bg-white/5">
        <div className="h-4 w-32 bg-white/10 mb-4" />
        <div className="h-20 w-full bg-white/10" />
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div 
      className="mb-4 border p-4" 
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/80">Nexus Foresight</h3>
        </div>
        <div 
          className="px-2 py-0.5 border text-[9px] font-mono uppercase"
          style={{ borderColor: `${getRiskColor()}40`, color: getRiskColor() }}
        >
          {data.risk_level} Risk
        </div>
      </div>

      <div className="space-y-4">
        <div 
          className="flex gap-3 padding-3 border-l-2"
          style={{ 
            backgroundColor: 'rgba(34, 211, 238, 0.03)',
            borderColor: 'rgba(34, 211, 238, 0.2)',
            padding: '12px'
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400/60 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed text-white/70 italic">
            "{data.ai_recommendation}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div 
            className="p-3 border"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderColor: 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3 h-3 text-cyan-400/40" />
              <span className="text-[9px] uppercase tracking-wider text-white/40">Burndown Delay</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-sm font-mono text-white/90">
                {Math.max(0, Math.round(data.indicators.time_elapsed_pct - data.indicators.work_completed_pct))}%
              </span>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden mb-1.5">
                <div 
                  className="h-full bg-cyan-500/50" 
                  style={{ width: `${Math.min(100, Math.max(0, data.indicators.time_elapsed_pct - data.indicators.work_completed_pct))}%` }} 
                />
              </div>
            </div>
          </div>

          <div 
            className="p-3 border"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderColor: 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3 h-3 text-cyan-400/40" />
              <span className="text-[9px] uppercase tracking-wider text-white/40">Resource Load</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-white/90">
                {data.indicators.overloaded_members.length > 0 ? 'Critical' : 'Balanced'}
              </span>
              {data.indicators.overloaded_members.length > 0 && (
                <div className="flex -space-x-1">
                  {data.indicators.overloaded_members.map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-red-500/50 bg-red-500/10 flex items-center justify-center text-[8px] text-red-400">
                      !
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
