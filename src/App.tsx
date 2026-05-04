// Quick WhatsApp Main Component
import React, { useState, KeyboardEvent } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import './App.css';

const App: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string>('');

  const openWhatsApp = () => {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setError("Please enter a phone number");
      return;
    }

    let cleanedPhone = trimmedPhone.replace(/\D/g, ""); // clean input

    if (cleanedPhone.length < 7) {
      setError("Number is too short");
      return;
    }

    // Default to India country code (91) if the user enters exactly 10 digits
    if (cleanedPhone.length === 10) {
      cleanedPhone = "91" + cleanedPhone;
    }

    setError("");
    const url = `https://wa.me/${cleanedPhone}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      openWhatsApp();
    }
  };

  return (
    <div className="container">
      <div className="icon-wrapper">
        <MessageSquare size={32} />
      </div>
      <h1>Quick WhatsApp</h1>
      <p className="subtitle">Send messages without saving contacts</p>
      
      <div className="input-group">
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter phone number (e.g. 9876543210)"
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="error-msg">{error}</div>
      </div>

      <button onClick={openWhatsApp}>
        <Send size={18} />
        Message Now
      </button>

      <div className="footer">
        <p>Tip: Enter 10 digits to auto-prefix with +91 (India)</p>
      </div>
    </div>
  );
};

export default App;
