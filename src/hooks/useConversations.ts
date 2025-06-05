/**
 * Conversations Hook
 * 
 * This hook provides conversation management with SWR for caching and
 * offline support. Features include:
 * 
 * 1. Fetching conversations with pagination and offline persistence
 * 2. Creating new conversations with optimistic UI updates
 * 3. Updating conversation data with real-time sync
 * 4. Automatic caching and background revalidation
 * 5. Offline support for viewing and creating conversations
 */

import { useCallback, useMemo, useState } from 'react';
import { useData, useInfiniteData, useMutation } from './useSWR';
import { STORE } from '../services/cacheService';
import { Conversation, PaginatedResponse, UserProfile } from '../types/api';
import { useAuth } from './useAuth';

// Default pagination settings
const DEFAULT_PAGE_SIZE = 20;

interface UseConversationsOptions {
  /** Include pagination for large conversation lists */
  paginated?: boolean;
  /** Number of conversations per page */
  pageSize?: number;
  /** Sort order for conversations */
  sortBy?: 'recent' | 'unread' | 'alphabetical';
  /** Stale time in milliseconds (default: 1 minute) */
  staleTime?: number;
  /** Cache time in milliseconds (default: 24 hours) */
  cacheTime?: number;
}

interface CreateConversationData {
  participantIds: string[];
  title?: string;
}

/**
 * Hook for fetching and managing conversations
 */
export const useConversations = (options: UseConversationsOptions = {}) => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  // Default options
  const {
    paginated = false,
    pageSize = DEFAULT_PAGE_SIZE,
    sortBy = 'recent',
    staleTime = 60 * 1000, // 1 minute
    cacheTime = 24 * 60 * 60 * 1000 // 24 hours
  } = options;
  
  // Build query URL with sort parameters
  const queryUrl = useMemo(() => {
    const url = new URL('/conversations', window.location.origin);
    url.searchParams.append('sort', sortBy);
    url.searchParams.append('limit', pageSize.toString());
    return url.pathname + url.search;
  }, [sortBy, pageSize]);
  
  // Fetcher for paginated conversations
  const getNextPageParam = useCallback((lastPage: PaginatedResponse<Conversation>) => {
    return lastPage.nextToken ? { nextToken: lastPage.nextToken } : null;
  }, []);
  
  // Use the appropriate SWR hook based on pagination needs
  const infiniteConversationsResult = useInfiniteData<PaginatedResponse<Conversation>>(
    paginated ? queryUrl : null,
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
      cacheTo: STORE.CONVERSATIONS,
      staleTime,
      cacheTime,
      // Don't revalidate too frequently
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      // Keep all pages when navigating between pages
      persistSize: true
    }
  );
  
  // Non-paginated conversations
  const standardConversationsResult = useData<Conversation[]>(
    !paginated ? queryUrl : null,
    {
      // Cache settings
      cacheTo: STORE.CONVERSATIONS,
      staleTime,
      cacheTime,
      // Don't revalidate too frequently
      revalidateOnFocus: false,
      dedupingInterval: 30000 // 30 seconds
    }
  );
  
  // Selected conversation details
  const {
    data: selectedConversation,
    error: selectedConversationError,
    isLoading: isLoadingSelectedConversation,
    isValidating: isValidatingSelectedConversation,
    mutate: mutateSelectedConversation
  } = useData<Conversation>(
    selectedConversationId ? `/conversations/${selectedConversationId}` : null,
    {
      cacheTo: STORE.CONVERSATIONS,
      staleTime,
      cacheTime,
      // Refresh when selected conversation changes
      revalidateOnMount: true
    }
  );
  
  // Create new conversation
  const {
    trigger: createConversation,
    isMutating: isCreatingConversation,
    error: createConversationError
  } = useMutation<Conversation>(
    '/conversations',
    {
      cacheTo: STORE.CONVERSATIONS,
      offlineMode: 'cache-first',
      onSuccess: (newConversation) => {
        // Update lists with new conversation
        if (paginated) {
          infiniteConversationsResult.mutate((data) => {
            if (!data || data.length === 0) return data;
            
            // Add to first page
            const firstPage = { ...data[0] };
            firstPage.items = [newConversation, ...firstPage.items];
            
            return [firstPage, ...data.slice(1)];
          }, { revalidate: false });
        } else {
          standardConversationsResult.mutate((conversations) => {
            if (!conversations) return [newConversation];
            return [newConversation, ...conversations];
          }, { revalidate: false });
        }
      }
    }
  );
  
  // Leave conversation
  const {
    trigger: leaveConversation,
    isMutating: isLeavingConversation,
    error: leaveConversationError
  } = useMutation<{ success: boolean }>(
    selectedConversationId ? `/conversations/${selectedConversationId}/leave` : null,
    {
      onSuccess: () => {
        // Update lists by removing the conversation
        if (paginated) {
          infiniteConversationsResult.mutate((data) => {
            if (!data) return data;
            
            return data.map(page => ({
              ...page,
              items: page.items.filter(conv => conv.id !== selectedConversationId)
            }));
          }, { revalidate: false });
        } else {
          standardConversationsResult.mutate((conversations) => {
            if (!conversations) return conversations;
            return conversations.filter(conv => conv.id !== selectedConversationId);
          }, { revalidate: false });
        }
        
        // Clear selected conversation
        setSelectedConversationId(null);
      }
    }
  );
  
  // Handle creating a new conversation
  const handleCreateConversation = useCallback(async (data: CreateConversationData) => {
    if (!user) return null;
    
    // For optimistic updates, we need to create a temporary conversation
    const tempId = `temp-${Date.now()}`;
    const optimisticData: Conversation = {
      id: tempId,
      type: data.participantIds.length > 1 ? 'group' : 'direct',
      title: data.title || '',
      participants: [
        {
          id: user.id,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName || user.username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as UserProfile,
          role: 'owner',
          joinedAt: new Date().toISOString()
        },
        ...data.participantIds.map(id => ({
          id,
          user: {
            id,
            username: 'Loading...',
            email: '',
            displayName: 'Loading...',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as UserProfile,
          role: 'member',
          joinedAt: new Date().toISOString()
        }))
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const result = await createConversation({
        method: 'POST',
        body: data,
        optimisticData
      });
      
      return result;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }, [user, createConversation]);
  
  // Derived data for UI convenience
  const conversations = useMemo(() => {
    if (paginated) {
      return infiniteConversationsResult.flatData || [];
    }
    return standardConversationsResult.data || [];
  }, [paginated, infiniteConversationsResult.flatData, standardConversationsResult.data]);
  
  // Handle selecting a conversation
  const selectConversation = useCallback((id: string | null) => {
    setSelectedConversationId(id);
  }, []);
  
  // Handle leaving a conversation
  const handleLeaveConversation = useCallback(async () => {
    if (!selectedConversationId) return false;
    
    try {
      await leaveConversation({
        method: 'POST'
      });
      return true;
    } catch (error) {
      console.error('Failed to leave conversation:', error);
      return false;
    }
  }, [selectedConversationId, leaveConversation]);
  
  // Mark conversation as read (update unread count)
  const markAsRead = useCallback(async (conversationId: string) => {
    // Find the conversation in our list
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.unreadCount === 0) return;
    
    // Optimistically update the unread count
    if (paginated) {
      infiniteConversationsResult.mutate((data) => {
        if (!data) return data;
        
        return data.map(page => ({
          ...page,
          items: page.items.map(conv => {
            if (conv.id === conversationId) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          })
        }));
      }, { revalidate: false });
    } else {
      standardConversationsResult.mutate((convs) => {
        if (!convs) return convs;
        
        return convs.map(conv => {
          if (conv.id === conversationId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        });
      }, { revalidate: false });
    }
    
    // Also update selected conversation if it's the same
    if (selectedConversationId === conversationId) {
      mutateSelectedConversation(prev => {
        if (!prev) return prev;
        return { ...prev, unreadCount: 0 };
      }, { revalidate: false });
    }
    
    // API call to mark as read
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  }, [
    conversations, 
    paginated, 
    infiniteConversationsResult, 
    standardConversationsResult, 
    selectedConversationId, 
    mutateSelectedConversation
  ]);
  
  // Status flags
  const isLoading = paginated
    ? infiniteConversationsResult.isLoading
    : standardConversationsResult.isLoading;
    
  const isValidating = paginated
    ? infiniteConversationsResult.isValidating
    : standardConversationsResult.isValidating;
    
  const error = paginated
    ? infiniteConversationsResult.error
    : standardConversationsResult.error;
    
  const isOffline = paginated
    ? infiniteConversationsResult.isOffline
    : standardConversationsResult.isOffline;
    
  const isFromCache = paginated
    ? infiniteConversationsResult.isFromCache
    : standardConversationsResult.isFromCache;
  
  // Loading next page (for infinite loading)
  const loadMore = useCallback(() => {
    if (paginated && infiniteConversationsResult.size < infiniteConversationsResult.data?.length) {
      infiniteConversationsResult.setSize(infiniteConversationsResult.size + 1);
    }
  }, [paginated, infiniteConversationsResult]);
  
  // Check if there are more pages to load
  const hasMore = useMemo(() => {
    if (!paginated || !infiniteConversationsResult.data) return false;
    
    const lastPage = infiniteConversationsResult.data[infiniteConversationsResult.data.length - 1];
    return !!lastPage?.nextToken;
  }, [paginated, infiniteConversationsResult.data]);
  
  return {
    // Data
    conversations,
    selectedConversation,
    hasMore,
    
    // Status flags
    isLoading,
    isValidating,
    error,
    isOffline,
    isFromCache,
    isLoadingSelectedConversation,
    isValidatingSelectedConversation,
    selectedConversationError,
    isCreatingConversation,
    createConversationError,
    isLeavingConversation,
    leaveConversationError,
    
    // Actions
    createConversation: handleCreateConversation,
    selectConversation,
    leaveConversation: handleLeaveConversation,
    markAsRead,
    loadMore,
    
    // Manual revalidation
    refresh: paginated 
      ? infiniteConversationsResult.mutate 
      : standardConversationsResult.mutate,
    refreshSelectedConversation: mutateSelectedConversation
  };
};

export default useConversations; 