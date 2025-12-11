/**
 * Accounting Sync Initializer
 * Initializes and manages database synchronization
 * Import and use this in App.jsx or main.jsx
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../constants/ghanaEducation';
import {
  initializeSyncSystem,
  cleanupSyncSystem,
  startAutoSync,
  stopAutoSync,
  checkSyncStatus
} from '../utils/sync';

export const useAccountingSync = () => {
  const { userProfile } = useAuth();
  const syncInitialized = useRef(false);
  const autoSyncStarted = useRef(false);

  useEffect(() => {
    // Only initialize sync for accountant and super admin roles
    const shouldSync = userProfile?.role === USER_ROLES.ACCOUNTANT || 
                      userProfile?.role === USER_ROLES.SUPER_ADMIN;

    const initSync = async () => {
      if (shouldSync && !syncInitialized.current) {
        try {
          console.log('🔄 Initializing accounting database sync...');
          
          // Initialize the sync system
          const result = await initializeSyncSystem();
          
          if (result.success) {
            console.log('✅ Accounting sync initialized successfully');
            syncInitialized.current = true;

            // Start auto-sync (runs every 60 seconds)
            if (!autoSyncStarted.current) {
              startAutoSync(60000); // 60 seconds
              autoSyncStarted.current = true;
              console.log('🔁 Auto-sync started (60s interval)');
            }

            // Check initial sync status
            const status = await checkSyncStatus();
            if (status.success) {
              console.log('📊 Sync Status:', status.data);
              
              if (!status.data.inSync) {
                console.warn('⚠️ Databases not in sync. Difference:', status.data.difference);
              }
            }
          } else {
            console.error('❌ Failed to initialize sync:', result.error);
          }
        } catch (error) {
          console.error('❌ Error initializing sync:', error);
        }
      }
    };

    initSync();

    // Cleanup on unmount
    return () => {
      if (syncInitialized.current) {
        console.log('🧹 Cleaning up accounting sync...');
        cleanupSyncSystem();
        stopAutoSync();
        syncInitialized.current = false;
        autoSyncStarted.current = false;
      }
    };
  }, [userProfile?.role]);

  return {
    syncInitialized: syncInitialized.current,
    autoSyncStarted: autoSyncStarted.current
  };
};

/**
 * Component wrapper for sync initialization
 * Use this in your App component
 */
export const AccountingSyncProvider = ({ children }) => {
  useAccountingSync();
  return children;
};

export default AccountingSyncProvider;
