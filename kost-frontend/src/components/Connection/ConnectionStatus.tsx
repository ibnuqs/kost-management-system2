// File: src/components/Connection/ConnectionStatus.tsx
import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

export default function ConnectionStatus() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Simple check - if no internet, show warning
    const checkConnection = () => {
      if (!navigator.onLine) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm">No internet connection</span>
      <button onClick={() => setShow(false)} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}