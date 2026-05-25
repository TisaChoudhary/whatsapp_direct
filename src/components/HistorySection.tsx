import React from 'react';
import { Trash2 } from 'lucide-react';
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
  if (recent.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xs text-slate-500">No recent chat history</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col"
    >
      <div className={cn(
        "flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
        isDarkMode ? "text-slate-500 bg-[#111b21]" : "text-slate-500 bg-slate-50/50"
      )}>
        <span>Recent Chats</span>
        <button 
          onClick={() => {
            triggerHaptic('medium');
            onClearAll();
          }}
          className="hover:text-red-400 transition-colors cursor-pointer"
        >
          Clear History
        </button>
      </div>
      
      <div className="divide-y divide-transparent">
        <AnimatePresence mode="popLayout">
          {recent.map((contact) => (
            <motion.div 
              key={contact.phone}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "flex items-center justify-between px-4 py-3 group transition-all relative cursor-pointer border-b",
                isDarkMode 
                  ? "bg-transparent border-[#222e35] hover:bg-[#202c33] text-wa-text-primary-dark" 
                  : "bg-transparent border-[#e9edef] hover:bg-[#f0f2f5] text-wa-text-primary-light"
              )}
            >
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  onSelect(contact.phone);
                }}
                className="flex items-center gap-3.5 flex-1 text-left tap-highlight-none min-w-0"
              >
                {/* Rounded avatar placeholder */}
                <div className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm",
                  isDarkMode ? "bg-slate-800 text-wa-green" : "bg-slate-100 text-wa-green-dark border border-slate-200"
                )}>
                  {contact.phone.slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold truncate tracking-wide">+{contact.phone}</p>
                    <span className="text-[9px] text-slate-500 shrink-0 font-medium">
                      {new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                    Click to open chat thread
                  </p>
                </div>
              </button>
              <button 
                onClick={() => {
                  triggerHaptic('medium');
                  onDelete(contact.phone);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all tap-highlight-none ml-2 shrink-0"
                title="Delete from list"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
