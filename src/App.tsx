import React, { useState, useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Hooks & Utils
import { useWhatsApp } from './hooks/useWhatsApp';

// UI Presentation Component
import { DirectChatUI } from './ui';

const App: React.FC = () => {
  const {
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
  } = useWhatsApp();

  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'contacts' | 'calls'>('recent');

  // Initialize Native Features (Status Bar & Splash Screen)
  useEffect(() => {
    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light });
        if (window.navigator.userAgent.toLowerCase().includes('android')) {
          await StatusBar.setBackgroundColor({ color: isDarkMode ? '#0f172a' : '#f8fafc' });
        }
        await SplashScreen.hide();
        
        // Fetch data if available
        getContacts();
        getCallLogs();
      } catch (e) {
        console.log("Running in browser, skipping native initialization");
      }
    };
    initNative();
  }, [isDarkMode]);

  const handlePaste = async () => {
    triggerHaptic('light');
    try {
      const text = await navigator.clipboard.readText();
      const cleanedNum = text.replace(/\D/g, "");
      if (cleanedNum) {
        setPhone(cleanedNum);
      } else {
        setError("No number found in clipboard");
      }
    } catch (err) {
      setError("Clipboard access denied");
    }
  };

  const handleAction = (type: 'message' | 'qr') => {
    triggerHaptic('medium');
    if (!validationResult.valid) {
      setError(validationResult.error || "Check the number");
      return;
    }

    const whatsappUrl = `https://wa.me/${validationResult.cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    
    if (type === 'message') {
      saveContact(validationResult.cleaned);
      triggerHaptic('success');
      
      if (attachment) {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [attachment] })) {
          navigator.share({
            files: [attachment],
            title: 'DirectChat Attachment',
            text: message,
          }).catch(err => {
            console.error("Error sharing attachment:", err);
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
          });
        } else {
          alert("Note: Web browser API limits do not allow automatic file attachment. We will open the chat; please select the file from your gallery manually.");
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } else {
      setShowQR(true);
    }
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    const url = `https://wa.me/${validationResult.cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    
    if (attachment && navigator.share && navigator.canShare && navigator.canShare({ files: [attachment] })) {
      try {
        await navigator.share({
          files: [attachment],
          title: 'DirectChat Attachment',
          text: message,
        });
      } catch (err) {
        console.error("Error sharing attachment:", err);
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'DirectChat',
          text: `Chat with me on WhatsApp: ${validationResult.cleaned}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <DirectChatUI
      phone={phone}
      setPhone={setPhone}
      message={message}
      setMessage={setMessage}
      error={error}
      setError={setError}
      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
      recent={recent}
      setRecent={setRecent}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      triggerHaptic={triggerHaptic}
      validationResult={validationResult}
      contacts={contacts}
      callLog={callLog}
      attachment={attachment}
      attachmentType={attachmentType}
      attachmentPreview={attachmentPreview}
      handleFileChange={handleFileChange}
      clearAttachment={clearAttachment}
      isRecording={isRecording}
      recordingDuration={recordingDuration}
      startRecording={startRecording}
      stopRecording={stopRecording}
      recordingVolume={recordingVolume}
      audioDuration={audioDuration}
      showQR={showQR}
      setShowQR={setShowQR}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handlePaste={handlePaste}
      handleAction={handleAction}
      handleShare={handleShare}
    />
  );
};

export default App;
