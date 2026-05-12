import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import { useForesight } from '../../hooks/useForesight';

interface RiskBadgeProps {
  showLabel?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ showLabel = true, className = "" }) => {
  const { data, getRiskColor } = useForesight();

  if (!data || data.risk_level === 'none') {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/5 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        {showLabel && <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Optimum</span>}
      </div>
    );
  }

  const iconMap = {
    low: <ShieldCheck className="w-3.5 h-3.5" style={{ color: getRiskColor() }} />,
    medium: <ShieldAlert className="w-3.5 h-3.5" style={{ color: getRiskColor() }} />,
    high: <ShieldAlert className="w-3.5 h-3.5" style={{ color: getRiskColor() }} />,
    critical: <ShieldOff className="w-3.5 h-3.5" style={{ color: getRiskColor() }} />,
    none: <ShieldCheck className="w-3.5 h-3.5" />
  };

  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${className}`}
      style={{ 
        borderColor: `${getRiskColor()}40`, 
        backgroundColor: `${getRiskColor()}10` 
      }}
    >
      {iconMap[data.risk_level]}
      {showLabel && (
        <span 
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: getRiskColor() }}
        >
          Risk: {data.risk_level}
        </span>
      )}
    </div>
  );
};
