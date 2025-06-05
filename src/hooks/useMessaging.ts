/**
 * Messaging Hook
 * 
 * This hook provides a clean interface for messaging operations,
 * abstracting the underlying implementation details.
 * It uses the messaging slice of the store for state management
 * and the WebSocket service for real-time communication.
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useMessagingStore } from '../store/store';
import { useUser } from './useUser';
import { IConversation, IMessage, IMessageInput, ITypingIndicator } from '../types/social';
import { 
  getWebSocketService, 
  initializeWebSocket, 
  WebSocketEvent, 
  MessageType, 
  WebSocketMessage 
} from '../services/websocketService';
import { API_URL } from '../config';

/**
 * Interface for the messaging hook
 */
interface UseMessagingReturn {
  // State
  conversations: IConversation[];
  activeConversation: IConversation | null;
  messages: IMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  typingUsers: string[];
  error: string | null;
  socketConnected: boolean;
  
  // Actions
  setActiveConversation: (conversationId: string | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (limit?: number) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  createConversation: (participantIds: string[], title?: string) => Promise<IConversation>;
  leaveConversation: () => Promise<void>;
  reconnectWebSocket: () => Promise<void>;
}

/**
 * Custom hook for messaging operations with WebSocket integration
 */
export const useMessaging = (): UseMessagingReturn => {
  const {
    conversations,
    activeConversationId,
    messages: allMessages,
    messagesPagination,
    typingIndicators,
    isLoadingConversations,
    isLoadingMessages,
    error,
    setActiveConversation: setActiveConversationId,
    fetchConversations,
    fetchMessages,
    addMessage,
    updateTypingIndicator,
    sendMessage: storeSendMessage,
    markAsRead: storeMarkAsRead,
    sendTypingIndicator: storeSendTypingIndicator,
    createConversation: storeCreateConversation,
    leaveConversation: storeLeaveConversation,
  } = useMessagingStore();

  const { user, getAuthToken } = useUser();
  const [socketConnected, setSocketConnected] = useState(false);
  const webSocketInitialized = useRef(false);

  // Derived state
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const currentMessages = activeConversationId ? allMessages[activeConversationId] || [] : [];
  const currentPagination = activeConversationId ? messagesPagination[activeConversationId] : undefined;
  const hasMoreMessages = currentPagination?.hasMore || false;
  
  // Get typing users for the active conversation
  const typingUsers = typingIndicators
    .filter(indicator => indicator.conversationId === activeConversationId && indicator.isTyping)
    .map(indicator => indicator.userId);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user || webSocketInitialized.current) return;

    const initializeWebSocketConnection = async () => {
      try {
        // Get auth token for WebSocket connection
        const token = await getAuthToken();
        
        // Initialize WebSocket with API URL
        const wsUrl = API_URL.replace(/^http/, 'ws') + '/chat';
        initializeWebSocket({ 
          url: wsUrl,
          debug: process.env.NODE_ENV === 'development'
        });
        
        const ws = getWebSocketService();
        
        // Set up event listeners
        ws.on(WebSocketEvent.CONNECT, () => {
          console.log('WebSocket connected');
          setSocketConnected(true);
        });
        
        ws.on(WebSocketEvent.DISCONNECT, () => {
          console.log('WebSocket disconnected');
          setSocketConnected(false);
        });
        
        ws.on(WebSocketEvent.ERROR, (error) => {
          console.error('WebSocket error:', error);
          setSocketConnected(false);
        });
        
        ws.on(WebSocketEvent.MESSAGE, handleWebSocketMessage);
        
        // Connect with auth token
        await ws.connect(token);
        webSocketInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    initializeWebSocketConnection();

    // Cleanup function
    return () => {
      if (webSocketInitialized.current) {
        try {
          const ws = getWebSocketService();
          ws.disconnect();
          webSocketInitialized.current = false;
          setSocketConnected(false);
        } catch (error) {
          console.error('Error disconnecting WebSocket:', error);
        }
      }
    };
  }, [user, getAuthToken]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    if (!data) return;
    
    switch (data.type) {
      case MessageType.TEXT:
      case MessageType.IMAGE:
      case MessageType.FILE:
        if (data.conversationId) {
          // Convert WebSocket message to IMessage format
          const newMessage: IMessage = {
            id: data.id || '',
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            createdAt: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
            readBy: [],
            attachments: data.metadata?.attachments || [],
          };
          
          // Add message to store
          addMessage(data.conversationId, newMessage);
        }
        break;
        
      case MessageType.TYPING:
        if (data.conversationId) {
          // Update typing indicators
          updateTypingIndicator({
            conversationId: data.conversationId,
            userId: data.senderId,
            isTyping: data.content === 'true',
            timestamp: data.timestamp || Date.now()
          });
        }
        break;
        
      default:
        console.log('Unhandled WebSocket message type:', data.type);
    }
  }, [addMessage, updateTypingIndicator]);

  // Reconnect WebSocket if user changes
  useEffect(() => {
    if (user && webSocketInitialized.current) {
      const reconnect = async () => {
        try {
          const ws = getWebSocketService();
          const token = await getAuthToken();
          await ws.connect(token);
        } catch (error) {
          console.error('Failed to reconnect WebSocket:', error);
        }
      };
      
      reconnect();
    }
  }, [user, getAuthToken]);

  // Load conversations on mount
  useEffect(() => {
    if (conversations.length === 0 && !isLoadingConversations) {
      fetchConversations().catch(console.error);
    }
  }, [conversations.length, fetchConversations, isLoadingConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId && (!allMessages[activeConversationId] || allMessages[activeConversationId].length === 0)) {
      fetchMessages(activeConversationId).catch(console.error);
    }
  }, [activeConversationId, allMessages, fetchMessages]);

  // Wrapper functions
  const loadConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  const loadMessages = useCallback(async (limit = 20) => {
    if (!activeConversationId) return;
    await fetchMessages(activeConversationId, limit);
  }, [activeConversationId, fetchMessages]);

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || !hasMoreMessages) return;
    const nextToken = currentPagination?.nextToken;
    await fetchMessages(activeConversationId, 20, nextToken);
  }, [activeConversationId, currentPagination?.nextToken, fetchMessages, hasMoreMessages]);

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!activeConversationId || !content.trim() || !user) return;
    
    const messageInput: IMessageInput = {
      content: content.trim(),
      recipientId: activeConversationId,
      attachments
    };
    
    // First, send via WebSocket for real-time delivery
    if (socketConnected && webSocketInitialized.current) {
      try {
        const ws = getWebSocketService();
        await ws.sendMessage({
          type: MessageType.TEXT,
          content: content.trim(),
          senderId: user.id,
          conversationId: activeConversationId,
          metadata: attachments ? { attachments } : undefined
        });
      } catch (error) {
        console.error('Failed to send message via WebSocket:', error);
      }
    }
    
    // Also send through API for persistence (in case WebSocket fails)
    await storeSendMessage(messageInput);
  }, [activeConversationId, storeSendMessage, socketConnected, user]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!activeConversationId) return;
    await storeMarkAsRead(activeConversationId, messageId);
  }, [activeConversationId, storeMarkAsRead]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!activeConversationId || !user) return;
    
    // Send typing indicator via WebSocket
    if (socketConnected && webSocketInitialized.current) {
      try {
        const ws = getWebSocketService();
        ws.sendMessage({
          type: MessageType.TYPING,
          content: isTyping.toString(),
          senderId: user.id,
          conversationId: activeConversationId
        }).catch(console.error);
      } catch (error) {
        console.error('Failed to send typing indicator via WebSocket:', error);
      }
    }
    
    // Also update typing indicator in the store
    storeSendTypingIndicator(activeConversationId, isTyping);
  }, [activeConversationId, storeSendTypingIndicator, socketConnected, user]);

  const createConversation = useCallback(async (participantIds: string[], title?: string) => {
    return await storeCreateConversation(participantIds, title);
  }, [storeCreateConversation]);

  const leaveConversation = useCallback(async () => {
    if (!activeConversationId) return;
    await storeLeaveConversation(activeConversationId);
  }, [activeConversationId, storeLeaveConversation]);

  const reconnectWebSocket = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = await getAuthToken();
      const ws = getWebSocketService();
      await ws.disconnect();
      await ws.connect(token);
    } catch (error) {
      console.error('Failed to reconnect WebSocket:', error);
    }
  }, [user, getAuthToken]);

  return {
    conversations,
    activeConversation,
    messages: currentMessages,
    isLoadingConversations,
    isLoadingMessages,
    hasMoreMessages,
    typingUsers,
    error,
    socketConnected,
    setActiveConversation: setActiveConversationId,
    loadConversations,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    sendTypingIndicator,
    createConversation,
    leaveConversation,
    reconnectWebSocket,
  };
}; 