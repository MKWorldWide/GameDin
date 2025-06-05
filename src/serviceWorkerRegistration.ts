/**
 * Service Worker Registration
 * 
 * This file handles the registration of the service worker and
 * manages the lifecycle events, including updates and notifications.
 * 
 * The registration can be controlled through the config object, making it
 * easy to disable during development or enable for production builds.
 */

import { Workbox } from 'workbox-window';

// Configuration for service worker registration
interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
  onNewContentAvailable?: () => void;
}

// Service worker registration status
export enum ServiceWorkerStatus {
  UNREGISTERED = 'unregistered',
  REGISTERED = 'registered',
  UPDATED = 'updated',
  OFFLINE = 'offline',
  ONLINE = 'online',
  DISABLED = 'disabled',
  REGISTRATION_ERROR = 'registration_error',
}

// Current status of the service worker
export let serviceWorkerStatus: ServiceWorkerStatus = ServiceWorkerStatus.UNREGISTERED;

/**
 * Register the service worker for offline capabilities
 * @param config Configuration options for service worker
 */
export function register(config: Config = {}): void {
  // Only register the service worker in production and if the browser supports it
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    
    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used.
    if (publicUrl.origin !== window.location.origin) {
      console.warn('Service worker registration skipped due to origin mismatch');
      serviceWorkerStatus = ServiceWorkerStatus.DISABLED;
      return;
    }

    // Wait for the window to load before registering the service worker
    // to avoid delaying the startup performance of the app
    window.addEventListener('load', async () => {
      const swUrl = `${process.env.PUBLIC_URL}/serviceWorker.js`;
      
      try {
        // Use Workbox for better service worker management
        const wb = new Workbox(swUrl);
        
        // Listen for installation success
        wb.addEventListener('installed', (event) => {
          if (event.isUpdate) {
            // If it's an update, notify the user about the update
            serviceWorkerStatus = ServiceWorkerStatus.UPDATED;
            
            if (config.onNewContentAvailable) {
              config.onNewContentAvailable();
            }
            
            // Example of showing an update notification:
            // toast.info('New content is available! Refresh to update.', {
            //   action: {
            //     label: 'Refresh',
            //     callback: () => window.location.reload()
            //   }
            // });
          } else {
            // Initial installation
            serviceWorkerStatus = ServiceWorkerStatus.REGISTERED;
            
            if (config.onSuccess) {
              const registration = event.target as Workbox;
              config.onSuccess(registration.active as ServiceWorkerRegistration);
            }
          }
        });
        
        // Listen for waiting service worker (update available)
        wb.addEventListener('waiting', (event) => {
          // We have an update ready to be activated
          if (config.onUpdate) {
            const registration = event.target as Workbox;
            config.onUpdate(registration.active as ServiceWorkerRegistration);
          }
        });
        
        // Listen for controller change (when the updated SW takes control)
        wb.addEventListener('controlling', () => {
          // The updated service worker is now controlling the page
          // Reload the page to ensure everything is fresh
          window.location.reload();
        });
        
        // Handle errors during registration
        wb.addEventListener('error', (error) => {
          console.error('Service worker registration failed:', error);
          serviceWorkerStatus = ServiceWorkerStatus.REGISTRATION_ERROR;
        });
        
        // Register the service worker
        await wb.register();
        
        // Set up online/offline detection
        window.addEventListener('online', () => {
          serviceWorkerStatus = ServiceWorkerStatus.ONLINE;
          if (config.onOnline) {
            config.onOnline();
          }
        });
        
        window.addEventListener('offline', () => {
          serviceWorkerStatus = ServiceWorkerStatus.OFFLINE;
          if (config.onOffline) {
            config.onOffline();
          }
        });
      } catch (error) {
        console.error('Error during service worker registration:', error);
        serviceWorkerStatus = ServiceWorkerStatus.REGISTRATION_ERROR;
      }
    });
  } else {
    serviceWorkerStatus = ServiceWorkerStatus.DISABLED;
    console.info('Service worker is disabled in development mode');
  }
}

/**
 * Unregister the service worker
 */
export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        serviceWorkerStatus = ServiceWorkerStatus.UNREGISTERED;
      })
      .catch((error) => {
        console.error('Error unregistering service worker:', error);
      });
  }
}

/**
 * Check if a service worker update is available and update it
 */
export function checkForUpdates(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.update()
            .then(() => {
              console.log('Service worker update check completed');
              resolve();
            })
            .catch((error) => {
              console.error('Error checking for service worker updates:', error);
              reject(error);
            });
        })
        .catch((error) => {
          console.error('Error accessing service worker registration:', error);
          reject(error);
        });
    } else {
      resolve();
    }
  });
}

/**
 * Force an update by sending the SKIP_WAITING message to the service worker
 */
export function forceUpdate(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SKIP_WAITING'
    });
  }
}

/**
 * Get the current service worker registration
 */
export function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready;
  }
  return Promise.resolve(undefined);
} 