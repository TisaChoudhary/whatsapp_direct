import React, { useState, useRef } from 'react';
import { Type, Paperclip, X, FileText, Video, Mic, Trash2, Check, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATES } from '../constants';
import { cn } from '../lib/utils';

interface MessageInputProps {
  message: string;
  setMessage: (val: string) => void;
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
  attachment: File | null;
  attachmentType: 'image' | 'video' | 'document' | 'audio' | null;
  attachmentPreview: string | null;
  onFileChange: (file: File | null) => void;
  onClearAttachment: () => void;
  isRecording: boolean;
  recordingDuration: number;
  onStartRecording: () => void;
  onStopRecording: (save: boolean) => void;
}

const AudioPreviewPlayer: React.FC<{ src: string }> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} className="hidden" />
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 active:scale-95 transition-all"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs font-bold truncate">Voice Note Recording</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Click to play preview</p>
      </div>
    </div>
  );
};

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
  isRecording,
  recordingDuration,
  onStartRecording,
  onStopRecording,
}) => {
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Type size={10} className="text-emerald-500" /> Message
        </label>
        <span className="text-[10px] text-slate-600 font-mono">{message.length}/500</span>
      </div>

      <AnimatePresence mode="wait">
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
              {attachmentType === 'audio' && attachmentPreview && (
                <AudioPreviewPlayer src={attachmentPreview} />
              )}

              {/* File Info for Non-Audio Attachments */}
              {attachmentType !== 'audio' && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate tracking-tight text-left">
                    {attachment.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono text-left">
                    {(attachment.size / (1024 * 1024)).toFixed(2)} MB • {attachmentType?.toUpperCase()}
                  </p>
                </div>
              )}
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

      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isRecording ? "" : "Hello! Let's chat..."}
          rows={3}
          maxLength={500}
          disabled={isRecording}
          className={cn(
            "w-full p-4 rounded-2xl border focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none font-medium",
            isDarkMode ? "bg-slate-900/80 border-slate-800 placeholder:text-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900",
            isRecording && "opacity-20 cursor-not-allowed"
          )}
        />

        {/* Recording Overlay Dashboard */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "absolute inset-0 rounded-2xl flex items-center justify-between px-6 border backdrop-blur-md",
                isDarkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500">Recording Audio</p>
                  <p className="text-[10px] text-slate-500 font-medium">Slide/Click control to finish</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-bold font-mono text-emerald-500 tracking-tight">
                  {formatDuration(recordingDuration)}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { triggerHaptic('medium'); onStopRecording(false); }}
                    title="Discard Recording"
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('success'); onStopRecording(true); }}
                    title="Save Voice Note"
                    className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors active:scale-95"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Templates & Actions Trigger Row */}
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
              e.target.value = '';
            }}
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            className="hidden"
          />
        </label>

        {/* Voice Note Button */}
        <button
          onClick={() => { triggerHaptic('medium'); onStartRecording(); }}
          disabled={isRecording}
          title="Record Voice Note"
          className={cn(
            "p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center tap-highlight-none shrink-0",
            isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200",
            isRecording && "opacity-30 cursor-not-allowed"
          )}
        >
          <Mic size={14} />
        </button>
        
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
