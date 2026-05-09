import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { RecentContact, ValidationResult, CountryCode } from '../types';
import { COUNTRY_CODES } from '../constants';

export const useWhatsApp = () => {
  const { user, isLoaded } = useUser();
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [recent, setRecent] = useState<RecentContact[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Haptic Feedback Utility
  const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
    if (!window.navigator.vibrate) return;
    
    switch(type) {
      case 'light': window.navigator.vibrate(10); break;
      case 'medium': window.navigator.vibrate(20); break;
      case 'success': window.navigator.vibrate([10, 30, 10]); break;
    }
  };

  // Load recent contacts
  useEffect(() => {
    if (isLoaded && user) {
      const cloudRecent = user.unsafeMetadata.recent as RecentContact[];
      if (cloudRecent) setRecent(cloudRecent);
    } else {
      const saved = localStorage.getItem('recent_contacts');
      if (saved) setRecent(JSON.parse(saved));
    }
  }, [isLoaded, user]);

  const saveContact = async (num: string) => {
    const updated = [
      { phone: num, timestamp: Date.now() },
      ...recent.filter(c => c.phone !== num)
    ].slice(0, 5);
    
    setRecent(updated);
    localStorage.setItem('recent_contacts', JSON.stringify(updated));

    if (user) {
      await user.update({ unsafeMetadata: { recent: updated } });
    }
  };

  const cleanAndValidate = (input: string): ValidationResult => {
    const found = input.match(/\+?\d[\d\s-]{7,}\d/);
    const target = found ? found[0] : input;
    let cleaned = target.replace(/\D/g, "");

    if (cleaned.length === 10 && !target.startsWith('+')) {
      cleaned = selectedCountry.code + cleaned;
    }

    const phoneNumber = parsePhoneNumberFromString('+' + cleaned);
    if (!phoneNumber?.isValid()) {
      return { cleaned, valid: false, error: "Invalid phone number" };
    }

    return { cleaned: phoneNumber.number.replace('+', ''), valid: true };
  };

  const validationResult = useMemo(() => cleanAndValidate(phone), [phone, selectedCountry]);

  return {
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
    saveContact,
    validationResult,
  };
};
