import { useState, useEffect, useMemo, useRef } from 'react';
import { useUserWrapper as useUser } from '../lib/clerk';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { registerPlugin } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Contacts } from '@capacitor-community/contacts';
import { RecentContact, ValidationResult, CountryCode } from '../types';
import { COUNTRY_CODES } from '../constants';

interface CallLogPlugin {
  getCallLogs(): Promise<{ logs: any[] }>;
}

const CallLog = registerPlugin<CallLogPlugin>('CallLogPlugin');

export const useWhatsApp = () => {
  const { user, isLoaded } = useUser();
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [recent, setRecent] = useState<RecentContact[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [callLog, setCallLog] = useState<any[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'document' | 'audio' | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingVolume, setRecordingVolume] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      clearAttachment();
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("File is too large (max 15MB)");
      triggerHaptic('medium');
      return;
    }

    setAttachment(file);
    setError('');

    if (file.type.startsWith('image/')) {
      setAttachmentType('image');
      setAttachmentPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('video/')) {
      setAttachmentType('video');
      setAttachmentPreview(URL.createObjectURL(file));
    } else {
      setAttachmentType('document');
      setAttachmentPreview(null);
    }
    triggerHaptic('light');
  };

  const clearAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachment(null);
    setAttachmentType(null);
    setAttachmentPreview(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setRecordingVolume(0);
      triggerHaptic('success');

      // Set up Audio Context and Analyser for real-time volume detection
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Small fftSize for fast, simple volume estimation
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Scale it to a percentage (typical values peak around 120-150 in normal speech)
          const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
          setRecordingVolume(normalizedVolume);
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (err) {
        console.warn("Failed to initialize audio analyzer context", err);
      }

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or not supported.");
      triggerHaptic('medium');
    }
  };

  const stopRecording = (shouldSave: boolean) => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Clean up volume tracking
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setRecordingVolume(0);

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
      
      const stream = mediaRecorder.stream;
      stream.getTracks().forEach((track) => track.stop());

      if (shouldSave) {
        const extension = mediaRecorder.mimeType.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([audioBlob], `voice-note-${Date.now()}.${extension}`, {
          type: mediaRecorder.mimeType,
        });

        if (file.size > 15 * 1024 * 1024) {
          setError("Voice note is too large");
          triggerHaptic('medium');
          return;
        }

        setAttachment(file);
        setAttachmentType('audio');
        setAttachmentPreview(URL.createObjectURL(file));
        setAudioDuration(recordingDuration);
        triggerHaptic('success');
      }
    };

    mediaRecorder.stop();
    setIsRecording(false);
    triggerHaptic('light');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);


  // Native Call Log Fetching (Requires Native Bridge on Android)
  const getCallLogs = async () => {
    try {
      const result = await CallLog.getCallLogs();
      setCallLog(result.logs);
    } catch (e) {
      console.warn("Native Call Log plugin not found or permission denied");
    }
  };

  // Native Contacts Fetching
  const getContacts = async () => {
    try {
      const permission = await Contacts.requestPermissions();
      if (permission.contacts === 'granted') {
        const result = await Contacts.getContacts({
          projection: {
            name: true,
            phones: true,
          }
        });
        setContacts(result.contacts);
      }
    } catch (e) {
      console.warn("Contacts not available or permission denied");
    }
  };

  // Native Haptic Feedback with Web Fallback
  const triggerHaptic = async (type: 'light' | 'medium' | 'success' = 'light') => {
    try {
      // Try Native Capacitor Haptics first
      switch(type) {
        case 'light': await Haptics.impact({ style: ImpactStyle.Light }); break;
        case 'medium': await Haptics.impact({ style: ImpactStyle.Medium }); break;
        case 'success': await Haptics.notification({ type: NotificationType.Success }); break;
      }
    } catch (e) {
      // Fallback to standard web vibration
      if (!window.navigator.vibrate) return;
      switch(type) {
        case 'light': window.navigator.vibrate(10); break;
        case 'medium': window.navigator.vibrate(20); break;
        case 'success': window.navigator.vibrate([10, 30, 10]); break;
      }
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
    contacts,
    getContacts,
    callLog,
    getCallLogs,
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
  };
};

