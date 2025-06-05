/**
 * useNetwork Hook
 * 
 * A comprehensive hook for monitoring network connectivity status and quality.
 * Provides real-time updates about the device's connection to the internet, 
 * connection quality estimation, and handles offline/online state transitions.
 * 
 * Features:
 * - Real-time online/offline detection
 * - Connection quality estimation (excellent, good, fair, poor)
 * - Connection type detection (wifi, cellular, etc.)
 * - Network speed estimation
 * - Connection state change events
 * - Debounced state updates to prevent flickering
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Connection quality ratings
export type ConnectionQuality = 'unknown' | 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

// Connection types from Network Information API
export type ConnectionType = 
  | 'bluetooth' 
  | 'cellular' 
  | 'ethernet' 
  | 'wifi' 
  | 'wimax' 
  | 'none' 
  | 'other' 
  | 'unknown';

// Extended Navigator interface to support Network Information API
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    type?: ConnectionType;
    onchange?: () => void;
  };
}

interface NetworkState {
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
  connectionType: ConnectionType;
  downlinkSpeed: number | null;
  latency: number | null;
  lastChecked: number;
}

interface UseNetworkOptions {
  pingUrl?: string;
  pingInterval?: number;
  debounceDelay?: number;
}

/**
 * Hook for monitoring network status and connection quality
 */
export function useNetwork(options: UseNetworkOptions = {}) {
  const { 
    pingUrl = 'https://www.gstatic.com/generate_204',
    pingInterval = 30000, // 30 seconds
    debounceDelay = 300 // 300ms debounce
  } = options;

  // Network state with initial values
  const [state, setState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    connectionQuality: 'unknown',
    connectionType: 'unknown',
    downlinkSpeed: null,
    latency: null,
    lastChecked: Date.now()
  });

  // Refs for internal state management
  const networkInfoRef = useRef((navigator as NavigatorWithConnection).connection);
  const timeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  
  // Store a history of speed measurements for calculating trends
  const speedHistoryRef = useRef<number[]>([]);

  /**
   * Updates network connection quality based on available metrics
   */
  const updateConnectionQuality = useCallback(() => {
    if (!navigator.onLine) {
      return 'offline';
    }

    const connection = networkInfoRef.current;
    
    // If we have Network Information API data
    if (connection) {
      const { effectiveType, downlink, rtt } = connection;
      
      // Use effective type if available (4g, 3g, 2g, slow-2g)
      if (effectiveType) {
        switch (effectiveType) {
          case '4g': return 'excellent';
          case '3g': return 'good';
          case '2g': return 'fair';
          case 'slow-2g': return 'poor';
          default: return 'unknown';
        }
      }
      
      // Or use downlink (Mbps) and RTT (ms) for estimation
      if (typeof downlink === 'number' && typeof rtt === 'number') {
        if (downlink >= 10 && rtt < 50) return 'excellent';
        if (downlink >= 5 && rtt < 100) return 'good';
        if (downlink >= 2 && rtt < 200) return 'fair';
        return 'poor';
      }
    }
    
    // Use speed history for estimation if we have it
    if (speedHistoryRef.current.length > 0) {
      const avgSpeed = speedHistoryRef.current.reduce((sum, speed) => sum + speed, 0) / 
                       speedHistoryRef.current.length;
      
      if (avgSpeed > 10) return 'excellent';
      if (avgSpeed > 5) return 'good';
      if (avgSpeed > 1) return 'fair';
      return 'poor';
    }
    
    return 'unknown';
  }, []);

  /**
   * Ping server to measure connection latency and update state
   */
  const pingServer = useCallback(async () => {
    if (!navigator.onLine) return;
    
    try {
      const startTime = Date.now();
      const response = await fetch(pingUrl, { 
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors'
      });
      const latency = Date.now() - startTime;
      
      // Update state with new measurements
      setState(prevState => {
        // Calculate estimated downlink speed based on latency
        const downlinkSpeed = networkInfoRef.current?.downlink || 
                             (latency < 50 ? 10 : latency < 100 ? 5 : latency < 300 ? 2 : 1);
        
        // Keep last 5 measurements
        speedHistoryRef.current.push(downlinkSpeed);
        if (speedHistoryRef.current.length > 5) {
          speedHistoryRef.current.shift();
        }
        
        return {
          ...prevState,
          isOnline: true,
          connectionQuality: updateConnectionQuality(),
          latency,
          downlinkSpeed,
          lastChecked: Date.now()
        };
      });
    } catch (error) {
      // Update state with failed ping
      setState(prevState => ({
        ...prevState,
        connectionQuality: 'poor',
        lastChecked: Date.now()
      }));
    }
  }, [pingUrl, updateConnectionQuality]);

  /**
   * Update connection info based on Network Information API
   */
  const updateNetworkInfo = useCallback(() => {
    // Clear any existing debounce
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce updates to avoid rapid state changes
    debounceTimerRef.current = window.setTimeout(() => {
      const connection = networkInfoRef.current;
      
      setState(prevState => ({
        ...prevState,
        isOnline: navigator.onLine,
        connectionType: (connection?.type as ConnectionType) || 'unknown',
        downlinkSpeed: connection?.downlink || prevState.downlinkSpeed,
        connectionQuality: updateConnectionQuality(),
        lastChecked: Date.now()
      }));
      
      // If we just came online, ping to update latency
      if (navigator.onLine && !prevState.isOnline) {
        pingServer();
      }
    }, debounceDelay);
  }, [debounceDelay, pingServer, updateConnectionQuality]);

  /**
   * Handle online status change
   */
  const handleOnline = useCallback(() => {
    updateNetworkInfo();
    // Start ping interval when coming online
    if (pingIntervalRef.current === null) {
      pingServer();
      pingIntervalRef.current = window.setInterval(pingServer, pingInterval);
    }
  }, [pingInterval, pingServer, updateNetworkInfo]);

  /**
   * Handle offline status change
   */
  const handleOffline = useCallback(() => {
    updateNetworkInfo();
    // Clear ping interval when going offline
    if (pingIntervalRef.current !== null) {
      window.clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, [updateNetworkInfo]);

  /**
   * Force an immediate check of the network status
   */
  const checkNetworkStatus = useCallback(async () => {
    await pingServer();
    return state;
  }, [pingServer, state]);

  // Set up event listeners
  useEffect(() => {
    // Add network status event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Add network information change listener if available
    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection) {
      networkInfoRef.current = connection;
      connection.onchange = updateNetworkInfo;
    }
    
    // Initialize with a ping
    pingServer();
    
    // Start ping interval if online
    if (navigator.onLine) {
      pingIntervalRef.current = window.setInterval(pingServer, pingInterval);
    }
    
    // Clean up event listeners and intervals
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection && connection.onchange) {
        connection.onchange = null;
      }
      
      if (pingIntervalRef.current) {
        window.clearInterval(pingIntervalRef.current);
      }
      
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [handleOffline, handleOnline, pingInterval, pingServer, updateNetworkInfo]);

  return {
    ...state,
    checkNetworkStatus
  };
}

export default useNetwork; 