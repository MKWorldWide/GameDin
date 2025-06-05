import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { IConversation, IUser } from '../../types/social';
import { useAuth } from '../../hooks/useAuth';

interface ConversationsListProps {
  conversations: IConversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

export default function ConversationsList({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading = false,
}: ConversationsListProps) {
  const { user } = useAuth();

  const getOtherParticipant = (conversation: IConversation) => {
    return conversation.participants.find(
      (p) => p.user.username !== user?.username
    )?.user;
  };

  const getLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ago`;
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);

        return (
          <ListItem
            key={conversation.id}
            button
            selected={selectedConversation === conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={
                  otherParticipant?.picture ||
                  otherParticipant?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant?.username}`
                }
                alt={otherParticipant?.username}
              />
            </ListItemAvatar>
            <ListItemText
              primary={conversation.title || otherParticipant?.username}
              secondary={
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '70%',
                    }}
                  >
                    {conversation.lastMessage?.content}
                  </Typography>
                  {conversation.lastMessage && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {getLastMessageTime(conversation.lastMessage.createdAt)}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}
