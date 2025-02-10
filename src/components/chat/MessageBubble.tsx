import React from 'react';
import { Box, Avatar } from '@mui/material';
import { IMessage } from '../../types/social';

interface MessageBubbleProps {
  message: IMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      {!isCurrentUser && (
        <Avatar
          src={message.sender.avatar}
          alt={message.sender.username}
          sx={{ width: 32, height: 32 }}
        />
      )}
      <Box
        sx={{
          backgroundColor: isCurrentUser ? 'primary.main' : 'background.paper',
          color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
          padding: 2,
          borderRadius: 2,
          maxWidth: '70%',
        }}
      >
        {message.content}
      </Box>
    </Box>
  );
};

export default MessageBubble; 