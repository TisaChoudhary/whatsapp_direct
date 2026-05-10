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
      case 1: return <PhoneIncoming size={16} className="text-emerald-500" />;
      case 2: return <PhoneOutgoing size={16} className="text-blue-500" />;
      case 3: return <PhoneMissed size={16} className="text-red-500" />;
      default: return <PhoneIncoming size={16} className="text-slate-500" />;
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
      <div className="text-center py-12 space-y-3">
        <div className="w-12 h-12 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto text-slate-500">
          <PhoneIncoming size={20} />
        </div>
        <p className="text-xs text-slate-500">No recent calls found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <PhoneIncoming size={10} className="text-emerald-500" /> Recent Calls
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {logs.map((log, idx) => (
            <motion.div
              key={log.date + idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center justify-between p-4 rounded-3xl border group transition-all relative overflow-hidden",
                isDarkMode ? "bg-slate-900/40 border-slate-900/50 hover:border-emerald-500/30" : "bg-white border-slate-100 shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center",
                  log.type === 3 ? "bg-red-500/10" : "bg-emerald-500/10"
                )}>
                  {getCallIcon(log.type)}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">+{log.number}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {getCallTypeLabel(log.type)} • {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('success');
                  onSelect(log.number);
                }}
                className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all tap-highlight-none"
              >
                <MessageSquare size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
