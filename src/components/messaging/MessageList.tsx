import { Box } from '@mui/material';
import { IMessage, IUser } from '../../types/social';
import MessageBubble from '../chat/MessageBubble';

interface MessageListProps {
  messages: IMessage[];
  currentUser: IUser;
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
