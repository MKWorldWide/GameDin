/**
 * Cache Service
 * 
 * This service manages offline data persistence using IndexedDB.
 * It provides methods for storing, retrieving, and synchronizing data
 * when the application is offline, ensuring a seamless user experience.
 */

// Constants for database configuration
const DB_NAME = 'gameDinCache';
const DB_VERSION = 1;

// Store names for different data types
export const STORE = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USERS: 'users',
  FRIENDS: 'friends',
  GAMES: 'games',
  EVENTS: 'events',
  QUEUE: 'offlineQueue', // For storing operations to execute when back online
  META: 'cacheMeta' // For storing metadata about cached items
};

// Meta information about cached data
interface CacheMeta {
  key: string;
  timestamp: number;
  expiry: number;
  staleTime?: number;
}

// Interface for queued operations
interface QueuedOperation {
  id: string;
  timestamp: number;
  endpoint: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  attempts: number;
  lastAttempt?: number;
}

/**
 * Initialize the IndexedDB database with all required stores
 */
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores for each data type if they don't exist
      if (!db.objectStoreNames.contains(STORE.CONVERSATIONS)) {
        db.createObjectStore(STORE.CONVERSATIONS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORE.MESSAGES)) {
        const messageStore = db.createObjectStore(STORE.MESSAGES, { keyPath: 'id' });
        messageStore.createIndex('byConversation', 'conversationId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORE.USERS)) {
        db.createObjectStore(STORE.USERS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORE.FRIENDS)) {
        db.createObjectStore(STORE.FRIENDS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORE.GAMES)) {
        db.createObjectStore(STORE.GAMES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORE.EVENTS)) {
        db.createObjectStore(STORE.EVENTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORE.QUEUE)) {
        db.createObjectStore(STORE.QUEUE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORE.META)) {
        db.createObjectStore(STORE.META, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Get a database connection
 */
const getDB = async (): Promise<IDBDatabase> => {
  try {
    return await initDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Store data in cache
 * @param storeName The store to use
 * @param data The data to store
 * @param expiry Optional expiry time in milliseconds
 * @param staleTime Optional stale time in milliseconds
 */
export const setCache = async <T>(
  storeName: string, 
  data: T, 
  expiry = 24 * 60 * 60 * 1000, // 24 hours default
  staleTime?: number
): Promise<T> => {
  try {
    const db = await getDB();
    const key = (data as any).id;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName, STORE.META], 'readwrite');
      const store = transaction.objectStore(storeName);
      const metaStore = transaction.objectStore(STORE.META);
      
      // Store the data
      const request = store.put(data);
      
      // Store metadata about the cached item
      const metaRequest = metaStore.put({
        key: `${storeName}:${key}`,
        timestamp: Date.now(),
        expiry,
        staleTime
      });
      
      transaction.oncomplete = () => {
        resolve(data);
      };
      
      transaction.onerror = (event) => {
        console.error('Cache transaction error:', event);
        reject(new Error('Failed to store data in cache'));
      };
    });
  } catch (error) {
    console.error('Cache set error:', error);
    throw error;
  }
};

/**
 * Get data from cache
 * @param storeName The store to use
 * @param id The record ID to retrieve
 * @returns The cached data or null if not found
 */
export const getCache = async <T>(storeName: string, id: string): Promise<{ data: T | null, isStale: boolean }> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName, STORE.META], 'readonly');
      const store = transaction.objectStore(storeName);
      const metaStore = transaction.objectStore(STORE.META);
      
      // Get the data
      const request = store.get(id);
      
      // Get metadata about the cached item
      const metaRequest = metaStore.get(`${storeName}:${id}`);
      
      let data: T | null = null;
      let meta: CacheMeta | null = null;
      
      request.onsuccess = (event) => {
        data = (event.target as IDBRequest).result;
      };
      
      metaRequest.onsuccess = (event) => {
        meta = (event.target as IDBRequest).result;
      };
      
      transaction.oncomplete = () => {
        if (!data || !meta) {
          resolve({ data: null, isStale: false });
          return;
        }
        
        const now = Date.now();
        const expired = meta.timestamp + meta.expiry < now;
        
        if (expired) {
          // If expired, remove from cache
          removeCache(storeName, id).catch(console.error);
          resolve({ data: null, isStale: false });
          return;
        }
        
        // Check if data is stale (needs refreshing but still usable)
        const isStale = meta.staleTime ? meta.timestamp + meta.staleTime < now : false;
        
        resolve({ data, isStale });
      };
      
      transaction.onerror = (event) => {
        console.error('Cache transaction error:', event);
        reject(new Error('Failed to get data from cache'));
      };
    });
  } catch (error) {
    console.error('Cache get error:', error);
    throw error;
  }
};

/**
 * Remove data from cache
 * @param storeName The store to use
 * @param id The record ID to remove
 */
export const removeCache = async (storeName: string, id: string): Promise<void> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName, STORE.META], 'readwrite');
      const store = transaction.objectStore(storeName);
      const metaStore = transaction.objectStore(STORE.META);
      
      // Remove the data
      store.delete(id);
      
      // Remove metadata
      metaStore.delete(`${storeName}:${id}`);
      
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error('Cache transaction error:', event);
        reject(new Error('Failed to remove data from cache'));
      };
    });
  } catch (error) {
    console.error('Cache remove error:', error);
    throw error;
  }
};

/**
 * Clear all data from a store
 * @param storeName The store to clear
 */
export const clearCache = async (storeName: string): Promise<void> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName, STORE.META], 'readwrite');
      const store = transaction.objectStore(storeName);
      const metaStore = transaction.objectStore(STORE.META);
      
      // Clear all data from the store
      store.clear();
      
      // Get all metadata entries
      const metaRequest = metaStore.openCursor();
      
      metaRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          const key = cursor.value.key;
          
          // If the metadata entry is for this store, delete it
          if (key.startsWith(`${storeName}:`)) {
            metaStore.delete(key);
          }
          
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error('Cache transaction error:', event);
        reject(new Error('Failed to clear cache'));
      };
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    throw error;
  }
};

/**
 * Query cached data based on a predicate function
 * @param storeName The store to query
 * @param predicate A function that returns true for items to include
 * @returns An array of matching items
 */
export const queryCacheByPredicate = async <T>(
  storeName: string,
  predicate: (item: T) => boolean
): Promise<T[]> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();
      
      const results: T[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          const item = cursor.value as T;
          
          if (predicate(item)) {
            results.push(item);
          }
          
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => {
        resolve(results);
      };
      
      transaction.onerror = (event) => {
        console.error('Cache transaction error:', event);
        reject(new Error('Failed to query cache'));
      };
    });
  } catch (error) {
    console.error('Cache query error:', error);
    throw error;
  }
};

/**
 * Add an operation to the offline queue
 * @param operation The operation to queue
 */
export const addToOfflineQueue = async (
  endpoint: string,
  method: string,
  body?: any,
  headers?: Record<string, string>
): Promise<QueuedOperation> => {
  try {
    const db = await getDB();
    
    const operation: QueuedOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      endpoint,
      method,
      body,
      headers,
      attempts: 0
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE.QUEUE, 'readwrite');
      const store = transaction.objectStore(STORE.QUEUE);
      
      const request = store.add(operation);
      
      transaction.oncomplete = () => {
        resolve(operation);
      };
      
      transaction.onerror = (event) => {
        console.error('Queue transaction error:', event);
        reject(new Error('Failed to add operation to queue'));
      };
    });
  } catch (error) {
    console.error('Queue add error:', error);
    throw error;
  }
};

/**
 * Get all operations in the offline queue
 */
export const getOfflineQueue = async (): Promise<QueuedOperation[]> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE.QUEUE, 'readonly');
      const store = transaction.objectStore(STORE.QUEUE);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const operations = (event.target as IDBRequest).result as QueuedOperation[];
        resolve(operations);
      };
      
      transaction.onerror = (event) => {
        console.error('Queue transaction error:', event);
        reject(new Error('Failed to get offline queue'));
      };
    });
  } catch (error) {
    console.error('Queue get error:', error);
    throw error;
  }
};

/**
 * Remove an operation from the offline queue
 * @param id The operation ID to remove
 */
export const removeFromOfflineQueue = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE.QUEUE, 'readwrite');
      const store = transaction.objectStore(STORE.QUEUE);
      
      const request = store.delete(id);
      
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error('Queue transaction error:', event);
        reject(new Error('Failed to remove operation from queue'));
      };
    });
  } catch (error) {
    console.error('Queue remove error:', error);
    throw error;
  }
};

/**
 * Update an operation in the offline queue
 * @param operation The operation to update
 */
export const updateOfflineQueueItem = async (operation: QueuedOperation): Promise<void> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE.QUEUE, 'readwrite');
      const store = transaction.objectStore(STORE.QUEUE);
      
      const request = store.put(operation);
      
      transaction.oncomplete = () => {
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error('Queue transaction error:', event);
        reject(new Error('Failed to update operation in queue'));
      };
    });
  } catch (error) {
    console.error('Queue update error:', error);
    throw error;
  }
};

// Initialize database when this module is imported
initDatabase().catch(console.error);

export default {
  setCache,
  getCache,
  removeCache,
  clearCache,
  queryCacheByPredicate,
  addToOfflineQueue,
  getOfflineQueue,
  removeFromOfflineQueue,
  updateOfflineQueueItem,
  STORE
}; 