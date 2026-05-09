import React from 'react';
import { X, QrCode, Sparkles, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  show: boolean;
  onClose: () => void;
  phone: string;
  message: string;
  onShare: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  show,
  onClose,
  phone,
  message,
  onShare,
  triggerHaptic,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 max-w-sm w-full space-y-6 text-center relative shadow-2xl"
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
            <button 
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors p-2 tap-highlight-none"
            >
              <X size={24} />
            </button>
            
            <div className="space-y-2 pt-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <QrCode size={24} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Scan to Chat</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-4">
                Point your camera at this code to start a chat with <span className="font-bold text-slate-900">+{phone}</span>
              </p>
            </div>

            <div className="flex justify-center p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 relative group">
              <QRCodeSVG 
                value={`https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`} 
                size={200}
                fgColor="#0f172a"
                includeMargin={false}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-[2rem]">
                <Sparkles className="text-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onShare}
                className="bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm tap-highlight-none"
              >
                <Share2 size={18} /> Share
              </button>
              <button 
                onClick={onClose}
                className="bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all text-sm tap-highlight-none"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
