/**
 * SWR Hooks
 * 
 * Custom SWR hooks for data fetching with offline support and
 * integration with our caching service. These hooks enhance
 * the application with:
 * 
 * 1. Automatic caching and revalidation
 * 2. Offline support with persistent data
 * 3. Optimistic UI updates
 * 4. Automatic error handling and retries
 * 5. TypeScript type safety
 */

import useSWR, { SWRConfiguration, SWRResponse, useSWRConfig } from 'swr';
import useSWRInfinite, { SWRInfiniteConfiguration, SWRInfiniteResponse } from 'swr/infinite';
import useSWRMutation, { SWRMutationConfiguration, SWRMutationResponse } from 'swr/mutation';
import { useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError, fetcher } from '../services/apiService';
import cacheService, { STORE } from '../services/cacheService';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { useNetwork } from './useNetwork';

/**
 * Type for SWR options with cache configuration
 */
interface EnhancedSWROptions<Data = any, Error = any> extends SWRConfiguration<Data, Error> {
  /**
   * IndexedDB store to use for caching
   * If provided, data will be persisted in IndexedDB
   */
  cacheTo?: string;
  
  /**
   * Cache expiry time in milliseconds
   * Default is 24 hours
   */
  cacheTime?: number;
  
  /**
   * Stale time in milliseconds
   * Data is considered stale after this time and will trigger
   * a background revalidation, but stale data will still be returned
   * Default is 5 minutes
   */
  staleTime?: number;
  
  /**
   * Offline behavior
   * - 'cache-only': Only use cache when offline
   * - 'cache-first': Try cache first, then network (default)
   * - 'network-only': Only use network, no offline fallback
   */
  offlineMode?: 'cache-only' | 'cache-first' | 'network-only';
}

/**
 * Enhanced fetcher that works with IndexedDB caching and offline support
 */
const enhancedFetcher = async <T>(
  url: string,
  options: EnhancedSWROptions = {},
  fetchInit: RequestInit = {}
): Promise<T> => {
  const { cacheTo, cacheTime, staleTime, offlineMode = 'cache-first' } = options;
  const { isOnline } = useNetwork.getState();
  
  // If we have a cache store, try to get from cache first in offline mode
  if (cacheTo && (!isOnline || offlineMode === 'cache-first')) {
    try {
      // Extract ID from URL - this is a simple implementation,
      // might need to be enhanced for more complex URLs
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 1];
      
      if (id && id !== '') {
        const { data, isStale } = await cacheService.getCache<T>(cacheTo, id);
        
        if (data) {
          console.log(`[SWR] Using cached data for ${url}`, isStale ? '(stale)' : '');
          
          // If online and data is stale, trigger revalidation in background
          if (isOnline && isStale) {
            console.log(`[SWR] Data is stale, revalidating in background`);
            // We don't await this to avoid blocking the cache response
            fetcher<T>(url, fetchInit)
              .then(freshData => {
                if (cacheTo) {
                  cacheService.setCache(cacheTo, freshData, cacheTime, staleTime);
                }
              })
              .catch(error => {
                console.error(`[SWR] Background revalidation error for ${url}:`, error);
              });
          }
          
          return data;
        }
      }
    } catch (error) {
      console.error(`[SWR] Cache retrieval error for ${url}:`, error);
    }
  }
  
  // If offline and no cache, throw error
  if (!isOnline && offlineMode !== 'network-only') {
    throw new Error('You are offline and no cached data is available');
  }
  
  // Otherwise fetch from API
  try {
    const data = await fetcher<T>(url, fetchInit);
    
    // Store in cache if cache store is provided
    if (cacheTo && data) {
      try {
        await cacheService.setCache(cacheTo, data, cacheTime, staleTime);
      } catch (error) {
        console.error(`[SWR] Cache storage error for ${url}:`, error);
      }
    }
    
    return data;
  } catch (error) {
    // If online fetch fails, try cache as last resort
    if (cacheTo && offlineMode !== 'network-only') {
      try {
        const urlParts = url.split('/');
        const id = urlParts[urlParts.length - 1];
        
        if (id && id !== '') {
          const { data } = await cacheService.getCache<T>(cacheTo, id);
          
          if (data) {
            console.log(`[SWR] Network request failed, using cached data for ${url}`);
            return data;
          }
        }
      } catch (cacheError) {
        console.error(`[SWR] Cache fallback error for ${url}:`, cacheError);
      }
    }
    
    throw error;
  }
};

/**
 * Mutation function that works with offline capabilities
 */
const mutationFn = async <T>(
  url: string,
  { arg }: { arg: any },
  options: EnhancedSWROptions = {}
): Promise<T> => {
  const { cacheTo, offlineMode = 'cache-first' } = options;
  const { isOnline } = useNetwork.getState();
  
  // If offline, add to queue for later execution
  if (!isOnline) {
    const { method = 'POST' } = arg;
    
    try {
      await cacheService.addToOfflineQueue(
        url,
        method,
        arg.body,
        arg.headers
      );
      
      console.log(`[SWR] Added mutation to offline queue: ${method} ${url}`);
      return arg.optimisticData as T;
    } catch (error) {
      console.error(`[SWR] Failed to add mutation to offline queue:`, error);
      throw new Error('Failed to queue offline operation');
    }
  }
  
  // If online, perform the mutation
  try {
    const options: RequestInit = {
      method: arg.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...arg.headers
      }
    };
    
    if (arg.body) {
      options.body = JSON.stringify(arg.body);
    }
    
    const data = await fetcher<T>(url, options);
    
    // Update cache if needed
    if (cacheTo && data) {
      try {
        await cacheService.setCache(cacheTo, data);
      } catch (error) {
        console.error(`[SWR] Cache update error during mutation:`, error);
      }
    }
    
    return data;
  } catch (error) {
    // If mutation fails while online, queue for retry
    try {
      await cacheService.addToOfflineQueue(
        url,
        arg.method || 'POST',
        arg.body,
        arg.headers
      );
      
      console.log(`[SWR] Mutation failed, added to retry queue: ${arg.method || 'POST'} ${url}`);
    } catch (queueError) {
      console.error(`[SWR] Failed to add failed mutation to queue:`, queueError);
    }
    
    throw error;
  }
};

/**
 * Key generator for infinite lists
 */
const getInfiniteKey = (
  baseUrl: string,
  pageParam: (pageIndex: number, previousPageData: any) => any | null,
  pageIndex: number,
  previousPageData: any
): string | null => {
  // Reached the end
  if (previousPageData && !previousPageData.items?.length) {
    return null;
  }
  
  const param = pageParam(pageIndex, previousPageData);
  if (!param) return null;
  
  // Add query parameters to URL
  const url = new URL(baseUrl, window.location.origin);
  
  if (typeof param === 'object') {
    Object.entries(param).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  } else {
    // Handle case where pageParam returns a simple value like a string
    url.searchParams.append('nextToken', String(param));
  }
  
  return url.pathname + url.search;
};

/**
 * Hook for data fetching with offline support
 */
export function useData<Data = any, Error = ApiError>(
  url: string | null,
  options: EnhancedSWROptions<Data, Error> = {}
): SWRResponse<Data, Error> & {
  isOffline: boolean;
  isFromCache: boolean;
} {
  const { isOnline } = useNetwork.getState();
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Wrapper around enhancedFetcher to track cache usage
  const fetcherWithTracking = useCallback(async (fetchUrl: string) => {
    if (!url) return undefined;
    
    try {
      // If we have a cache store, check if data is coming from cache
      if (options.cacheTo) {
        const urlParts = fetchUrl.split('/');
        const id = urlParts[urlParts.length - 1];
        
        if (id && id !== '') {
          const { data } = await cacheService.getCache(options.cacheTo, id);
          setIsFromCache(!!data);
        }
      } else {
        setIsFromCache(false);
      }
      
      return enhancedFetcher<Data>(fetchUrl, options);
    } catch (error) {
      console.error(`[useData] Fetch error for ${fetchUrl}:`, error);
      throw error;
    }
  }, [url, options]);
  
  const swr = useSWR<Data, Error>(
    url,
    fetcherWithTracking,
    {
      ...options,
      // If offline and no cache strategy specified, don't revalidate
      revalidateOnFocus: isOnline && options.revalidateOnFocus,
      revalidateOnReconnect: isOnline && options.revalidateOnReconnect,
      // Default to higher errorRetryCount for potentially poor connections
      errorRetryCount: options.errorRetryCount ?? 5
    }
  );
  
  return {
    ...swr,
    isOffline: !isOnline,
    isFromCache
  };
}

/**
 * Hook for paginated data fetching with infinite loading
 */
export function useInfiniteData<Data = any, Error = ApiError>(
  url: string | null,
  pageParam: (pageIndex: number, previousPageData: any) => any | null,
  options: EnhancedSWROptions<Data, Error> & SWRInfiniteConfiguration<Data, Error> = {}
): SWRInfiniteResponse<Data, Error> & {
  isOffline: boolean;
  isFromCache: boolean;
  flatData: any[] | undefined;
} {
  const { isOnline } = useNetwork.getState();
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Wrapper around enhancedFetcher to track cache usage
  const fetcherWithTracking = useCallback(async (fetchUrl: string) => {
    if (!url) return undefined;
    
    try {
      // Since infinite lists usually don't have a clear ID in the URL,
      // we'll consider it from cache if we have any cached data for the store
      if (options.cacheTo) {
        try {
          const items = await cacheService.queryCacheByPredicate(
            options.cacheTo,
            () => true // Get all items
          );
          setIsFromCache(items.length > 0);
        } catch (error) {
          setIsFromCache(false);
        }
      } else {
        setIsFromCache(false);
      }
      
      return enhancedFetcher<Data>(fetchUrl, options);
    } catch (error) {
      console.error(`[useInfiniteData] Fetch error for ${fetchUrl}:`, error);
      throw error;
    }
  }, [url, options]);
  
  const getKey = useCallback((pageIndex: number, previousPageData: any) => {
    if (!url) return null;
    return getInfiniteKey(url, pageParam, pageIndex, previousPageData);
  }, [url, pageParam]);
  
  const swr = useSWRInfinite<Data, Error>(
    getKey,
    fetcherWithTracking,
    {
      ...options,
      // Default to having different behaviors depending on network status
      revalidateOnFocus: isOnline && (options.revalidateOnFocus ?? true),
      revalidateOnReconnect: isOnline && (options.revalidateOnReconnect ?? true),
      persistSize: options.persistSize ?? true,
      // Default to higher errorRetryCount for potentially poor connections
      errorRetryCount: options.errorRetryCount ?? 5
    }
  );
  
  // Extract and flatten paginated data
  const flatData = swr.data?.flatMap((page: any) => 
    // Handle both array responses and paginated responses with items array
    Array.isArray(page) ? page : (page?.items || [])
  );
  
  return {
    ...swr,
    isOffline: !isOnline,
    isFromCache,
    flatData
  };
}

/**
 * Hook for data mutations with offline support
 */
export function useMutation<Data = any, Error = ApiError, Variables = any>(
  url: string | null,
  options: EnhancedSWROptions & SWRMutationConfiguration<Data, Error, any, Variables> = {}
): SWRMutationResponse<Data, Error, any, Variables> & {
  isOffline: boolean;
} {
  const { isOnline } = useNetwork.getState();
  
  const mutation = useSWRMutation<Data, Error, any, Variables>(
    url,
    (fetchUrl, { arg }) => mutationFn<Data>(fetchUrl, { arg }, options),
    {
      ...options,
      // Don't retry if offline, as it will be queued
      revalidate: isOnline && (options.revalidate ?? true)
    }
  );
  
  return {
    ...mutation,
    isOffline: !isOnline
  };
}

/**
 * Network status hook for online/offline detection
 */
export function useNetwork() {
  const { isOnline, setIsOnline } = useNetwork.getState();
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[Network] Connection restored');
      // Process offline queue when connection is restored
      processOfflineQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('[Network] Connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);
  
  return { isOnline };
}

/**
 * Initialize network state
 */
useNetwork.getState = () => {
  const state = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    setIsOnline: (online: boolean) => {
      state.isOnline = online;
    }
  };
  return state;
};

/**
 * Process offline operation queue when back online
 */
async function processOfflineQueue() {
  try {
    const operations = await cacheService.getOfflineQueue();
    
    if (operations.length === 0) {
      return;
    }
    
    console.log(`[SWR] Processing ${operations.length} queued operations`);
    
    // Sort by timestamp, oldest first
    const sortedOperations = [...operations].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const operation of sortedOperations) {
      try {
        console.log(`[SWR] Processing queued operation: ${operation.method} ${operation.endpoint}`);
        
        // Update attempt count
        operation.attempts += 1;
        operation.lastAttempt = Date.now();
        await cacheService.updateOfflineQueueItem(operation);
        
        // Execute the operation
        const options: RequestInit = {
          method: operation.method,
          headers: {
            'Content-Type': 'application/json',
            ...operation.headers
          }
        };
        
        if (operation.body) {
          options.body = JSON.stringify(operation.body);
        }
        
        await fetcher(operation.endpoint, options);
        
        // Operation successful, remove from queue
        await cacheService.removeFromOfflineQueue(operation.id);
        console.log(`[SWR] Successfully processed queued operation: ${operation.method} ${operation.endpoint}`);
        
        // Trigger revalidation for related data
        const { cache } = useSWRConfig();
        cache.delete(operation.endpoint);
      } catch (error) {
        console.error(`[SWR] Failed to process queued operation:`, error);
        
        // If too many attempts, remove from queue
        if (operation.attempts >= 5) {
          console.log(`[SWR] Removing failed operation after ${operation.attempts} attempts`);
          await cacheService.removeFromOfflineQueue(operation.id);
        }
      }
    }
  } catch (error) {
    console.error(`[SWR] Error processing offline queue:`, error);
  }
}

export default {
  useData,
  useInfiniteData,
  useMutation,
  useNetwork
}; 