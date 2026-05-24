import React from 'react';
import * as ClerkReact from '@clerk/clerk-react';

// A key is considered dummy/placeholder if it's empty, is a default placeholder, or contains "select-"
const isDummyKey = (key: string | undefined): boolean => {
  if (!key) return true;
  return key.includes('c2VsZWN0ZWQtbWFzdG9k') || key.includes('placeholder') || key === 'pk_test_...';
};

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export const ClerkProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isDummyKey(PUBLISHABLE_KEY)) {
    return <>{children}</>;
  }

  return (
    <ClerkReact.ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkReact.ClerkProvider>
  );
};

export const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isDummyKey(PUBLISHABLE_KEY)) {
    return null; // Mock signed out
  }
  return <ClerkReact.SignedIn>{children}</ClerkReact.SignedIn>;
};

export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isDummyKey(PUBLISHABLE_KEY)) {
    return <>{children}</>; // Mock signed out
  }
  return <ClerkReact.SignedOut>{children}</ClerkReact.SignedOut>;
};

export const SignInButton: React.FC<{ children: React.ReactElement; mode?: 'modal' | 'redirect' }> = ({ children }) => {
  if (isDummyKey(PUBLISHABLE_KEY)) {
    const cloned = React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        alert("Authentication is running in Local Preview Mode. To enable Cloud Sync, add your real VITE_CLERK_PUBLISHABLE_KEY to the .env.local file.");
      }
    });
    return cloned;
  }
  return <ClerkReact.SignInButton>{children}</ClerkReact.SignInButton>;
};

export const UserButton: React.FC<{ afterSignOutUrl?: string }> = () => {
  if (isDummyKey(PUBLISHABLE_KEY)) {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-500">
        DC
      </div>
    );
  }
  return <ClerkReact.UserButton afterSignOutUrl="/" />;
};

export const useUserWrapper = () => {
  if (isDummyKey(PUBLISHABLE_KEY)) {
    return { user: null, isLoaded: true };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return ClerkReact.useUser();
};
