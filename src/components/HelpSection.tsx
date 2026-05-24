import React from 'react';
import { BookOpen, FileText, Video, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface HelpSectionProps {
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  isDarkMode,
  triggerHaptic,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 px-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <BookOpen size={10} className="text-emerald-500" /> Help & Resources
        </span>
      </div>

      {/* Promo Banner Image */}
      <div className="relative group overflow-hidden rounded-[2rem] border border-white/5 shadow-lg">
        <img 
          src="/images/directchat_promo.png" 
          alt="DirectChat Promo" 
          className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
          <p className="text-xs font-bold text-white tracking-tight">DirectChat Pro Features Enabled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* User Guide Document Link */}
        <a 
          href="/documents/user_guide.txt" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => triggerHaptic('light')}
          className={cn(
            "flex items-center justify-between p-4 rounded-3xl border transition-all hover:scale-[1.01] active:scale-95",
            isDarkMode 
              ? "bg-slate-900/40 border-slate-900/50 hover:border-emerald-500/30 text-slate-200" 
              : "bg-white border-slate-100 shadow-sm text-slate-800"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">User Guide & Docs</p>
              <p className="text-[10px] text-slate-500 font-medium">Read instructions & tips</p>
            </div>
          </div>
          <ExternalLink size={14} className="text-slate-500" />
        </a>

        {/* Video Tutorial Player */}
        <div 
          className={cn(
            "p-4 rounded-3xl border space-y-3",
            isDarkMode ? "bg-slate-900/40 border-slate-900/50" : "bg-white border-slate-100 shadow-sm"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Video size={18} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Video Walkthrough</p>
              <p className="text-[10px] text-slate-500 font-medium">Learn how to sync & scan QR</p>
            </div>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800/40 bg-slate-950">
            <video 
              controls 
              className="w-full h-full object-cover"
              poster="/images/directchat_promo.png"
            >
              <source 
                src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
