import React, { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, Cpu, Layers } from 'lucide-react';
import api from '@/lib/apiClient';

interface ProposedAction {
  id: string;
  action_type: string;
  params: any;
  status: string;
  created_at: string;
}

interface ActionConfirmationHubProps {
  projectId: string;
  onActionExecuted?: () => void;
}

const ActionConfirmationHub: React.FC<ActionConfirmationHubProps> = ({ projectId, onActionExecuted }) => {
  const [actions, setActions] = useState<ProposedAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
    try {
      const res = await api.get(`/intelligence/projects/${projectId}/actions/`);
      setActions(res.data);
    } catch (err) {
      console.error("Error fetching proposed actions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
    const interval = setInterval(fetchActions, 10000);
    return () => clearInterval(interval);
  }, [projectId]);

  const handleDecision = async (actionId: string, approve: boolean) => {
    try {
      await api.post(`/intelligence/projects/${projectId}/actions/${actionId}/`, { approve });
      setActions(prev => prev.filter(a => a.id !== actionId));
      if (approve && onActionExecuted) onActionExecuted();
    } catch (err) {
      console.error("Error handling action decision:", err);
    }
  };

  if (actions.length === 0 && !loading) return null;

  return (
    <div className="nexus-card bg-black/40 border border-cyan-900/30 overflow-hidden">
      <div className="p-3 bg-cyan-900/10 border-b border-cyan-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-cyan-400">PENDING_AI_AUTHORIZATION</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-600">QUEUE_SIZE: {actions.length}</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {actions.map(action => (
          <div key={action.id} className="p-4 border-b border-cyan-900/20 last:border-0 hover:bg-cyan-900/5 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-cyan-500/10 border border-cyan-500/30">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {action.action_type.replace('_', ' ')}
                  </span>
                </div>
                
                {action.action_type === 'CREATE_TASK' && (
                  <div className="space-y-1 mt-2">
                    <div className="text-[11px] text-cyan-400 font-mono">TASK_TITLE: {action.params.title}</div>
                    <p className="text-[10px] text-gray-500 font-mono line-clamp-2">
                      {action.params.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleDecision(action.id, true)}
                  className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all title='AUTHORIZE'"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDecision(action.id, false)}
                  className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all title='ABORT'"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {loading && actions.length === 0 && (
        <div className="p-8 flex flex-col items-center justify-center opacity-30">
          <Layers className="w-8 h-8 text-cyan-500 animate-spin-slow mb-2" />
          <span className="text-[10px] font-mono text-cyan-400">SYNCING_QUEUE...</span>
        </div>
      )}
    </div>
  );
};

export default ActionConfirmationHub;
