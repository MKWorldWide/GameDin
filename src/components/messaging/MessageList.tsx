<<<<<<< HEAD
import { Box } from '@mui/material';
import { IMessage, IUser } from '../../types/social';
import MessageBubble from '../chat/MessageBubble';
=======
import React, { useMemo, useCallback } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Virtualizer } from '@tanstack/react-virtual';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { IMessage, IUser } from '../../types/social';
import { MessageBubble } from '../chat/MessageBubble';
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9

interface MessageListProps {
  messages: IMessage[];
  currentUser: IUser;
<<<<<<< HEAD
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.author.id === currentUser.id}
        />
      ))}
    </Box>
  );
}
=======
  virtualizer: Virtualizer<HTMLDivElement, Element>;
}

interface MessageGroup {
  date: Date;
  messages: IMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  virtualizer
}) => {
  const darkMode = useStore((state) => state.darkMode);

  // Group messages by date
  const messageGroups = useMemo(() => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);

      if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
      } else {
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  // Format date for message groups
  const formatGroupDate = useCallback((date: Date): string => {
    if (isToday(date)) {
      return 'Today';
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  }, []);

  // Check if messages are consecutive from same user
  const isConsecutive = useCallback((message: IMessage, prevMessage?: IMessage): boolean => {
    if (!prevMessage) return false;
    
    return (
      message.author.id === prevMessage.author.id &&
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 120000 // 2 minutes
    );
  }, []);

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      className={`
        relative min-h-0 px-4
        ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
      `}
      style={{
        height: virtualizer.getTotalSize()
      }}
      role="log"
      aria-live="polite"
      aria-label="Message history"
    >
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          transform: `translateY(${virtualRows[0]?.start ?? 0}px)`
        }}
      >
        <AnimatePresence initial={false}>
          {messageGroups.map((group, groupIndex) => (
            <div key={group.date.toISOString()} className="mb-6">
              <div
                className={`
                  sticky top-0 z-10 flex justify-center mb-4
                  ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
                `}
              >
                <span
                  className={`
                    px-3 py-1 text-xs rounded-full
                    ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'}
                  `}
                  role="separator"
                  aria-label={formatGroupDate(group.date)}
                >
                  {formatGroupDate(group.date)}
                </span>
              </div>

              {group.messages.map((message, messageIndex) => {
                const prevMessage = group.messages[messageIndex - 1];
                const isConsecutiveMessage = isConsecutive(message, prevMessage);
                const virtualRow = virtualRows.find(
                  (row) => row.index === messageGroups.reduce((acc, g, i) => (
                    i < groupIndex ? acc + g.messages.length : acc
                  ), 0) + messageIndex
                );

                if (!virtualRow) return null;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      ${isConsecutiveMessage ? 'mt-1' : 'mt-4'}
                      ${message.author.id === currentUser.id ? 'flex justify-end' : 'flex justify-start'}
                    `}
                    data-message-id={message.id}
                    role="article"
                    aria-label={`Message from ${message.author.name}`}
                  >
                    <MessageBubble
                      message={message}
                      isOwn={message.author.id === currentUser.id}
                      showAvatar={!isConsecutiveMessage}
                      isFirst={messageIndex === 0}
                      isLast={messageIndex === group.messages.length - 1}
                    />
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

MessageList.displayName = 'MessageList'; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
