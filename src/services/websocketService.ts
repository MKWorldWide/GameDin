/**
 * WebSocketService
 * 
 * A service for managing real-time WebSocket connections with AWS AppSync.
 * Includes connection management, reconnection logic, and message handling.
 */

// Event types for the WebSocket connection
export enum WebSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message', 
  ERROR = 'error',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt'
}

// Message types for the chat application
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  TYPING = 'typing'
}

// Basic message interface
export interface WebSocketMessage {
  id?: string;
  type: MessageType;
  content: string;
  senderId: string;
  receiverId?: string;
  conversationId?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

// Queue item for offline message management
interface QueueItem {
  message: WebSocketMessage;
  retries: number;
  timestamp: number;
}

// WebSocket service configuration
interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

// Default configuration values
const DEFAULT_CONFIG: Partial<WebSocketConfig> = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  debug: false
};

/**
 * WebSocket service for handling real-time messaging
 */
class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: QueueItem[] = [];
  private eventListeners: Map<WebSocketEvent, Function[]> = new Map();
  private isConnecting = false;
  private isAuthenticated = false;

  /**
   * Create a new WebSocket service
   * @param config - Configuration for the WebSocket service
   */
  constructor(config: WebSocketConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeEventListeners();

    // Initialize offline message queue from IndexedDB if available
    this.initMessageQueue();
  }

  /**
   * Initialize the WebSocket connection
   */
  public connect(authToken?: string): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.log('WebSocket is already connected or connecting');
      return Promise.resolve();
    }

    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        // Add authentication token to connection URL if provided
        const connectionUrl = authToken 
          ? `${this.config.url}?token=${encodeURIComponent(authToken)}`
          : this.config.url;
          
        this.ws = new WebSocket(connectionUrl);
        
        // Set up connection event handlers
        this.ws.onopen = () => {
          this.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emitEvent(WebSocketEvent.CONNECT);
          this.processQueue(); // Process any queued messages
          resolve();
        };
        
        this.ws.onclose = (event) => {
          this.log(`WebSocket disconnected: ${event.code} - ${event.reason}`);
          this.isConnecting = false;
          this.emitEvent(WebSocketEvent.DISCONNECT, event);
          
          if (!event.wasClean) {
            this.attemptReconnect();
          }
        };
        
        this.ws.onerror = (error) => {
          this.log('WebSocket error', error);
          this.isConnecting = false;
          this.emitEvent(WebSocketEvent.ERROR, error);
          reject(error);
        };
        
        this.ws.onmessage = (event) => {
          this.handleIncomingMessage(event);
        };
      } catch (error) {
        this.log('Error connecting to WebSocket', error);
        this.isConnecting = false;
        this.emitEvent(WebSocketEvent.ERROR, error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect the WebSocket
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message through the WebSocket
   * @param message - The message to send
   * @returns Promise that resolves when the message is sent or queued
   */
  public sendMessage(message: WebSocketMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!message.id) {
        message.id = this.generateId();
      }
      
      if (!message.timestamp) {
        message.timestamp = Date.now();
      }
      
      // If WebSocket is open, send the message
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message));
          resolve();
        } catch (error) {
          this.queueMessage(message);
          reject(error);
        }
      } else {
        // Queue the message for later sending
        this.queueMessage(message);
        resolve(); // Resolve as the message was queued successfully
      }
    });
  }

  /**
   * Add an event listener for WebSocket events
   * @param event - The event type to listen for
   * @param callback - The callback function to execute
   */
  public on(event: WebSocketEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove an event listener
   * @param event - The event type
   * @param callback - The callback function to remove
   */
  public off(event: WebSocketEvent, callback: Function): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Check if the WebSocket is currently connected
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get the connection state
   */
  public getState(): number {
    return this.ws ? this.ws.readyState : -1;
  }

  /**
   * Initialize event listener collections
   */
  private initializeEventListeners(): void {
    Object.values(WebSocketEvent).forEach(event => {
      this.eventListeners.set(event as WebSocketEvent, []);
    });
  }

  /**
   * Initialize the message queue from IndexedDB if available
   */
  private async initMessageQueue(): Promise<void> {
    // In a real implementation, this would restore queued messages from IndexedDB
    this.messageQueue = [];
  }

  /**
   * Emit an event to all registered listeners
   * @param event - The event type to emit
   * @param data - The data to pass to listeners
   */
  private emitEvent(event: WebSocketEvent, data?: any): void {
    if (!this.eventListeners.has(event)) return;
    
    this.eventListeners.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this.log(`Error in ${event} event handler`, error);
      }
    });
  }

  /**
   * Handle an incoming WebSocket message
   * @param event - The WebSocket message event
   */
  private handleIncomingMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.emitEvent(WebSocketEvent.MESSAGE, data);
    } catch (error) {
      this.log('Error handling incoming message', error);
      this.emitEvent(WebSocketEvent.ERROR, error);
    }
  }

  /**
   * Attempt to reconnect the WebSocket
   */
  private attemptReconnect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }
    
    if (this.config.maxReconnectAttempts && this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Maximum reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    
    this.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts || 'infinite'})`);
    this.emitEvent(WebSocketEvent.RECONNECT_ATTEMPT, this.reconnectAttempts);
    
    // Set up reconnect timer
    this.reconnectTimer = setTimeout(() => {
      this.connect()
        .then(() => {
          this.emitEvent(WebSocketEvent.RECONNECT);
        })
        .catch((error) => {
          this.log('Reconnect failed', error);
          this.attemptReconnect();
        });
    }, this.config.reconnectInterval);
  }

  /**
   * Queue a message for later sending
   * @param message - The message to queue
   */
  private queueMessage(message: WebSocketMessage): void {
    const queueItem: QueueItem = {
      message,
      retries: 0,
      timestamp: Date.now()
    };
    
    this.messageQueue.push(queueItem);
    this.saveQueueToStorage();
  }

  /**
   * Process the message queue and send pending messages
   */
  private processQueue(): void {
    if (!this.isConnected() || this.messageQueue.length === 0) {
      return;
    }
    
    // Create a copy of the queue to avoid issues with mutation during iteration
    const queueCopy = [...this.messageQueue];
    this.messageQueue = [];
    
    queueCopy.forEach(item => {
      this.sendMessage(item.message).catch(() => {
        // If sending fails, re-queue the message if it hasn't exceeded retry limits
        if (item.retries < 3) {
          item.retries++;
          this.messageQueue.push(item);
        }
      });
    });
    
    this.saveQueueToStorage();
  }

  /**
   * Save the message queue to persistent storage (IndexedDB in a real implementation)
   */
  private saveQueueToStorage(): void {
    // In a real implementation, this would save the queue to IndexedDB
    // For now, it just logs the queue size
    this.log(`Message queue size: ${this.messageQueue.length}`);
  }

  /**
   * Generate a unique ID for messages
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Log debug information if debug mode is enabled
   * @param message - The message to log
   * @param data - Additional data to log
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[WebSocketService] ${message}`, data || '');
    }
  }
}

// Create singleton instance for the application
let websocketService: WebSocketService | null = null;

/**
 * Initialize the WebSocket service with configuration
 * @param config - The WebSocket configuration
 */
export const initializeWebSocket = (config: WebSocketConfig): WebSocketService => {
  if (!websocketService) {
    websocketService = new WebSocketService(config);
  }
  return websocketService;
};

/**
 * Get the WebSocket service instance
 * @throws Error if the service is not initialized
 */
export const getWebSocketService = (): WebSocketService => {
  if (!websocketService) {
    throw new Error('WebSocket service not initialized. Call initializeWebSocket first.');
  }
  return websocketService;
};

export default WebSocketService; 