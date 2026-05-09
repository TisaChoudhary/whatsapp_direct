import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecentContact } from '../types';
import { cn } from '../lib/utils';

interface HistorySectionProps {
  recent: RecentContact[];
  onSelect: (phone: string) => void;
  onDelete: (phone: string) => void;
  onClearAll: () => void;
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  recent,
  onSelect,
  onDelete,
  onClearAll,
  isDarkMode,
  triggerHaptic,
}) => {
  if (recent.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 px-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <History size={10} className="text-emerald-500" /> Recent Activity
        </span>
        <button 
          onClick={() => {
            triggerHaptic('medium');
            onClearAll();
          }}
          className="text-[10px] font-bold text-slate-600 hover:text-red-400 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {recent.map((contact, idx) => (
            <motion.div 
              key={contact.phone}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center justify-between p-4 rounded-3xl border group transition-all relative overflow-hidden",
                isDarkMode ? "bg-slate-900/40 border-slate-900/50 hover:border-emerald-500/30" : "bg-white border-slate-100 shadow-sm"
              )}
            >
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  onSelect(contact.phone);
                }}
                className="flex items-center gap-4 flex-1 text-left tap-highlight-none"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                  {contact.phone.slice(-2)}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">+{contact.phone}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(contact.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </button>
              <button 
                onClick={() => {
                  triggerHaptic('medium');
                  onDelete(contact.phone);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all tap-highlight-none"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
