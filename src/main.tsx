import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';

// Import your Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Auth features will not work.");
}

// Initialize GA4
const GA_ID = import.meta.env.VITE_GA_ID;
if (GA_ID) {
  ReactGA.initialize(GA_ID);
  ReactGA.send("pageview");
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || ''}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
