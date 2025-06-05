<<<<<<< HEAD
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
=======
import { IConversation, IUser } from '../../types/social';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListProps {
  conversations: IConversation[];
  currentUser: IUser;
  selectedConversationId?: string;
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

<<<<<<< HEAD
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
=======
export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  currentUser,
  selectedConversationId,
  onSelectConversation,
  loading = false
}) => {
  const getOtherParticipant = (conversation: IConversation): IUser => {
    return conversation.participants.find(
      participant => participant.user.id !== currentUser.id
    )?.user || conversation.participants[0].user;
  };

  const getConversationName = (conversation: IConversation): string => {
    if (conversation.type === 'GROUP') {
      return conversation.title || 'Group Chat';
    }
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant.name || otherParticipant.username;
  };

  const getConversationAvatar = (conversation: IConversation): string => {
    if (conversation.type === 'GROUP') {
      return conversation.groupAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${conversation.title}`;
    }
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant.picture || otherParticipant.avatar || 
           `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.username}`;
  };

  const getLastMessagePreview = (conversation: IConversation): string => {
    if (!conversation.lastMessage) return 'No messages yet';
    return conversation.lastMessage.content.length > 50
      ? `${conversation.lastMessage.content.substring(0, 50)}...`
      : conversation.lastMessage.content;
  };

  const getLastMessageTime = (conversation: IConversation): string => {
    if (!conversation.lastMessage) return '';
    return formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true });
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
=======
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No conversations yet</p>
      </div>
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 ${
            selectedConversationId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <img
            src={getConversationAvatar(conversation)}
            alt={getConversationName(conversation)}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold truncate">
                {getConversationName(conversation)}
              </h3>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                {getLastMessageTime(conversation)}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {getLastMessagePreview(conversation)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
