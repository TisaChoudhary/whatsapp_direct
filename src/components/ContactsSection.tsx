import React from 'react';
import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Contact {
  name?: { display: string };
  phones?: { number: string }[];
}

interface ContactsSectionProps {
  contacts: Contact[];
  onSelect: (phone: string) => void;
  isDarkMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'success') => void;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  contacts,
  onSelect,
  isDarkMode,
  triggerHaptic,
}) => {
  const visibleContacts = contacts.slice(0, 50);

  if (visibleContacts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xs text-slate-500">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className={cn(
        "px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
        isDarkMode ? "text-slate-500 bg-[#111b21]" : "text-slate-500 bg-slate-50/50"
      )}>
        <span>Contacts ({contacts.length})</span>
      </div>

      <div className="divide-y divide-transparent">
        <AnimatePresence mode="popLayout">
          {visibleContacts.map((contact, idx) => {
            const phoneNumber = contact.phones?.[0]?.number;
            if (!phoneNumber) return null;

            return (
              <motion.button
                key={phoneNumber + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.01 }}
                onClick={() => {
                  triggerHaptic('light');
                  onSelect(phoneNumber);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 cursor-pointer text-left transition-all border-b",
                  isDarkMode 
                    ? "bg-transparent border-[#222e35] hover:bg-[#202c33] text-wa-text-primary-dark" 
                    : "bg-transparent border-[#e9edef] hover:bg-[#f0f2f5] text-wa-text-primary-light"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Round initial avatar */}
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm",
                    isDarkMode ? "bg-slate-800 text-wa-green" : "bg-slate-100 text-wa-green-dark border border-slate-200"
                  )}>
                    {contact.name?.display[0] || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate tracking-wide">{contact.name?.display}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono tracking-wide">{phoneNumber}</p>
                  </div>
                </div>
                <Phone size={13} className="text-wa-green opacity-60 ml-2 shrink-0" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
