<<<<<<< HEAD
import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { IMessage } from '../../types/social';
=======
import React, { memo } from 'react';
import { format } from 'date-fns';
import { IMessage } from '../../types/social';
import { useStore } from '../../store/useStore';
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
}

<<<<<<< HEAD
export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        mb: 2,
      }}
    >
      <Avatar
        src={message.author.picture || message.author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${message.author.username}`}
        alt={message.author.username}
        sx={{ mr: isOwn ? 0 : 1, ml: isOwn ? 1 : 0 }}
      />
      <Box
        sx={{
          maxWidth: '70%',
          backgroundColor: isOwn ? 'primary.main' : 'grey.100',
          color: isOwn ? 'white' : 'text.primary',
          borderRadius: 2,
          p: 1.5,
          position: 'relative',
        }}
      >
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary',
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
    </Box>
  );
} 
=======
export const MessageBubble = memo<MessageBubbleProps>(({ message, isOwn }) => {
  const darkMode = useStore(state => state.darkMode);

  const renderAttachments = () => {
    if (!message.attachments?.length) return null;

    return (
      <div className="space-y-2 mt-2">
        {message.attachments.map((attachment, index) => {
          switch (attachment.type) {
            case 'image':
              return (
                <div
                  key={`${attachment.id}-${index}`}
                  className="relative rounded-lg overflow-hidden"
                >
                  <img
                    src={attachment.url}
                    alt={attachment.name || 'Shared image'}
                    className="max-w-[300px] max-h-[300px] object-contain rounded-lg"
                    loading="lazy"
                  />
                  {attachment.name && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm truncate">
                      {attachment.name}
                    </div>
                  )}
                </div>
              );
            case 'video':
              return (
                <video
                  key={`${attachment.id}-${index}`}
                  src={attachment.url}
                  controls
                  className="max-w-[300px] rounded-lg"
                  aria-label={attachment.name || 'Shared video'}
                />
              );
            case 'file':
              return (
                <a
                  key={`${attachment.id}-${index}`}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    flex items-center p-2 rounded-lg
                    ${darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'}
                  `}
                  aria-label={`Download ${attachment.name}`}
                >
                  <svg
                    className="w-6 h-6 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.name}
                    </p>
                    {attachment.size && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)}
                      </p>
                    )}
                  </div>
                </a>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div
      className={`flex items-end space-x-2 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}
      role="article"
      aria-label={`Message from ${message.author.name}`}
    >
      <img
        src={message.author.picture || message.author.avatar}
        alt={message.author.name}
        className="w-8 h-8 rounded-full flex-shrink-0"
        loading="lazy"
      />
      <div
        className={`
          max-w-[70%] break-words rounded-2xl px-4 py-2
          ${isOwn
            ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
            : darkMode
              ? 'bg-gray-700 text-white'
              : 'bg-gray-100 text-gray-900'
          }
        `}
      >
        {!isOwn && (
          <div className="text-sm font-medium mb-1" role="presentation">
            {message.author.name}
          </div>
        )}
        <div className="space-y-1">
          <div>{message.content}</div>
          {renderAttachments()}
          <div
            className={`
              text-xs ${isOwn
                ? 'text-blue-100'
                : darkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }
            `}
            role="presentation"
          >
            {format(new Date(message.createdAt), 'HH:mm')}
            {message.status === 'sent' && (
              <span className="ml-1" role="status" aria-label="Message sent">
                ✓
              </span>
            )}
            {message.status === 'delivered' && (
              <span className="ml-1" role="status" aria-label="Message delivered">
                ✓✓
              </span>
            )}
            {message.status === 'read' && (
              <span
                className="ml-1 text-blue-500"
                role="status"
                aria-label="Message read"
              >
                ✓✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble'; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
