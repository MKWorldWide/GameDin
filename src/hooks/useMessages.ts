/**
 * Messages Hook
 * 
 * This hook provides message management with SWR for real-time chat
 * and offline persistence. Features include:
 * 
 * 1. Infinite scrolling message history with efficient loading
 * 2. Optimistic UI updates for sending messages
 * 3. Real-time message updates via WebSocket integration
 * 4. Offline message composition and queueing
 * 5. Persistent cache for viewing messages offline
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useInfiniteData, useMutation } from './useSWR';
import { STORE } from '../services/cacheService';
import { PaginatedResponse, Message, MessageAttachment } from '../types/api';
import { useWebSocket } from './useWebSocket';
import { useAuth } from './useAuth';

// Default options
const DEFAULT_PAGE_SIZE = 20;

interface UseMessagesOptions {
  /** Page size for message pagination */
  pageSize?: number;
  /** Enable/disable real-time updates */
  realtime?: boolean;
  /** Cache time in milliseconds (default: 7 days) */
  cacheTime?: number;
}

interface SendMessageData {
  content: string;
  attachments?: MessageAttachment[];
}

/**
 * Hook for fetching and managing messages in a conversation
 */
export const useMessages = (
  conversationId: string | null,
  options: UseMessagesOptions = {}
) => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageBottomRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  // Default options
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    realtime = true,
    cacheTime = 7 * 24 * 60 * 60 * 1000 // 7 days
  } = options;
  
  // Fetch messages with SWR infinite loading
  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
    isOffline,
    isFromCache,
    flatData: messages
  } = useInfiniteData<PaginatedResponse<Message>>(
    conversationId ? `/conversations/${conversationId}/messages` : null,
    (pageIndex, previousPageData) => {
      // First page
      if (pageIndex === 0) return { limit: pageSize };
      // Reached the end
      if (!previousPageData?.nextToken) return null;
      // Next page with token
      return { limit: pageSize, nextToken: previousPageData.nextToken };
    },
    {
      // Cache settings
      cacheTo: STORE.MESSAGES,
      cacheTime,
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Refresh when component mounts or conversation changes
      revalidateOnMount: true,
      // Sort messages in reverse (newest first), then reverse for display
      compare: (a, b) => {
        if (!a || !b) return 0;
        // Compare by timestamp (descending)
        return new Date(b.items[0]?.createdAt || 0).getTime() - 
               new Date(a.items[0]?.createdAt || 0).getTime();
      }
    }
  );
  
  // Send message mutation
  const {
    trigger: sendMessage,
    isMutating: isSendingMessage,
    error: sendMessageError
  } = useMutation<Message>(
    conversationId ? `/conversations/${conversationId}/messages` : null,
    {
      cacheTo: STORE.MESSAGES,
      offlineMode: 'cache-first',
      onSuccess: (newMessage) => {
        // Update message list with the new message
        mutate((data) => {
          if (!data || data.length === 0) {
            // Create first page
            return [{
              items: [newMessage],
              nextToken: null,
              totalCount: 1
            }];
          }
          
          // Add to the first page
          const firstPage = { ...data[0] };
          firstPage.items = [newMessage, ...firstPage.items];
          if (firstPage.totalCount !== undefined) {
            firstPage.totalCount += 1;
          }
          
          return [firstPage, ...data.slice(1)];
        }, { revalidate: false });
        
        // Reset typing indicator after sending
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        
        // Scroll to the bottom when a new message is sent
        setShouldScrollToBottom(true);
      }
    }
  );
  
  // Handle sending a message
  const handleSendMessage = useCallback(async (data: SendMessageData) => {
    if (!conversationId || !user) return null;
    
    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      sender: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar
      },
      content: data.content,
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sent'
    };
    
    try {
      const result = await sendMessage({
        method: 'POST',
        body: data,
        optimisticData: optimisticMessage
      });
      
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update the optimistic message to show it failed
      mutate((data) => {
        if (!data) return data;
        
        return data.map(page => ({
          ...page,
          items: page.items.map(msg => {
            if (msg.id === tempId) {
              return {
                ...msg,
                status: 'failed'
              };
            }
            return msg;
          })
        }));
      }, { revalidate: false });
      
      return null;
    }
  }, [conversationId, user, sendMessage, mutate]);
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!conversationId || !user || !socket || !isConnected) return;
    
    // Set local typing state
    setIsTyping(true);
    
    // Send typing indicator to server via WebSocket
    socket.emit('typing', {
      conversationId,
      userId: user.id,
      isTyping: true
    });
    
    // Clear previous timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      // Send stop typing event
      if (socket && isConnected) {
        socket.emit('typing', {
          conversationId,
          userId: user.id,
          isTyping: false
        });
      }
      
      typingTimeoutRef.current = null;
    }, 3000); // Stop typing after 3 seconds of inactivity
  }, [conversationId, user, socket, isConnected]);
  
  // Handle scroll position change
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    
    // Check if user scrolled up
    const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 20;
    
    // Update auto-scroll behavior
    setShouldScrollToBottom(!isScrolledUp);
    
    // Load more messages when scrolled to top
    if (target.scrollTop < 50) {
      loadMore();
    }
  }, []);
  
  // Load more messages
  const loadMore = useCallback(() => {
    if (!isValidating && data && data.length > 0) {
      const lastPage = data[data.length - 1];
      if (lastPage.nextToken) {
        setSize(size + 1);
      }
    }
  }, [isValidating, data, size, setSize]);
  
  // Listen for real-time message updates
  useEffect(() => {
    if (!realtime || !conversationId || !socket || !isConnected) return;
    
    // Handler for new messages
    const handleNewMessage = (message: Message) => {
      // Only update if it's for our conversation
      if (message.conversationId !== conversationId) return;
      
      // Only add if we don't already have it
      mutate((data) => {
        if (!data) return data;
        
        // Check if we already have this message
        const messageExists = data.some(page => 
          page.items.some(msg => msg.id === message.id)
        );
        
        if (messageExists) return data;
        
        // Add to the first page
        const firstPage = { ...data[0] };
        firstPage.items = [message, ...firstPage.items];
        if (firstPage.totalCount !== undefined) {
          firstPage.totalCount += 1;
        }
        
        return [firstPage, ...data.slice(1)];
      }, { revalidate: false });
      
      // Auto-scroll to bottom for new messages only if already at bottom
      if (shouldScrollToBottom) {
        setTimeout(() => {
          messageBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    
    // Handler for typing indicators
    const handleTypingIndicator = (data: { 
      conversationId: string, 
      userId: string, 
      username: string,
      isTyping: boolean 
    }) => {
      if (data.conversationId !== conversationId) return;
      if (data.userId === user?.id) return; // Ignore own typing
      
      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add user to typing list if not already there
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
        } else {
          // Remove user from typing list
          return prev.filter(id => id !== data.userId);
        }
        return prev;
      });
    };
    
    // Subscribe to events
    socket.on('message', handleNewMessage);
    socket.on('typing', handleTypingIndicator);
    
    // Join conversation room
    socket.emit('join', { conversationId });
    
    return () => {
      // Unsubscribe from events
      socket.off('message', handleNewMessage);
      socket.off('typing', handleTypingIndicator);
      
      // Leave conversation room
      socket.emit('leave', { conversationId });
    };
  }, [conversationId, socket, isConnected, mutate, user, shouldScrollToBottom, realtime]);
  
  // Auto-scroll to bottom when messages are loaded
  useEffect(() => {
    if (isLoading || !shouldScrollToBottom) return;
    
    setTimeout(() => {
      messageBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [isLoading, messages, shouldScrollToBottom]);
  
  // Clean up typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // Reverse messages for display (newest at bottom)
  const displayMessages = messages ? [...messages].reverse() : [];
  
  // Check if we have reached the end of the message history
  const hasMore = useMemo(() => {
    if (!data) return false;
    
    const lastPage = data[data.length - 1];
    return !!lastPage?.nextToken;
  }, [data]);
  
  return {
    // Data
    messages: displayMessages,
    typingUsers,
    hasMore,
    
    // Status
    isLoading,
    isValidating,
    error,
    isSendingMessage,
    sendMessageError,
    isTyping,
    isOffline,
    isFromCache,
    
    // Actions
    sendMessage: handleSendMessage,
    handleTyping,
    handleScroll,
    loadMore,
    refresh: mutate,
    
    // Refs
    messageBottomRef
  };
};

export default useMessages; 