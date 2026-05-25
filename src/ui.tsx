import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Settings,
  Cloud,
  ArrowLeft,
  QrCode,
  Share2,
  Lock,
  Search,
  CheckCheck,
  FileText
} from 'lucide-react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton 
} from './lib/clerk';
import { motion } from 'framer-motion';
import { cn } from './lib/utils';

// Components
import { PhoneInput } from './components/PhoneInput';
import { MessageInput } from './components/MessageInput';
import { HistorySection } from './components/HistorySection';
import { ContactsSection } from './components/ContactsSection';
import { CallsSection } from './components/CallsSection';
import { QRModal } from './components/QRModal';

// Types
import { CountryCode, RecentContact, ValidationResult } from './types';

interface UIProps {
  phone: string;
  setPhone: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  error: string;
  setError: (val: string) => void;
  selectedCountry: CountryCode;
  setSelectedCountry: (val: CountryCode) => void;
  recent: RecentContact[];
  setRecent: React.Dispatch<React.SetStateAction<RecentContact[]>>;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
  validationResult: ValidationResult;
  contacts: any[];
  callLog: any[];
  attachment: File | null;
  attachmentType: 'image' | 'video' | 'document' | 'audio' | null;
  attachmentPreview: string | null;
  handleFileChange: (file: File | null) => void;
  clearAttachment: () => void;
  isRecording: boolean;
  recordingDuration: number;
  startRecording: () => void;
  stopRecording: (save: boolean) => void;
  recordingVolume: number;
  audioDuration: number;
  showQR: boolean;
  setShowQR: (val: boolean) => void;
  activeTab: 'recent' | 'contacts' | 'calls';
  setActiveTab: (val: 'recent' | 'contacts' | 'calls') => void;
  handlePaste: () => void;
  handleAction: (type: 'message' | 'qr') => void;
  handleShare: () => void;
}

export const DirectChatUI: React.FC<UIProps> = ({
  phone,
  setPhone,
  message,
  setMessage,
  error,
  setError,
  selectedCountry,
  setSelectedCountry,
  recent,
  setRecent,
  isDarkMode,
  setIsDarkMode,
  triggerHaptic,
  validationResult,
  contacts,
  callLog,
  attachment,
  attachmentType,
  attachmentPreview,
  handleFileChange,
  clearAttachment,
  isRecording,
  recordingDuration,
  startRecording,
  stopRecording,
  recordingVolume,
  audioDuration,
  showQR,
  setShowQR,
  activeTab,
  setActiveTab,
  handlePaste,
  handleAction,
  handleShare,
}) => {
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-switch to chat view on mobile when a phone number is set/populated
  useEffect(() => {
    if (phone) {
      setMobileView('chat');
    }
  }, [phone]);

  const formattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRecipientLabel = () => {
    if (validationResult.valid) {
      return `+${validationResult.cleaned}`;
    }
    return phone ? `Draft: ${phone}` : 'Select/Type Recipient';
  };

  return (
    <div className={cn(
      "w-full h-[100dvh] flex items-center justify-center p-0 lg:p-4 transition-colors duration-500",
      isDarkMode ? "bg-[#0b141a] text-[#e9edef]" : "bg-[#dadbd3] text-[#111b21]"
    )}>
      
      {/* Container simulating WhatsApp Web app window */}
      <div className={cn(
        "w-full h-full lg:max-w-6xl lg:h-[95vh] flex rounded-none lg:rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 relative z-10",
        isDarkMode ? "bg-[#111b21] border-slate-800/60" : "bg-[#ffffff] border-slate-200/50"
      )}>
        
        {/* ================= LEFT SIDEBAR ================= */}
        <div className={cn(
          "w-full lg:w-[380px] xl:w-[410px] flex flex-col h-full border-r shrink-0 relative",
          mobileView === 'chat' ? "hidden lg:flex" : "flex",
          isDarkMode ? "bg-[#111b21] border-[#222e35]" : "bg-white border-[#e9edef]"
        )}>
          
          {/* Profile Header */}
          <div className={cn(
            "h-15 px-4 flex items-center justify-between shrink-0",
            isDarkMode ? "bg-[#202c33]" : "bg-[#f0f2f5]"
          )}>
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm transition-colors",
                  isDarkMode ? "bg-[#00a884]" : "bg-[#008069]"
                )}
              >
                <MessageSquare size={20} />
              </motion.div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">DirectChat</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">WhatsApp Hub</p>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button 
                onClick={() => { triggerHaptic('light'); setIsDarkMode(!isDarkMode); }}
                title="Toggle Theme"
                className={cn(
                  "p-1.5 rounded-full hover:bg-slate-700/20 transition-colors tap-highlight-none",
                  isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"
                )}
              >
                <Settings size={18} />
              </button>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className={cn(
                    "text-[10px] px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider tap-highlight-none",
                    isDarkMode 
                      ? "bg-slate-900 border-[#222e35] hover:bg-slate-800 text-slate-300" 
                      : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm"
                  )}>
                    <Cloud size={11} className="text-wa-green" />
                    Sync
                  </button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <div className="scale-90">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-2.5 shrink-0">
            <div className={cn(
              "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all text-xs font-medium",
              isDarkMode ? "bg-[#202c33] text-wa-text-primary-dark" : "bg-[#f0f2f5] text-wa-text-primary-light"
            )}>
              <Search size={14} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phone history or contacts..."
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={cn(
            "flex border-b shrink-0",
            isDarkMode ? "border-[#222e35]" : "border-[#e9edef]"
          )}>
            {[
              { id: 'recent', label: 'Recent' },
              { id: 'contacts', label: 'Contacts' },
              { id: 'calls', label: 'Calls' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => { triggerHaptic('light'); setActiveTab(tab.id as any); }}
                className={cn(
                  "flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all relative",
                  activeTab === tab.id 
                    ? isDarkMode 
                      ? "border-wa-green text-wa-green font-extrabold" 
                      : "border-wa-green-dark text-wa-green-dark font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-400"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lists Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeTab === 'recent' && (
              <HistorySection 
                recent={recent.filter(r => r.phone.includes(searchQuery))}
                onSelect={(val) => { setPhone(val); setMobileView('chat'); }}
                onDelete={(num) => {
                  const updated = recent.filter(c => c.phone !== num);
                  setRecent(updated);
                  localStorage.setItem('recent_contacts', JSON.stringify(updated));
                }}
                onClearAll={() => {
                  setRecent([]);
                  localStorage.removeItem('recent_contacts');
                }}
                isDarkMode={isDarkMode}
                triggerHaptic={triggerHaptic}
              />
            )}
            {activeTab === 'contacts' && (
              <ContactsSection 
                contacts={contacts.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.phones?.[0]?.number?.includes(searchQuery))}
                onSelect={(val) => { setPhone(val); setMobileView('chat'); }}
                isDarkMode={isDarkMode}
                triggerHaptic={triggerHaptic}
              />
            )}
            {activeTab === 'calls' && (
              <CallsSection 
                logs={callLog.filter(l => l.number?.includes(searchQuery) || l.name?.toLowerCase().includes(searchQuery.toLowerCase()))}
                onSelect={(val) => { setPhone(val); setMobileView('chat'); }}
                isDarkMode={isDarkMode}
                triggerHaptic={triggerHaptic}
              />
            )}
          </div>

          {/* Floating Action Button (FAB) on mobile to start a new chat */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setMobileView('chat');
            }}
            className="lg:hidden absolute bottom-6 right-6 w-14 h-14 rounded-full bg-wa-green hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all z-20"
            title="New Chat"
          >
            <MessageSquare size={22} />
          </button>
        </div>

        {/* ================= RIGHT CHAT WINDOW ================= */}
        <div className={cn(
          "flex-1 flex flex-col h-full relative overflow-hidden",
          mobileView === 'sidebar' ? "hidden lg:flex" : "flex",
          isDarkMode ? "bg-[#0b141a]" : "bg-[#efeae2]"
        )}>
          
          {/* Chat wallpaper backdrop */}
          <div className={cn(
            "absolute inset-0 z-0",
            isDarkMode ? "wa-wallpaper-dark" : "wa-wallpaper-light"
          )} />

          {/* Chat Header */}
          <div className={cn(
            "h-15 px-4 flex items-center justify-between shrink-0 z-10 border-b shadow-sm",
            isDarkMode ? "bg-[#202c33] border-[#222e35]" : "bg-[#f0f2f5] border-slate-200"
          )}>
            <div className="flex items-center min-w-0">
              
              {/* Back Arrow for mobile */}
              <button 
                onClick={() => setMobileView('sidebar')}
                className="lg:hidden p-1.5 mr-2 rounded-full hover:bg-slate-700/20 text-wa-green transition-colors tap-highlight-none shrink-0"
                title="Back to lists"
              >
                <ArrowLeft size={18} />
              </button>

              {/* Chat Profile Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm",
                  isDarkMode ? "bg-[#2a3942] text-[#8696a0]" : "bg-white text-slate-500 border border-slate-200"
                )}>
                  {selectedCountry.flag}
                </div>
                <div className="min-w-0 text-left">
                  <h2 className="text-sm font-extrabold truncate leading-tight">
                    {getRecipientLabel()}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold truncate">
                    {validationResult.valid ? `${selectedCountry.name} • Direct Chat Channel` : 'Type number to start composing'}
                  </p>
                </div>
              </div>
            </div>

            {/* Header Actions (QR Code and Share Link) */}
            {validationResult.valid && (
              <div className="flex items-center gap-1 shrink-0 z-10">
                <button
                  onClick={() => handleAction('qr')}
                  title="Generate QR Code"
                  className={cn(
                    "p-2 rounded-full transition-colors tap-highlight-none",
                    isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-wa-green" : "text-slate-600 hover:bg-slate-200 hover:text-[#008069]"
                  )}
                >
                  <QrCode size={18} />
                </button>
                <button
                  onClick={handleShare}
                  title="Share Direct Link"
                  className={cn(
                    "p-2 rounded-full transition-colors tap-highlight-none",
                    isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-sky-400" : "text-slate-600 hover:bg-slate-200 hover:text-sky-600"
                  )}
                >
                  <Share2 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Active Recipient compose bar just below header */}
          <div className="z-10 shrink-0">
            <PhoneInput 
              phone={phone}
              setPhone={setPhone}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              error={error}
              setError={setError}
              isDarkMode={isDarkMode}
              onPaste={handlePaste}
              triggerHaptic={triggerHaptic}
            />
          </div>

          {/* Chat Bubble Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 relative z-10 flex flex-col justify-between">
            <div className="space-y-4 flex-1 flex flex-col justify-end">
              
              {/* Welcome/Tutorial state when number is empty */}
              {!phone && (
                <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    isDarkMode ? "bg-slate-800/40 text-wa-green" : "bg-white text-wa-green-dark border shadow-sm"
                  )}>
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">DirectChat for WhatsApp</h3>
                    <p className={cn(
                      "text-xs mt-1 leading-relaxed",
                      isDarkMode ? "text-slate-500" : "text-slate-600"
                    )}>
                      Type a phone number or select a contact to compose and send WhatsApp messages directly, completely skipping your local contact list.
                    </p>
                  </div>
                </div>
              )}

              {phone && (
                <>
                  {/* Encrypted mock prompt */}
                  <div className="flex justify-center">
                    <span className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide flex items-center gap-1.5 uppercase shadow-sm select-none",
                      isDarkMode ? "bg-[#182229] text-[#ffd279]" : "bg-[#ffeecd] text-amber-900"
                    )}>
                      <Lock size={10} />
                      <span>Direct chat channel • No contact details are stored</span>
                    </span>
                  </div>

                  {/* Outgoing Live Preview Bubble */}
                  <div className="flex justify-end">
                    <div className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-left relative shadow-sm min-w-[120px] transition-all",
                      isDarkMode 
                        ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none border border-emerald-950/20" 
                        : "bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-emerald-100"
                    )}>
                      
                      {/* Media preview render inside bubble */}
                      {attachment && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/10 max-w-full">
                          {attachmentType === 'image' && attachmentPreview && (
                            <img src={attachmentPreview} alt="Image upload" className="max-w-full h-auto max-h-[180px] object-cover" />
                          )}
                          {attachmentType === 'video' && attachmentPreview && (
                            <video src={attachmentPreview} className="max-w-full max-h-[180px] object-cover" controls />
                          )}
                          {attachmentType === 'document' && (
                            <div className={cn(
                              "p-2.5 flex items-center gap-2 text-xs font-semibold",
                              isDarkMode ? "bg-slate-900/60" : "bg-white/80"
                            )}>
                              <FileText size={16} className="text-purple-400" />
                              <span className="truncate">{attachment.name}</span>
                            </div>
                          )}
                          {attachmentType === 'audio' && (
                            <div className={cn(
                              "p-2 flex items-center gap-2 text-xs",
                              isDarkMode ? "bg-slate-900/60" : "bg-white/80"
                            )}>
                              <MessageSquare size={14} className="text-wa-green" />
                              <span className="font-mono">Voice note • {audioDuration ? `${audioDuration}s` : 'Attached'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text content preview inside bubble */}
                      <p className="text-xs whitespace-pre-wrap leading-relaxed pr-10">
                        {message ? message : (
                          <span className={cn(
                            "italic",
                            isDarkMode ? "text-slate-400/80" : "text-slate-500"
                          )}>
                            Type message content below...
                          </span>
                        )}
                      </p>

                      {/* Timestamp & checkmarks indicator bottom right */}
                      <div className="absolute bottom-1 right-2.5 flex items-center gap-1 select-none">
                        <span className={cn(
                          "text-[9px] font-medium leading-none",
                          isDarkMode ? "text-emerald-350" : "text-emerald-700/80"
                        )}>
                          {formattedTime()}
                        </span>
                        <CheckCheck size={12} className="text-[#53bdeb] leading-none shrink-0" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chat Footer Message Input Area */}
          <div className="p-3.5 relative z-10 shrink-0">
            <MessageInput 
              message={message}
              setMessage={setMessage}
              isDarkMode={isDarkMode}
              triggerHaptic={triggerHaptic}
              attachment={attachment}
              attachmentType={attachmentType}
              attachmentPreview={attachmentPreview}
              onFileChange={handleFileChange}
              onClearAttachment={clearAttachment}
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              recordingVolume={recordingVolume}
              audioDuration={audioDuration}
              onSend={() => handleAction('message')}
            />
          </div>
        </div>

      </div>

      {/* WhatsApp QR Modal integration */}
      <QRModal 
        show={showQR}
        onClose={() => setShowQR(false)}
        phone={validationResult.cleaned}
        message={message}
        onShare={handleShare}
        triggerHaptic={triggerHaptic}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
