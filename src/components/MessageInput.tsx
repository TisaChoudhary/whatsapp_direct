import React from 'react';
import { Type, Paperclip, X, FileText, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATES } from '../constants';
import { cn } from '../lib/utils';

interface MessageInputProps {
  message: string;
  setMessage: (val: string) => void;
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
  attachment: File | null;
  attachmentType: 'image' | 'video' | 'document' | null;
  attachmentPreview: string | null;
  onFileChange: (file: File | null) => void;
  onClearAttachment: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  isDarkMode,
  triggerHaptic,
  attachment,
  attachmentType,
  attachmentPreview,
  onFileChange,
  onClearAttachment,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Type size={10} className="text-emerald-500" /> Message
        </label>
        <span className="text-[10px] text-slate-600 font-mono">{message.length}/500</span>
      </div>

      <AnimatePresence>
        {/* Attachment Preview Card */}
        {attachment && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className={cn(
              "p-3 rounded-2xl border flex items-center justify-between gap-3 relative overflow-hidden mb-2",
              isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Visual Thumbnail / Icon */}
              {attachmentType === 'image' && attachmentPreview && (
                <img 
                  src={attachmentPreview} 
                  alt="Upload Preview" 
                  className="w-12 h-12 object-cover rounded-xl border border-white/10 shrink-0"
                />
              )}
              {attachmentType === 'video' && (
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Video size={20} />
                </div>
              )}
              {attachmentType === 'document' && (
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <FileText size={20} />
                </div>
              )}

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate tracking-tight text-left">
                  {attachment.name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono text-left">
                  {(attachment.size / (1024 * 1024)).toFixed(2)} MB • {attachmentType?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Delete Button */}
            <button 
              onClick={() => {
                triggerHaptic('medium');
                onClearAttachment();
              }}
              className="p-1.5 rounded-full hover:bg-slate-800/20 text-slate-500 hover:text-red-400 transition-colors shrink-0 tap-highlight-none"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
      
      {/* Templates & File Upload Trigger Row */}
      <div className="flex gap-2 items-center">
        {/* Attachment Button */}
        <label className={cn(
          "cursor-pointer p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center tap-highlight-none shrink-0",
          isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
        )}>
          <Paperclip size={14} />
          <input 
            type="file" 
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onFileChange(file);
              e.target.value = ''; // Reset input to trigger onChange for same file again
            }}
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
          />
        </label>
        
        {/* Templates */}
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar flex-1 -mr-1 pr-1">
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
    </div>
  );
};
