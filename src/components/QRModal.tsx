import React from 'react';
import { X, QrCode, Sparkles, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';

interface QRModalProps {
  show: boolean;
  onClose: () => void;
  phone: string;
  message: string;
  onShare: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
  isDarkMode?: boolean;
}

export const QRModal: React.FC<QRModalProps> = ({
  show,
  onClose,
  phone,
  message,
  onShare,
  triggerHaptic,
  isDarkMode = true,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "rounded-t-[2.5rem] sm:rounded-2xl p-6 max-w-sm w-full space-y-5 text-center relative shadow-2xl border",
              isDarkMode 
                ? "bg-[#222e35] border-slate-700/60 text-[#e9edef]" 
                : "bg-white border-slate-200 text-slate-800"
            )}
          >
            <div className={cn("w-12 h-1 rounded-full mx-auto mb-2 sm:hidden", isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
            <button 
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className={cn(
                "absolute top-4 right-4 transition-colors p-2 tap-highlight-none rounded-full",
                isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <X size={20} />
            </button>
            
            <div className="space-y-1.5 pt-1">
              <div className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2",
                isDarkMode ? "bg-[#00a884]/10 text-[#00a884]" : "bg-[#008069]/10 text-[#008069]"
              )}>
                <QrCode size={20} />
              </div>
              <h3 className="text-lg font-bold">Scan to Chat</h3>
              <p className={cn(
                "text-xs leading-relaxed px-4",
                isDarkMode ? "text-slate-400" : "text-slate-500"
              )}>
                Scan this code to launch a direct WhatsApp conversation with <span className="font-bold">+{phone}</span>
              </p>
            </div>

            <div className={cn(
              "flex justify-center p-5 rounded-xl border relative group shadow-inner",
              isDarkMode ? "bg-[#111b21] border-slate-800" : "bg-slate-50 border-slate-200"
            )}>
              <QRCodeSVG 
                value={`https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`} 
                size={180}
                fgColor={isDarkMode ? "#e9edef" : "#111b21"}
                bgColor={isDarkMode ? "#111b21" : "#ffffff"}
                includeMargin={false}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-wa-green/10 backdrop-blur-[1px] rounded-xl">
                <Sparkles className="text-wa-green animate-pulse" size={24} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={onShare}
                className={cn(
                  "font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs tap-highlight-none border",
                  isDarkMode 
                    ? "bg-slate-800/80 border-slate-700/50 hover:bg-slate-700 text-[#e9edef]" 
                    : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                )}
              >
                <Share2 size={14} /> Share
              </button>
              <button 
                onClick={onClose}
                className={cn(
                  "font-bold py-3.5 rounded-xl transition-all text-xs tap-highlight-none text-white",
                  isDarkMode 
                    ? "bg-wa-green hover:bg-emerald-600 shadow-md shadow-emerald-950/20" 
                    : "bg-[#008069] hover:bg-emerald-800 shadow-md shadow-emerald-100"
                )}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
