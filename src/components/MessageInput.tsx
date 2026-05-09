import React from 'react';
import { Type } from 'lucide-react';
import { TEMPLATES } from '../constants';
import { cn } from '../lib/utils';

interface MessageInputProps {
  message: string;
  setMessage: (val: string) => void;
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  isDarkMode,
  triggerHaptic,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Type size={10} className="text-emerald-500" /> Message
        </label>
        <span className="text-[10px] text-slate-600 font-mono">{message.length}/500</span>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Hello! Let's chat..."
        rows={3}
        maxLength={500}
        className={cn(
          "w-full p-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none font-medium",
          isDarkMode ? "bg-slate-900/80 border-slate-800 placeholder:text-slate-700" : "bg-white border-slate-200"
        )}
      />
      
      {/* Templates */}
      <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar -mx-1 px-1">
        {TEMPLATES.map((t) => (
          <button
            key={t}
            onClick={() => {
              triggerHaptic('light');
              setMessage(t);
            }}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all active:scale-95",
              isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-emerald-400" : "bg-slate-100 border-slate-200 text-slate-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};
