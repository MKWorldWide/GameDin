/**
 * Messaging Store Slice
 * 
 * This module provides a domain-specific store for messaging and real-time chat functionality.
 * It handles conversations, messages, typing indicators, and WebSocket connections.
 */

import { StateCreator } from 'zustand';
import { 
  IConversation, 
  IMessage, 
  IMessageInput, 
  ITypingIndicator,
  IPaginatedResponse
} from '../../types/social';

/**
 * Messaging state and actions interface
 */
export interface MessagingSlice {
  // State
  conversations: IConversation[];
  activeConversationId: string | null;
  messages: Record<string, IMessage[]>;
  messagesPagination: Record<string, { nextToken?: string; hasMore: boolean }>;
  typingIndicators: ITypingIndicator[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  
  // Actions
  setConversations: (conversations: IConversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: IMessage[]) => void;
  addMessages: (conversationId: string, messages: IMessage[]) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<IMessage>) => void;
  setMessagesPagination: (conversationId: string, pagination: { nextToken?: string; hasMore: boolean }) => void;
  setTypingIndicator: (indicator: ITypingIndicator) => void;
  setIsLoadingConversations: (isLoading: boolean) => void;
  setIsLoadingMessages: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Messaging operations
  fetchConversations: () => Promise<IConversation[]>;
  fetchMessages: (conversationId: string, limit?: number, nextToken?: string) => Promise<IPaginatedResponse<IMessage>>;
  sendMessage: (message: IMessageInput) => Promise<IMessage>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => Promise<void>;
  createConversation: (participantIds: string[], title?: string) => Promise<IConversation>;
  leaveConversation: (conversationId: string) => Promise<void>;
}

/**
 * Creates the messaging slice for the Zustand store
 */
export const createMessagingSlice: StateCreator<MessagingSlice> = (set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: null,
  messages: {},
  messagesPagination: {},
  typingIndicators: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,
  
  // State setters
  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
  
  setMessages: (conversationId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: messages
    }
  })),
  
  addMessages: (conversationId, newMessages) => set((state) => {
    // Get existing messages for this conversation
    const existingMessages = state.messages[conversationId] || [];
    
    // Create a map of existing message IDs for quick lookup
    const existingMessageIds = new Set(existingMessages.map(msg => msg.id));
    
    // Filter out duplicates and combine with existing messages
    const uniqueNewMessages = newMessages.filter(msg => !existingMessageIds.has(msg.id));
    const combinedMessages = [...existingMessages, ...uniqueNewMessages];
    
    // Sort messages by creation date
    const sortedMessages = combinedMessages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    return {
      messages: {
        ...state.messages,
        [conversationId]: sortedMessages
      }
    };
  }),
  
  updateMessage: (conversationId, messageId, updates) => set((state) => {
    // Get existing messages for this conversation
    const existingMessages = state.messages[conversationId] || [];
    
    // Find and update the specific message
    const updatedMessages = existingMessages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    
    return {
      messages: {
        ...state.messages,
        [conversationId]: updatedMessages
      }
    };
  }),
  
  setMessagesPagination: (conversationId, pagination) => set((state) => ({
    messagesPagination: {
      ...state.messagesPagination,
      [conversationId]: pagination
    }
  })),
  
  setTypingIndicator: (indicator) => set((state) => {
    // Remove any existing indicator for this user in this conversation
    const filteredIndicators = state.typingIndicators.filter(
      ind => !(ind.conversationId === indicator.conversationId && ind.userId === indicator.userId)
    );
    
    // Add the new indicator if the user is typing
    const newIndicators = indicator.isTyping 
      ? [...filteredIndicators, indicator]
      : filteredIndicators;
    
    return { typingIndicators: newIndicators };
  }),
  
  setIsLoadingConversations: (isLoading) => set({ 
    isLoadingConversations: isLoading,
    error: isLoading ? null : get().error
  }),
  
  setIsLoadingMessages: (isLoading) => set({ 
    isLoadingMessages: isLoading,
    error: isLoading ? null : get().error
  }),
  
  setError: (error) => set({ error }),
  
  // Messaging operations
  fetchConversations: async () => {
    const { setIsLoadingConversations, setError, setConversations } = get();
    try {
      setIsLoadingConversations(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await API.graphql(graphqlOperation(listConversations));
      // const conversations = response.data.listConversations.items;
      
      // Mock implementation for now
      const conversations: IConversation[] = [];
      
      setConversations(conversations);
      return conversations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoadingConversations(false);
    }
  },
  
  fetchMessages: async (conversationId, limit = 20, nextToken) => {
    const { setIsLoadingMessages, setError, setMessages, setMessagesPagination } = get();
    try {
      setIsLoadingMessages(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await API.graphql(graphqlOperation(listMessages, {
      //   conversationId,
      //   limit,
      //   nextToken
      // }));
      // const result = response.data.listMessages;
      
      // Mock implementation for now
      const result: IPaginatedResponse<IMessage> = {
        items: [],
        nextToken: undefined,
        hasMore: false
      };
      
      setMessages(conversationId, result.items);
      setMessagesPagination(conversationId, {
        nextToken: result.nextToken,
        hasMore: result.hasMore
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoadingMessages(false);
    }
  },
  
  sendMessage: async (messageInput) => {
    const { setError, addMessages } = get();
    try {
      setError(null);
      
      // Create a temporary message with 'sending' status
      const tempMessage: IMessage = {
        id: `temp-${Date.now()}`,
        conversationId: messageInput.recipientId,
        content: messageInput.content,
        type: 'text',
        author: { id: 'current-user-id' } as any, // Will be replaced with actual user
        status: 'sending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add the temporary message to the UI
      addMessages(messageInput.recipientId, [tempMessage]);
      
      // TODO: Replace with actual API call
      // const response = await API.graphql(graphqlOperation(createMessage, {
      //   input: messageInput
      // }));
      // const sentMessage = response.data.createMessage;
      
      // Mock implementation for now
      const sentMessage: IMessage = {
        ...tempMessage,
        id: `real-${Date.now()}`,
        status: 'sent'
      };
      
      // Update the message with the real one from the server
      addMessages(messageInput.recipientId, [sentMessage]);
      
      return sentMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      throw error;
    }
  },
  
  markAsRead: async (conversationId, messageId) => {
    const { setError, updateMessage } = get();
    try {
      setError(null);
      
      // Update the message status locally first
      updateMessage(conversationId, messageId, { status: 'read' });
      
      // TODO: Replace with actual API call
      // await API.graphql(graphqlOperation(updateMessageStatus, {
      //   messageId,
      //   status: 'read'
      // }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark message as read';
      setError(errorMessage);
      throw error;
    }
  },
  
  sendTypingIndicator: async (conversationId, isTyping) => {
    const { setError, setTypingIndicator } = get();
    try {
      setError(null);
      
      // Update typing indicator locally
      setTypingIndicator({
        conversationId,
        userId: 'current-user-id', // Will be replaced with actual user ID
        isTyping
      });
      
      // TODO: Replace with actual API call
      // await API.graphql(graphqlOperation(sendTypingIndicator, {
      //   conversationId,
      //   isTyping
      // }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send typing indicator';
      setError(errorMessage);
      // Don't throw here as this is not critical functionality
    }
  },
  
  createConversation: async (participantIds, title) => {
    const { setIsLoadingConversations, setError, setConversations } = get();
    try {
      setIsLoadingConversations(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await API.graphql(graphqlOperation(createConversation, {
      //   input: {
      //     participantIds,
      //     title
      //   }
      // }));
      // const newConversation = response.data.createConversation;
      
      // Mock implementation for now
      const newConversation: IConversation = {
        id: `conv-${Date.now()}`,
        type: participantIds.length > 1 ? 'GROUP' : 'PRIVATE',
        title: title || '',
        participants: [],
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Update conversations list
      const currentConversations = get().conversations;
      setConversations([...currentConversations, newConversation]);
      
      return newConversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoadingConversations(false);
    }
  },
  
  leaveConversation: async (conversationId) => {
    const { setIsLoadingConversations, setError, setConversations } = get();
    try {
      setIsLoadingConversations(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // await API.graphql(graphqlOperation(leaveConversation, {
      //   conversationId
      // }));
      
      // Update conversations list
      const currentConversations = get().conversations;
      const updatedConversations = currentConversations.filter(
        conv => conv.id !== conversationId
      );
      setConversations(updatedConversations);
      
      // If this was the active conversation, clear it
      if (get().activeConversationId === conversationId) {
        get().setActiveConversation(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave conversation';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoadingConversations(false);
    }
  }
}); 