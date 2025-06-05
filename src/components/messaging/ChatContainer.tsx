import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStore } from '../../store/useStore';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { IMessage, IMessageInput, IConversation, IUser } from '../../types/social';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { ChatSidebar } from './ChatSidebar';
import { GroupChatDialog } from './GroupChatDialog';

interface ChatContainerProps {
  conversation: IConversation;
  currentUser: IUser;
  messages: IMessage[];
  loading?: boolean;
  hasMore?: boolean;
  onSendMessage: (message: IMessageInput) => Promise<void>;
  onLoadMoreMessages?: () => Promise<void>;
  onViewProfile?: (userId: string) => void;
  onLeaveGroup?: () => void;
  onEditGroup?: () => void;
  onMuteConversation?: () => void;
  onBlockUser?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  conversation,
  currentUser,
  messages,
  loading = false,
  hasMore = false,
  onSendMessage,
  onLoadMoreMessages,
  onViewProfile,
  onLeaveGroup,
  onEditGroup,
  onMuteConversation,
  onBlockUser
}) => {
  const darkMode = useStore((state) => state.darkMode);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isEditingGroup, setIsEditingGroup] = useState(false);

  // Set up virtualization
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Handle infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: () => {
      if (hasMore && !loading && onLoadMoreMessages) {
        onLoadMoreMessages();
      }
    },
    enabled: hasMore && !loading,
  });

  // Handle scroll position and auto-scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    const isNear = scrollBottom < 100;

    setIsNearBottom(isNear);
    setShouldAutoScroll(isNear);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Handle typing indicators
  const handleTyping = useCallback((isTyping: boolean) => {
    if (isTyping) {
      setTypingUsers(prev => new Set(prev).add(currentUser.id));
      // Clear typing indicator after 3 seconds of inactivity
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentUser.id);
          return newSet;
        });
      }, 3000);
    }
  }, [currentUser.id]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleEditGroup = useCallback(() => {
    setIsEditingGroup(true);
  }, []);

  const handleCloseEditGroup = useCallback(() => {
    setIsEditingGroup(false);
  }, []);

  const handleUpdateGroup = useCallback(async (name: string, participants: string[]) => {
    if (onEditGroup) {
      await onEditGroup();
      setIsEditingGroup(false);
    }
  }, [onEditGroup]);

  return (
    <div className={`
      flex h-full overflow-hidden
      ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
    `}>
      <div className="flex flex-col flex-grow min-w-0">
        <ChatHeader
          conversation={conversation}
          currentUser={currentUser}
          onViewProfile={onViewProfile}
          onLeaveGroup={onLeaveGroup}
          onEditGroup={onEditGroup}
          onMuteConversation={onMuteConversation}
          onBlockUser={onBlockUser}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <div
          ref={containerRef}
          className="flex-grow overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="Message history"
        >
          {hasMore && (
            <div ref={loadMoreRef} className="h-8 flex items-center justify-center">
              {loading && <span>Loading more messages...</span>}
            </div>
          )}

          <MessageList
            messages={messages}
            currentUser={currentUser}
            virtualizer={virtualizer}
          />

          {typingUsers.size > 0 && (
            <div
              className={`
                px-4 py-2 text-sm
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}
              aria-live="polite"
            >
              {Array.from(typingUsers).map(userId => {
                const user = conversation.participants.find(p => p.user.id === userId)?.user;
                return user?.name || user?.username;
              }).join(', ')}
              {' is typing...'}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <MessageInput
          onSubmit={onSendMessage}
          onTyping={handleTyping}
          disabled={loading}
          conversationId={conversation.id}
        />

        {!isNearBottom && (
          <button
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
              setShouldAutoScroll(true);
            }}
            className={`
              fixed bottom-20 right-8 p-2 rounded-full shadow-lg
              ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            `}
            aria-label="Scroll to latest messages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {isSidebarOpen && (
        <ChatSidebar
          conversation={conversation}
          messages={messages}
          currentUser={currentUser}
          onViewProfile={onViewProfile}
        />
      )}

      {isEditingGroup && conversation.type === 'GROUP' && (
        <GroupChatDialog
          open={isEditingGroup}
          onClose={handleCloseEditGroup}
          onCreateGroup={handleUpdateGroup}
          availableUsers={[]}
          existingGroup={conversation}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

ChatContainer.displayName = 'ChatContainer'; 