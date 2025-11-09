// components/SessionMonitor.tsx
"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkSessionStatus } from '@/app/lib/auth-check-actions'; 

// Reduce the polling to a reasonable interval for active use (e.g., 15 seconds)
const MONITOR_INTERVAL_MS = 30000; 

export function SessionMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Define the core session check logic as a stable callback
  const checkSession = useCallback(async () => {
    // Only proceed if the current path is a protected dashboard path
    if (!pathname.startsWith('/dashboard')) {
        return;
    }
    
    try {
        // This calls the Server Action, which checks the HttpOnly cookie
        const isValid = await checkSessionStatus();

        if (!isValid) {
            // Session invalid (cookie deleted/expired). Stop monitoring and redirect.
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            
            console.log('Session invalid. Redirecting to /signin.');
            router.replace('/signin');
        }
    } catch (error) {
        console.error('Session check failed:', error);
        // On network error or critical failure, you may want to stop polling
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }
  }, [pathname, router]);


  // 2. Main Effect: Setup polling and cleanup
  useEffect(() => {
    // Stop any existing interval before setting a new one
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    
    // Only proceed on protected paths
    if (!pathname.startsWith('/dashboard')) {
        return;
    }

    // Run a check immediately on mount/path change
    checkSession(); 

    // Start recurring check for active use
    intervalRef.current = setInterval(checkSession, MONITOR_INTERVAL_MS);

    // Cleanup: Clear the interval when the component unmounts or dependencies change
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };
  }, [pathname, checkSession]); // Rerun effect when pathname or checkSession changes


  // 3. Visibility API Effect: Check session when the tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Check session status every time the user focuses the tab
      if (document.visibilityState === 'visible' && pathname.startsWith('/dashboard')) {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup visibility listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, checkSession]);


  return null;
}