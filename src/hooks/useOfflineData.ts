/**
 * useOfflineData Hook
 * 
 * This custom React hook provides a simple interface for components to work with
 * offline data stored in IndexedDB. It handles data fetching, caching, and 
 * synchronization with the server, offering a seamless offline-first experience.
 * 
 * Features:
 * - Type-safe data access with TypeScript generics
 * - Optimistic UI updates for better UX
 * - Automatic background synchronization
 * - Support for custom synchronization logic
 * - Built-in stale-while-revalidate caching strategy
 * - Pagination support for large datasets
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import indexedDBService from '../services/indexedDBService';
import { addToOfflineQueue } from '../services/indexedDBService';
import { useNetwork } from './useNetwork';
import { config } from '../config';

// Types of data operations
export type DataOperation = 'create' | 'update' | 'delete' | 'read';

// Options for useOfflineData hook
export interface UseOfflineDataOptions<T> {
  // The store/table name in IndexedDB
  storeName: string;
  
  // Function to fetch data from API when online
  fetchFn?: (id?: string) => Promise<T>;
  
  // API endpoint for CRUD operations
  apiEndpoint?: string;
  
  // Cache expiration time in milliseconds (default: 1 hour)
  cacheTime?: number;
  
  // Whether to skip initial fetch (default: false)
  skipInitialFetch?: boolean;
  
  // Function to generate a unique ID for new items
  generateId?: () => string;
  
  // Function to determine if local data is stale and needs refresh
  isStale?: (data: T, cachedAt: number) => boolean;
  
  // Function to resolve conflicts between local and server data
  resolveConflict?: (localData: T, serverData: T) => T;
  
  // Whether to use optimistic updates (default: true)
  optimisticUpdates?: boolean;
}

/**
 * Custom hook for working with offline data
 * @param id Optional ID of the specific data item
 * @param options Configuration options
 */
function useOfflineData<T extends { id: string }>(
  id?: string,
  options: UseOfflineDataOptions<T> = { storeName: '' }
) {
  // Extract options with defaults
  const {
    storeName,
    fetchFn,
    apiEndpoint,
    cacheTime = 60 * 60 * 1000, // 1 hour
    skipInitialFetch = false,
    generateId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    isStale = (_, cachedAt) => Date.now() - cachedAt > cacheTime,
    resolveConflict = (_, serverData) => serverData,
    optimisticUpdates = true,
  } = options;

  // State for data and loading status
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Network status hook
  const { isOnline, connectionQuality } = useNetwork();

  // Ref to track if component is mounted
  const isMounted = useRef(true);

  // Function to fetch data from server
  const fetchFromServer = useCallback(async (): Promise<T | null> => {
    if (!fetchFn || !isOnline || !id) return null;

    try {
      setIsSyncing(true);
      const serverData = await fetchFn(id);
      
      if (serverData) {
        // Cache the server data
        await indexedDBService.setCache(
          storeName,
          serverData,
          cacheTime
        );
        
        // Update state if component is still mounted
        if (isMounted.current) {
          setData(serverData);
          setLastUpdated(Date.now());
        }
      }
      
      return serverData;
    } catch (err) {
      if (isMounted.current) {
        setError(err as Error);
      }
      console.error(`Failed to fetch ${storeName} from server:`, err);
      return null;
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
    }
  }, [fetchFn, isOnline, id, storeName, cacheTime]);

  // Function to get data (from cache or server)
  const getData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to get data from cache first
      const cachedData = await indexedDBService.getCache<T & { lastUpdated?: number }>(storeName, id);
      
      if (cachedData) {
        setData(cachedData);
        setLastUpdated(cachedData.lastUpdated || 0);
        
        // If online and data is stale, fetch from server in background
        if (isOnline && isStale(cachedData, cachedData.lastUpdated || 0)) {
          fetchFromServer().catch(err => 
            console.error(`Background refresh failed for ${storeName}:`, err)
          );
        }
      } else if (isOnline) {
        // If no cached data and online, fetch from server
        await fetchFromServer();
      }
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to get ${storeName} data:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [id, storeName, isOnline, fetchFromServer, isStale]);

  // Function to create/update data
  const saveData = useCallback(async (newData: Partial<T>): Promise<T | null> => {
    try {
      setError(null);
      
      // Determine if this is an update or create operation
      const isUpdate = Boolean(id) || Boolean(newData.id);
      const operation: DataOperation = isUpdate ? 'update' : 'create';
      const itemId = id || newData.id || generateId();
      
      // Merge with existing data if updating
      let updatedData: T;
      if (isUpdate && data) {
        updatedData = {
          ...data,
          ...newData,
          id: itemId,
        };
      } else {
        updatedData = {
          ...newData,
          id: itemId,
        } as T;
      }
      
      // Apply optimistic update if enabled
      if (optimisticUpdates) {
        setData(updatedData);
        setLastUpdated(Date.now());
      }
      
      // Add timestamp if not present
      if (!('lastUpdated' in updatedData)) {
        (updatedData as any).lastUpdated = Date.now();
      }
      
      // Cache the updated data locally
      await indexedDBService.setCache(
        storeName,
        updatedData,
        cacheTime
      );
      
      // If online and endpoint is provided, sync with server
      if (isOnline && apiEndpoint) {
        try {
          const url = isUpdate 
            ? `${apiEndpoint}/${itemId}`
            : apiEndpoint;
            
          const method = isUpdate ? 'PATCH' : 'POST';
          
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          const serverData = await response.json();
          
          // Resolve any conflicts if necessary
          const finalData = resolveConflict(updatedData, serverData);
          
          // Update cache with server data
          await indexedDBService.setCache(
            storeName,
            finalData,
            cacheTime
          );
          
          setData(finalData);
          return finalData;
        } catch (err) {
          console.error(`Failed to sync ${storeName} with server:`, err);
          
          // Still return optimistic data but queue for sync
          if (apiEndpoint) {
            await addToOfflineQueue(
              isUpdate ? `${apiEndpoint}/${itemId}` : apiEndpoint,
              isUpdate ? 'PATCH' : 'POST',
              updatedData
            );
          }
        }
      } else if (apiEndpoint) {
        // If offline, add to sync queue
        await addToOfflineQueue(
          isUpdate ? `${apiEndpoint}/${itemId}` : apiEndpoint,
          isUpdate ? 'PATCH' : 'POST',
          updatedData
        );
      }
      
      return updatedData;
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to save ${storeName} data:`, err);
      return null;
    }
  }, [id, data, optimisticUpdates, storeName, isOnline, apiEndpoint, cacheTime, generateId, resolveConflict]);

  // Function to delete data
  const deleteData = useCallback(async (): Promise<boolean> => {
    if (!id) return false;
    
    try {
      setError(null);
      
      // Optimistically remove from state
      if (optimisticUpdates) {
        setData(null);
      }
      
      // Remove from local cache
      await indexedDBService.deleteCache(storeName, id);
      
      // If online and endpoint is provided, delete from server
      if (isOnline && apiEndpoint) {
        try {
          const response = await fetch(`${apiEndpoint}/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          return true;
        } catch (err) {
          console.error(`Failed to delete ${storeName} from server:`, err);
          
          // Queue delete operation for when online
          if (apiEndpoint) {
            await addToOfflineQueue(
              `${apiEndpoint}/${id}`,
              'DELETE',
              null
            );
          }
        }
      } else if (apiEndpoint) {
        // If offline, add to sync queue
        await addToOfflineQueue(
          `${apiEndpoint}/${id}`,
          'DELETE',
          null
        );
      }
      
      return true;
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to delete ${storeName} data:`, err);
      return false;
    }
  }, [id, optimisticUpdates, storeName, isOnline, apiEndpoint]);

  // Function to force refresh data from server
  const refresh = useCallback(async (): Promise<T | null> => {
    if (!isOnline || !id) {
      return data;
    }
    
    return await fetchFromServer();
  }, [isOnline, id, data, fetchFromServer]);

  // Initial data fetch
  useEffect(() => {
    if (!skipInitialFetch) {
      getData();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [getData, skipInitialFetch]);

  // Listen for online status changes to sync
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isOnline && id && fetchFn) {
      // Wait a bit after coming online to avoid race conditions
      timeoutId = setTimeout(() => {
        fetchFromServer().catch(console.error);
      }, 2000);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOnline, id, fetchFn, fetchFromServer]);

  return {
    data,
    isLoading,
    isSyncing,
    error,
    lastUpdated,
    isOnline,
    connectionQuality,
    save: saveData,
    delete: deleteData,
    refresh,
  };
}

/**
 * Hook for working with collections of offline data
 * @param options Configuration options
 */
export function useOfflineCollection<T extends { id: string }>(
  options: UseOfflineDataOptions<T[]> & {
    // Function to fetch a collection of items
    fetchCollectionFn?: (params?: any) => Promise<T[]>;
    // Parameters for collection fetch
    fetchParams?: any;
    // Function to filter items locally
    filterFn?: (item: T) => boolean;
    // Function to sort items
    sortFn?: (a: T, b: T) => number;
    // Maximum number of items to return
    limit?: number;
    // Number of items to skip (for pagination)
    offset?: number;
  } = { storeName: '' }
) {
  // Extract additional options with defaults
  const {
    storeName,
    fetchCollectionFn,
    fetchParams,
    filterFn,
    sortFn,
    limit = 50,
    offset = 0,
    cacheTime = 60 * 60 * 1000, // 1 hour
    skipInitialFetch = false,
    optimisticUpdates = true,
  } = options;

  // State for data and loading status
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Network status hook
  const { isOnline, connectionQuality } = useNetwork();

  // Ref to track if component is mounted
  const isMounted = useRef(true);

  // Collection cache key
  const cacheKey = useRef(`${storeName}_collection_${JSON.stringify(fetchParams || {})}`);

  // Function to fetch collection from server
  const fetchFromServer = useCallback(async (): Promise<T[] | null> => {
    if (!fetchCollectionFn || !isOnline) return null;

    try {
      setIsSyncing(true);
      const serverData = await fetchCollectionFn(fetchParams);
      
      if (serverData && Array.isArray(serverData)) {
        // Cache individual items
        await Promise.all(
          serverData.map(item => 
            indexedDBService.setCache(
              storeName,
              item,
              cacheTime
            )
          )
        );
        
        // Cache the collection metadata
        await indexedDBService.setCache(
          'collections',
          {
            id: cacheKey.current,
            ids: serverData.map(item => item.id),
            totalCount: serverData.length,
            params: fetchParams || {},
            lastUpdated: Date.now()
          },
          cacheTime
        );
        
        // Update state if component is still mounted
        if (isMounted.current) {
          let filteredData = serverData;
          
          // Apply filter if provided
          if (filterFn) {
            filteredData = filteredData.filter(filterFn);
          }
          
          // Apply sort if provided
          if (sortFn) {
            filteredData.sort(sortFn);
          }
          
          // Apply pagination
          const paginatedData = filteredData.slice(offset, offset + limit);
          
          setItems(paginatedData);
          setTotalCount(filteredData.length);
          setLastUpdated(Date.now());
        }
      }
      
      return serverData;
    } catch (err) {
      if (isMounted.current) {
        setError(err as Error);
      }
      console.error(`Failed to fetch ${storeName} collection from server:`, err);
      return null;
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
    }
  }, [fetchCollectionFn, fetchParams, isOnline, storeName, cacheTime, filterFn, sortFn, offset, limit]);

  // Function to get collection data (from cache or server)
  const getCollectionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get collection metadata from cache
      const collectionMeta = await indexedDBService.getCache<{
        ids: string[];
        totalCount: number;
        params: any;
        lastUpdated: number;
      }>('collections', cacheKey.current);
      
      if (collectionMeta) {
        // Fetch all items in the collection from cache
        const cachedItems = await Promise.all(
          collectionMeta.ids.map(async id => {
            const item = await indexedDBService.getCache<T>(storeName, id);
            return item;
          })
        );
        
        // Filter out null values
        const validItems = cachedItems.filter(Boolean) as T[];
        
        // Apply filter if provided
        let filteredItems = filterFn 
          ? validItems.filter(filterFn) 
          : validItems;
        
        // Apply sort if provided
        if (sortFn) {
          filteredItems.sort(sortFn);
        }
        
        // Apply pagination
        const paginatedItems = filteredItems.slice(offset, offset + limit);
        
        setItems(paginatedItems);
        setTotalCount(filteredItems.length);
        setLastUpdated(collectionMeta.lastUpdated);
        
        // If online and collection is stale, fetch from server in background
        if (isOnline && Date.now() - collectionMeta.lastUpdated > cacheTime) {
          fetchFromServer().catch(err => 
            console.error(`Background refresh failed for ${storeName} collection:`, err)
          );
        }
      } else if (isOnline) {
        // If no cached data and online, fetch from server
        await fetchFromServer();
      }
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to get ${storeName} collection data:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [storeName, cacheTime, isOnline, fetchFromServer, filterFn, sortFn, offset, limit]);

  // Function to add an item to the collection
  const addItem = useCallback(async (newItem: Partial<T>): Promise<T | null> => {
    try {
      setError(null);
      
      // Generate ID if not present
      const itemId = newItem.id || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create complete item with ID
      const item = {
        ...newItem,
        id: itemId,
        lastUpdated: Date.now(),
      } as T;
      
      // Apply optimistic update if enabled
      if (optimisticUpdates) {
        setItems(prevItems => {
          const updatedItems = [...prevItems, item];
          
          // Apply sort if provided
          if (sortFn) {
            updatedItems.sort(sortFn);
          }
          
          // Apply pagination
          return updatedItems.slice(0, limit);
        });
        
        setTotalCount(prev => prev + 1);
        setLastUpdated(Date.now());
      }
      
      // Cache the new item
      await indexedDBService.setCache(
        storeName,
        item,
        cacheTime
      );
      
      // Update collection metadata
      const collectionMeta = await indexedDBService.getCache<{
        ids: string[];
        totalCount: number;
        params: any;
        lastUpdated: number;
      }>('collections', cacheKey.current);
      
      if (collectionMeta) {
        await indexedDBService.setCache(
          'collections',
          {
            ...collectionMeta,
            ids: [...collectionMeta.ids, itemId],
            totalCount: collectionMeta.totalCount + 1,
            lastUpdated: Date.now()
          },
          cacheTime
        );
      }
      
      // If online and endpoint is provided, sync with server
      if (isOnline && options.apiEndpoint) {
        try {
          const response = await fetch(options.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          const serverData = await response.json();
          
          // Update cache with server data
          await indexedDBService.setCache(
            storeName,
            serverData,
            cacheTime
          );
          
          // Update item in the collection
          if (optimisticUpdates) {
            setItems(prevItems => {
              const updatedItems = prevItems.map(i => 
                i.id === itemId ? serverData : i
              );
              
              // Apply sort if provided
              if (sortFn) {
                updatedItems.sort(sortFn);
              }
              
              return updatedItems;
            });
          }
          
          return serverData;
        } catch (err) {
          console.error(`Failed to sync new ${storeName} with server:`, err);
          
          // Queue for sync when online
          if (options.apiEndpoint) {
            await addToOfflineQueue(
              options.apiEndpoint,
              'POST',
              item
            );
          }
        }
      } else if (options.apiEndpoint) {
        // If offline, add to sync queue
        await addToOfflineQueue(
          options.apiEndpoint,
          'POST',
          item
        );
      }
      
      return item;
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to add item to ${storeName} collection:`, err);
      return null;
    }
  }, [storeName, cacheTime, isOnline, options.apiEndpoint, optimisticUpdates, sortFn, limit]);

  // Function to update an item in the collection
  const updateItem = useCallback(async (itemId: string, updates: Partial<T>): Promise<T | null> => {
    try {
      setError(null);
      
      // Get current item data
      const existingItem = await indexedDBService.getCache<T>(storeName, itemId);
      
      if (!existingItem) {
        throw new Error(`Item with ID ${itemId} not found in ${storeName}`);
      }
      
      // Merge updates with existing data
      const updatedItem = {
        ...existingItem,
        ...updates,
        id: itemId,
        lastUpdated: Date.now(),
      };
      
      // Apply optimistic update if enabled
      if (optimisticUpdates) {
        setItems(prevItems => {
          const updatedItems = prevItems.map(item => 
            item.id === itemId ? updatedItem : item
          );
          
          // Apply sort if provided
          if (sortFn) {
            updatedItems.sort(sortFn);
          }
          
          return updatedItems;
        });
        
        setLastUpdated(Date.now());
      }
      
      // Cache the updated item
      await indexedDBService.setCache(
        storeName,
        updatedItem,
        cacheTime
      );
      
      // If online and endpoint is provided, sync with server
      if (isOnline && options.apiEndpoint) {
        try {
          const response = await fetch(`${options.apiEndpoint}/${itemId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          const serverData = await response.json();
          
          // Update cache with server data
          await indexedDBService.setCache(
            storeName,
            serverData,
            cacheTime
          );
          
          // Update item in the collection
          if (optimisticUpdates) {
            setItems(prevItems => {
              const updatedItems = prevItems.map(item => 
                item.id === itemId ? serverData : item
              );
              
              // Apply sort if provided
              if (sortFn) {
                updatedItems.sort(sortFn);
              }
              
              return updatedItems;
            });
          }
          
          return serverData;
        } catch (err) {
          console.error(`Failed to sync updated ${storeName} with server:`, err);
          
          // Queue for sync when online
          if (options.apiEndpoint) {
            await addToOfflineQueue(
              `${options.apiEndpoint}/${itemId}`,
              'PATCH',
              updates
            );
          }
        }
      } else if (options.apiEndpoint) {
        // If offline, add to sync queue
        await addToOfflineQueue(
          `${options.apiEndpoint}/${itemId}`,
          'PATCH',
          updates
        );
      }
      
      return updatedItem;
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to update item in ${storeName} collection:`, err);
      return null;
    }
  }, [storeName, cacheTime, isOnline, options.apiEndpoint, optimisticUpdates, sortFn]);

  // Function to remove an item from the collection
  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Optimistically remove from state
      if (optimisticUpdates) {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setTotalCount(prev => Math.max(0, prev - 1));
        setLastUpdated(Date.now());
      }
      
      // Remove from cache
      await indexedDBService.deleteCache(storeName, itemId);
      
      // Update collection metadata
      const collectionMeta = await indexedDBService.getCache<{
        ids: string[];
        totalCount: number;
        params: any;
        lastUpdated: number;
      }>('collections', cacheKey.current);
      
      if (collectionMeta) {
        await indexedDBService.setCache(
          'collections',
          {
            ...collectionMeta,
            ids: collectionMeta.ids.filter(id => id !== itemId),
            totalCount: Math.max(0, collectionMeta.totalCount - 1),
            lastUpdated: Date.now()
          },
          cacheTime
        );
      }
      
      // If online and endpoint is provided, delete from server
      if (isOnline && options.apiEndpoint) {
        try {
          const response = await fetch(`${options.apiEndpoint}/${itemId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          return true;
        } catch (err) {
          console.error(`Failed to delete ${storeName} from server:`, err);
          
          // Queue delete operation for when online
          if (options.apiEndpoint) {
            await addToOfflineQueue(
              `${options.apiEndpoint}/${itemId}`,
              'DELETE',
              null
            );
          }
        }
      } else if (options.apiEndpoint) {
        // If offline, add to sync queue
        await addToOfflineQueue(
          `${options.apiEndpoint}/${itemId}`,
          'DELETE',
          null
        );
      }
      
      return true;
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to remove item from ${storeName} collection:`, err);
      return false;
    }
  }, [storeName, cacheTime, isOnline, options.apiEndpoint, optimisticUpdates]);

  // Function to force refresh collection from server
  const refreshCollection = useCallback(async (): Promise<T[] | null> => {
    if (!isOnline) {
      return items;
    }
    
    return await fetchFromServer();
  }, [isOnline, items, fetchFromServer]);

  // Initial data fetch
  useEffect(() => {
    if (!skipInitialFetch) {
      getCollectionData();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [getCollectionData, skipInitialFetch]);

  // Update cache key when params change
  useEffect(() => {
    cacheKey.current = `${storeName}_collection_${JSON.stringify(fetchParams || {})}`;
  }, [storeName, fetchParams]);

  // Listen for online status changes to sync
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isOnline && fetchCollectionFn) {
      // Wait a bit after coming online to avoid race conditions
      timeoutId = setTimeout(() => {
        fetchFromServer().catch(console.error);
      }, 2000);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOnline, fetchCollectionFn, fetchFromServer]);

  return {
    items,
    isLoading,
    isSyncing,
    error,
    lastUpdated,
    totalCount,
    isOnline,
    connectionQuality,
    addItem,
    updateItem,
    removeItem,
    refresh: refreshCollection,
    // Pagination helpers
    hasMore: offset + items.length < totalCount,
    loadMore: () => {
      // This is a simple implementation that just increases the offset
      // In a real app, you'd need to track the offset and handle pagination properly
      // This is just a placeholder for now
      console.warn('loadMore is not fully implemented - you need to update your offset value');
    },
  };
}

export default useOfflineData; 