import { useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage } from '../types/social';

const WEBSOCKET_URL = process.env.VITE_WS_URL || 'ws://localhost:3001';

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private messageHandlers = new Map<string, ((message: WebSocketMessage) => void)[]>();
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly baseReconnectDelay = 1000;

  private constructor(private url: string) {
    this.connect();
  }

  static getInstance(url: string): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(url);
    }
    return WebSocketService.instance;
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(
        this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
        30000
      );

      this.reconnectTimeout = window.setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message));
  }

  subscribe(type: WebSocketMessage['type'], handler: (message: WebSocketMessage) => void) {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);

    return () => {
      const handlers = this.messageHandlers.get(type) || [];
      this.messageHandlers.set(
        type,
        handlers.filter(h => h !== handler)
      );
    };
  }

  send(type: WebSocketMessage['type'], data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        id: crypto.randomUUID(),
        type,
        data,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

const wsService = WebSocketService.getInstance(WEBSOCKET_URL);

export function useWebSocket() {
  const isConnectedRef = useRef(wsService.isConnected());

  useEffect(() => {
    const checkConnection = () => {
      const isConnected = wsService.isConnected();
      if (isConnected !== isConnectedRef.current) {
        isConnectedRef.current = isConnected;
      }
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const subscribe = useCallback(
    (type: WebSocketMessage['type'], handler: (message: WebSocketMessage) => void) => {
      return wsService.subscribe(type, handler);
    },
    []
  );

  const send = useCallback((type: WebSocketMessage['type'], data: any) => {
    wsService.send(type, data);
  }, []);

  return {
    isConnected: isConnectedRef.current,
    subscribe,
    send,
  };
}

export { wsService };
export type { WebSocketService };

// Example usage:
/*
function ChatComponent() {
  const { subscribe, sendMessage, sendTypingIndicator } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('message', (payload) => {
      // Handle new message
      console.log('New message:', payload);
    });

    return unsubscribe;
  }, [subscribe]);

  const handleSendMessage = (content: string) => {
    sendMessage('recipientId', content);
  };

  const handleTyping = (isTyping: boolean) => {
    sendTypingIndicator('recipientId', isTyping);
  };

  return (
    // Component JSX
  );
}
*/
