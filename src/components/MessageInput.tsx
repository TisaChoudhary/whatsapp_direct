import React, { useState, useRef } from 'react';
import { Paperclip, Image, FileText, Mic, Send, Trash2, Check, X, Play, Pause } from 'lucide-react';
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
  recordingVolume?: number;
  audioDuration?: number;
  onSend?: () => void;
}

const AudioPreviewPlayer: React.FC<{ src: string; initialDuration?: number }> = ({ src, initialDuration }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.warn(e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const value = parseFloat(e.target.value);
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => setIsPlaying(false)} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden" 
      />
      <button 
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-wa-green hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-sm"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5 text-left">
        <div className="flex justify-between items-center gap-2">
          <p className="text-[11px] font-bold truncate">Voice Note Preview</p>
          <span className="text-[9px] font-mono text-slate-500">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <input 
          type="range" 
          min="0"
          max={duration || 100} 
          step="0.05"
          value={currentTime}
          onChange={handleScrub}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-wa-green outline-none"
        />
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
  recordingVolume = 0,
  audioDuration = 0,
  onSend,
}) => {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDocExtensionInfo = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return { label: 'PDF', bg: 'bg-red-500/10 border-red-500/20 text-red-400' };
      case 'doc':
      case 'docx':
        return { label: 'DOC', bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' };
      case 'xls':
      case 'xlsx':
        return { label: 'XLS', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
      case 'ppt':
      case 'pptx':
        return { label: 'PPT', bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400' };
      case 'txt':
        return { label: 'TXT', bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400' };
      default:
        return { label: ext.toUpperCase().slice(0, 4) || 'DOC', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
    }
  };

  const hasContent = message.trim().length > 0 || attachment !== null;

  const handleRightButtonClick = () => {
    if (isRecording) {
      triggerHaptic('success');
      onStopRecording(true);
    } else if (hasContent) {
      if (onSend) onSend();
    } else {
      triggerHaptic('medium');
      onStartRecording();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 relative">
      
      {/* Templates horizontal bar (floating above input bar) */}
      {!isRecording && (
        <div className="flex gap-1.5 overflow-x-auto py-1 px-4 no-scrollbar -mx-4">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => {
                triggerHaptic('light');
                setMessage(t);
              }}
              className={cn(
                "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all active:scale-95 shrink-0 shadow-sm",
                isDarkMode 
                  ? "bg-wa-header-dark border-slate-800 text-slate-300 hover:text-wa-green hover:border-wa-green/30" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Attachment & Voice note status popup block */}
      <AnimatePresence>
        {attachment && !isRecording && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={cn(
              "p-3 rounded-xl border flex items-center justify-between gap-3 relative shadow-md mx-2",
              isDarkMode ? "bg-wa-header-dark border-slate-800" : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {attachmentType === 'image' && attachmentPreview && (
                <img 
                  src={attachmentPreview} 
                  alt="Upload Preview" 
                  onClick={() => setShowFullscreen(true)}
                  className="w-11 h-11 object-cover rounded-lg border border-slate-700/30 shrink-0 cursor-zoom-in hover:scale-105 transition-transform duration-200"
                />
              )}
              {attachmentType === 'video' && attachmentPreview && (
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-700/30 shrink-0 relative bg-black">
                  <video 
                    src={attachmentPreview} 
                    className="w-full h-full object-cover" 
                    muted 
                    playsInline
                  />
                </div>
              )}
              {attachmentType === 'document' && (
                <div className={cn(
                  "w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 border text-[8px] font-bold tracking-wider",
                  getDocExtensionInfo(attachment.name).bg
                )}>
                  <FileText size={14} className="mb-0.5" />
                  <span>{getDocExtensionInfo(attachment.name).label}</span>
                </div>
              )}
              {attachmentType === 'audio' && attachmentPreview && (
                <AudioPreviewPlayer src={attachmentPreview} initialDuration={audioDuration} />
              )}

              {attachmentType !== 'audio' && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-left">
                    {attachment.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono text-left">
                    {(attachment.size / (1024 * 1024)).toFixed(2)} MB • {attachmentType?.toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                triggerHaptic('medium');
                onClearAttachment();
              }}
              className={cn(
                "p-1.5 rounded-full transition-colors shrink-0 tap-highlight-none",
                isDarkMode ? "hover:bg-slate-800 text-slate-400 hover:text-red-400" : "hover:bg-slate-100 text-slate-500 hover:text-red-500"
              )}
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WhatsApp-style Footer Row */}
      <div className={cn(
        "rounded-2xl p-2 flex items-end gap-2.5 shadow-md relative",
        isDarkMode ? "bg-wa-header-dark" : "bg-wa-header-light"
      )}>
        
        {/* Attachment menu trigger */}
        {!isRecording && (
          <div className="relative shrink-0 mb-0.5">
            <button 
              onClick={() => { triggerHaptic('light'); setShowAttachMenu(!showAttachMenu); }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all tap-highlight-none",
                showAttachMenu 
                  ? "bg-slate-800 text-wa-green" 
                  : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              )}
            >
              <Paperclip size={18} className={cn("transition-transform duration-200", showAttachMenu && "rotate-45")} />
            </button>

            {/* Slide up Attachment Dropdown */}
            <AnimatePresence>
              {showAttachMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className={cn(
                      "absolute bottom-12 left-0 z-50 p-2 rounded-xl shadow-xl border flex flex-col gap-1.5 min-w-[150px] origin-bottom-left",
                      isDarkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"
                    )}
                  >
                    <label className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs font-semibold transition-colors",
                      isDarkMode ? "hover:bg-slate-800 text-slate-350" : "hover:bg-slate-100 text-slate-700"
                    )}>
                      <Image size={15} className="text-blue-400" />
                      <span>Photos & Videos</span>
                      <input 
                        type="file" 
                        onChange={(e) => {
                          onFileChange(e.target.files?.[0] || null);
                          setShowAttachMenu(false);
                          e.target.value = '';
                        }}
                        accept="image/*,video/*"
                        className="hidden"
                      />
                    </label>

                    <label className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs font-semibold transition-colors",
                      isDarkMode ? "hover:bg-slate-800 text-slate-355" : "hover:bg-slate-100 text-slate-700"
                    )}>
                      <FileText size={15} className="text-purple-400" />
                      <span>Document</span>
                      <input 
                        type="file" 
                        onChange={(e) => {
                          onFileChange(e.target.files?.[0] || null);
                          setShowAttachMenu(false);
                          e.target.value = '';
                        }}
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        className="hidden"
                      />
                    </label>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Dynamic input bar / Audio Visualizer overlay */}
        <div className="flex-1 relative min-h-[38px] flex items-center">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between px-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Recording</span>
                
                {/* Visualizer Wave */}
                <div className="flex items-center gap-0.5 h-3 ml-2">
                  {[0.5, 1.2, 0.7, 1.5, 0.9, 0.4].map((factor, index) => {
                    const barHeight = Math.max(2, Math.min(12, recordingVolume * 0.12 * factor));
                    return (
                      <motion.div
                        key={index}
                        animate={{ height: barHeight }}
                        className="w-0.5 bg-red-500/80 rounded-full"
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-wa-green">
                  {formatDuration(recordingDuration)}
                </span>
                <button 
                  onClick={() => { triggerHaptic('medium'); onStopRecording(false); }}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  title="Discard"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ) : (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              rows={1}
              maxLength={500}
              className={cn(
                "w-full py-1.5 px-3 rounded-xl border-none outline-none resize-none text-sm font-medium transition-all max-h-[120px] focus:ring-0",
                isDarkMode 
                  ? "bg-wa-bubble-in-dark placeholder:text-slate-500 text-wa-text-primary-dark" 
                  : "bg-white placeholder:text-slate-400 text-wa-text-primary-light"
              )}
              style={{ minHeight: '36px' }}
            />
          )}
        </div>

        {/* Circular Right Trigger Button (Mic or Send) */}
        <button
          onClick={handleRightButtonClick}
          className={cn(
            "w-9.5 h-9.5 rounded-full flex items-center justify-center shrink-0 text-white transition-transform active:scale-90 shadow-md tap-highlight-none",
            isRecording 
              ? "bg-wa-green hover:bg-emerald-600 animate-pulse" 
              : hasContent 
                ? "bg-wa-green hover:bg-emerald-600" 
                : isDarkMode ? "bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
          )}
        >
          {isRecording ? (
            <Check size={16} />
          ) : hasContent ? (
            <Send size={16} className="ml-0.5" />
          ) : (
            <Mic size={16} />
          )}
        </button>

      </div>

      {/* Lightbox for Image Attachments */}
      <AnimatePresence>
        {showFullscreen && attachmentType === 'image' && attachmentPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullscreen(false)}
            className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={attachmentPreview}
              alt="Fullscreen Preview"
              className="max-w-full max-h-full rounded-xl object-contain shadow-2xl border border-white/5"
            />
            <button 
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-white border border-slate-800 hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
