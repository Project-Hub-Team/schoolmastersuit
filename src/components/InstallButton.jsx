import React, { useState, useEffect } from 'react';
import { MdGetApp, MdClose } from 'react-icons/md';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    
    if (isInstalled) {
      setShowInstallButton(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallButton(false);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm flex items-center gap-3 border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          <img 
            src="/ALMA logo.png" 
            alt="ALMA Logo" 
            className="w-12 h-12 rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Install ALMA App
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Get quick access from your home screen
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-[#006B3F] hover:bg-[#005030] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <MdGetApp className="text-lg" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
          >
            Not now
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <MdClose className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default InstallButton;
