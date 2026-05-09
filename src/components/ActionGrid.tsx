import React from 'react';
import { Send, QrCode, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ActionGridProps {
  onAction: (type: 'message' | 'qr') => void;
  onShare: () => void;
  isDarkMode: boolean;
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  onAction,
  onShare,
  isDarkMode,
}) => {
  return (
    <div className="grid grid-cols-6 gap-2 pt-2">
      <button
        onClick={() => onAction('message')}
        className="col-span-4 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 tap-highlight-none"
      >
        <Send size={18} /> Send Message
      </button>
      <button
        onClick={() => onAction('qr')}
        title="Generate QR Code"
        className={cn(
          "h-14 rounded-2xl border transition-all active:scale-90 flex items-center justify-center tap-highlight-none",
          isDarkMode ? "border-slate-800 bg-slate-900/80 hover:bg-slate-800" : "border-slate-200 hover:bg-white/50"
        )}
      >
        <QrCode size={20} className="text-emerald-500" />
      </button>
      <button
        onClick={onShare}
        title="Share Link"
        className={cn(
          "h-14 rounded-2xl border transition-all active:scale-90 flex items-center justify-center tap-highlight-none",
          isDarkMode ? "border-slate-800 bg-slate-900/80 hover:bg-slate-800" : "border-slate-200 hover:bg-white/50"
        )}
      >
        <Share2 size={20} className="text-blue-400" />
      </button>
    </div>
  );
};
