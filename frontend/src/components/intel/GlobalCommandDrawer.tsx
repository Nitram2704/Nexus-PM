import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Terminal, ShieldAlert } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import NexusChat from '@/components/ai/NexusChat';
import ActionConfirmationHub from './ActionConfirmationHub';

const GlobalCommandDrawer: React.FC = () => {
  const { isIntelligenceOpen, toggleIntelligence, currentProjectId } = useUIStore();
  const { pendingActionsCount } = useChatStore();

  // Close with Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleIntelligence(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [toggleIntelligence]);

  return (
    <AnimatePresence>
      {isIntelligenceOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleIntelligence(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[400px] bg-[#050505] border-l border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden"
          >
            {/* HUD SCANLINE EFFECT */}
            <div className="absolute inset-0 pointer-events-none opacity-5 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />

            {/* Header */}
            <div className="p-5 border-b border-cyan-500/20 bg-cyan-500/5 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white tracking-[0.2em]">NEXUS_COMMAND_HUB</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-600 mt-1 uppercase tracking-widest">
                  STATUS: OPS_ACTIVE // ID: {currentProjectId?.slice(0, 8) || 'GLOBAL'}
                </span>
              </div>
              <button 
                onClick={() => toggleIntelligence(false)}
                className="p-1.5 hover:bg-white/5 text-cyan-500 transition-colors border border-transparent hover:border-cyan-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tactical Feed Selection */}
            <div className="flex bg-black/40 border-b border-cyan-500/10">
                <button className="flex-1 py-3 text-[10px] font-mono font-bold text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/10 flex items-center justify-center gap-2">
                    <Terminal className="w-3 h-3" /> COMM_FEED
                </button>
                <button className="flex-1 py-3 text-[10px] font-mono font-bold text-gray-500 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> 
                    ACTIONS {pendingActionsCount > 0 && <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[8px] rounded-sm">{pendingActionsCount}</span>}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                
                {/* Pending Actions Section */}
                {pendingActionsCount > 0 && currentProjectId && (
                  <div className="mb-4">
                    <ActionConfirmationHub projectId={currentProjectId!} />
                  </div>
                )}

                {/* Global Chat Component */}
                <div className="h-full flex flex-col">
                  <NexusChat />
                </div>
              </div>
            </div>

            {/* Footer / Connection Status */}
            <div className="p-3 bg-black/60 border-t border-cyan-500/10 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">Secure_Connection</span>
                </div>
                <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-500" />
                    <span className="text-[8px] font-mono text-cyan-500 uppercase">A.I. Core v2.1</span>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalCommandDrawer;
