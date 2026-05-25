import React from 'react';
import { ClipboardPaste } from 'lucide-react';
import { COUNTRY_CODES } from '../constants';
import { CountryCode } from '../types';
import { cn } from '../lib/utils';

interface PhoneInputProps {
  phone: string;
  setPhone: (val: string) => void;
  selectedCountry: CountryCode;
  setSelectedCountry: (val: CountryCode) => void;
  error: string;
  setError: (val: string) => void;
  isDarkMode: boolean;
  onPaste: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  phone,
  setPhone,
  selectedCountry,
  setSelectedCountry,
  error,
  setError,
  isDarkMode,
  onPaste,
  triggerHaptic,
}) => {
  return (
    <div className={cn(
      "px-4 py-3 flex flex-wrap items-center gap-2.5 border-b text-sm transition-all",
      isDarkMode 
        ? "bg-wa-header-dark border-slate-800/80 text-wa-text-primary-dark" 
        : "bg-wa-header-light border-slate-200 text-wa-text-primary-light"
    )}>
      <span className={cn(
        "text-xs font-bold uppercase tracking-wider shrink-0",
        isDarkMode ? "text-slate-400" : "text-slate-500"
      )}>
        To:
      </span>
      
      {/* Country Select */}
      <div className="relative shrink-0">
        <select 
          value={selectedCountry.code}
          onChange={(e) => {
            triggerHaptic('light');
            setSelectedCountry(COUNTRY_CODES.find(c => c.code === e.target.value) || COUNTRY_CODES[0]);
          }}
          className={cn(
            "h-9 px-2.5 rounded-lg border appearance-none cursor-pointer focus:ring-1 focus:ring-wa-green outline-none transition-all font-medium text-xs",
            isDarkMode 
              ? "bg-wa-sidebar-dark border-slate-800 text-wa-text-primary-dark" 
              : "bg-white border-slate-300 text-wa-text-primary-light"
          )}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
          ))}
        </select>
      </div>

      {/* Number Input */}
      <div className="flex-1 min-w-[140px] relative">
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter phone number..."
          className={cn(
            "w-full h-9 px-3 rounded-lg border focus:ring-1 focus:ring-wa-green outline-none transition-all font-mono text-sm tracking-wide",
            isDarkMode 
              ? "bg-wa-sidebar-dark border-slate-800 placeholder:text-slate-600 text-wa-text-primary-dark" 
              : "bg-white border-slate-300 placeholder:text-slate-400 text-wa-text-primary-light"
          )}
        />
        {error && (
          <span className="text-red-400 text-[10px] absolute right-3 top-1/2 -translate-y-1/2 font-semibold">
            {error}
          </span>
        )}
      </div>

      {/* Action button (Paste) */}
      <button
        onClick={onPaste}
        title="Paste Number"
        className={cn(
          "h-9 px-3 rounded-lg border transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bold tap-highlight-none",
          isDarkMode 
            ? "bg-wa-sidebar-dark border-slate-800 hover:bg-slate-800 text-wa-green" 
            : "bg-white border-slate-300 hover:bg-slate-50 text-wa-green-dark"
        )}
      >
        <ClipboardPaste size={14} />
        <span>Paste</span>
      </button>
    </div>
  );
};
