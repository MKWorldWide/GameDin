import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { IMessage } from '../../types/social';

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
}

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