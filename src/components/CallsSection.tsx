import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface CallEntry {
  number: string;
  type: number; // 1: Incoming, 2: Outgoing, 3: Missed
  date: number;
}

interface CallsSectionProps {
  logs: CallEntry[];
  onSelect: (phone: string) => void;
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const CallsSection: React.FC<CallsSectionProps> = ({
  logs,
  onSelect,
  isDarkMode,
  triggerHaptic,
}) => {
  const getCallIcon = (type: number) => {
    switch (type) {
      case 1: return <PhoneIncoming size={13} className="text-wa-green" />;
      case 2: return <PhoneOutgoing size={13} className="text-sky-550" />;
      case 3: return <PhoneMissed size={13} className="text-red-500" />;
      default: return <PhoneIncoming size={13} className="text-slate-500" />;
    }
  };

  const getCallTypeLabel = (type: number) => {
    switch (type) {
      case 1: return "Incoming";
      case 2: return "Outgoing";
      case 3: return "Missed";
      default: return "Unknown";
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xs text-slate-500">No recent call records</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className={cn(
        "px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
        isDarkMode ? "text-slate-500 bg-[#111b21]" : "text-slate-500 bg-slate-50/50"
      )}>
        <span>Recent Calls</span>
      </div>

      <div className="divide-y divide-transparent">
        <AnimatePresence mode="popLayout">
          {logs.map((log, idx) => (
            <motion.div
              key={log.date + idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, delay: idx * 0.02 }}
              className={cn(
                "flex items-center justify-between px-4 py-3 cursor-pointer border-b",
                isDarkMode 
                  ? "bg-transparent border-[#222e35] hover:bg-[#202c33] text-wa-text-primary-dark" 
                  : "bg-transparent border-[#e9edef] hover:bg-[#f0f2f5] text-wa-text-primary-light"
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Round avatar wrapper showing call icon */}
                <div className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  log.type === 3 
                    ? "bg-red-500/10 text-red-500" 
                    : isDarkMode ? "bg-slate-800 text-wa-green" : "bg-slate-100 text-wa-green-dark border border-slate-200"
                )}>
                  {getCallIcon(log.type)}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-bold truncate tracking-wide">+{log.number}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                    <span>{getCallTypeLabel(log.type)}</span>
                    <span>•</span>
                    <span className="font-mono">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('success');
                  onSelect(log.number);
                }}
                className={cn(
                  "p-2 rounded-lg border transition-all active:scale-95 flex items-center justify-center shrink-0 tap-highlight-none ml-2",
                  isDarkMode 
                    ? "bg-slate-900 border-[#222e35] hover:bg-slate-800 text-wa-green" 
                    : "bg-white border-slate-300 hover:bg-slate-50 text-wa-green-dark"
                )}
                title="Open Chat"
              >
                <MessageSquare size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
