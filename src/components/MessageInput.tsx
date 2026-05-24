import React, { useState, useRef } from 'react';
import { Type, X, FileText, Video, Mic, Trash2, Check, Play, Pause, Image } from 'lucide-react';
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
        className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 active:scale-95 transition-all"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <div className="min-w-0 flex-1 flex flex-col gap-1 text-left">
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
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 outline-none"
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
}) => {
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
                  onClick={() => setShowFullscreen(true)}
                  className="w-12 h-12 object-cover rounded-xl border border-white/10 shrink-0 cursor-zoom-in hover:scale-105 transition-transform duration-200"
                />
              )}
              {attachmentType === 'video' && attachmentPreview && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-blue-500/20 shrink-0 relative group bg-black">
                  <video 
                    src={attachmentPreview} 
                    className="w-full h-full object-cover" 
                    muted 
                    loop
                    playsInline
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                    onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                    <Video size={14} className="text-white" />
                  </div>
                </div>
              )}
              {attachmentType === 'document' && (
                <div className={cn(
                  "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border text-[9px] font-bold tracking-wider",
                  getDocExtensionInfo(attachment.name).bg
                )}>
                  <FileText size={16} className="mb-0.5" />
                  <span>{getDocExtensionInfo(attachment.name).label}</span>
                </div>
              )}
              {attachmentType === 'audio' && attachmentPreview && (
                <AudioPreviewPlayer src={attachmentPreview} initialDuration={audioDuration} />
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
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500">Recording Audio</p>
                  
                  {/* Waveform Visualizer */}
                  <div className="flex items-center gap-0.5 h-4 mt-1">
                    {[0.5, 0.8, 1.2, 0.7, 1.5, 1.0, 0.6, 1.1, 0.4].map((factor, index) => {
                      const barHeight = Math.max(3, Math.min(16, recordingVolume * 0.16 * factor));
                      return (
                        <motion.div
                          key={index}
                          animate={{ height: barHeight }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-0.5 bg-red-500/80 rounded-full"
                        />
                      );
                    })}
                  </div>
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
      <div className="flex gap-1.5 items-center">
        {/* Media Button (Images/Videos) */}
        <label 
          title="Attach Image or Video"
          className={cn(
            "cursor-pointer p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center tap-highlight-none shrink-0",
            isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Image size={14} />
          <input 
            type="file" 
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onFileChange(file);
              e.target.value = '';
            }}
            accept="image/*,video/*"
            className="hidden"
          />
        </label>

        {/* Document Button */}
        <label 
          title="Attach Document"
          className={cn(
            "cursor-pointer p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center tap-highlight-none shrink-0",
            isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
          )}
        >
          <FileText size={14} />
          <input 
            type="file" 
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onFileChange(file);
              e.target.value = '';
            }}
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
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
        <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar flex-1 -mr-1 pr-1">
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

      {/* Fullscreen Lightbox for Image Attachments */}
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
              className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <button 
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-slate-900/80 text-white border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
