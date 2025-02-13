import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Divider,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import { messagesApi } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

interface IMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
}

interface IConversation {
  id: string;
  participants: {
    id: string;
    username: string;
    avatarUrl: string;
    status: 'online' | 'offline' | 'away';
  }[];
  lastMessage?: IMessage;
  unreadCount: number;
  updatedAt: string;
  type: 'direct' | 'group';
  name?: string;
}

const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 200px)',
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
}));

const MessageList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
});

const MessageBubble = styled(Box)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  maxWidth: '70%',
  padding: '10px 15px',
  borderRadius: '15px',
  marginBottom: '10px',
  backgroundColor: isOwn ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  position: 'relative',
}));

const Messaging: React.FC = () => {
  const { user } = useUser();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messagesApi.getConversations();
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load conversations',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        setLoading(true);
        const response = await messagesApi.getMessages(conversationId);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load messages',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !newMessage.trim()) return;

    try {
      const response = await messagesApi.sendMessage(conversationId, newMessage);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send message',
        severity: 'error',
      });
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
    return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConversation = conversationId
    ? conversations.find(c => c.id === conversationId)
    : null;

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" gap={2} height="calc(100vh - 100px)">
        {/* Conversations List */}
        <Paper
          sx={{
            width: 320,
            backgroundColor: 'rgba(8, 95, 128, 0.1)',
            borderRadius: '15px',
            overflow: 'hidden',
          }}
        >
          <Box p={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
          <Divider />
          <List sx={{ overflow: 'auto', height: 'calc(100% - 80px)' }}>
            {loading && !conversationId ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              filteredConversations.map(conversation => {
                const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
                if (!otherParticipant) return null;

                return (
                  <ListItem
                    key={conversation.id}
                    button
                    selected={conversation.id === conversationId}
                    onClick={() => navigate(`/messages/${conversation.id}`)}
                  >
                    <ListItemAvatar>
                      {otherParticipant.status === 'online' ? (
                        <OnlineBadge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                        >
                          <Avatar src={otherParticipant.avatarUrl} />
                        </OnlineBadge>
                      ) : (
                        <Avatar src={otherParticipant.avatarUrl} />
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography>{otherParticipant.username}</Typography>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              badgeContent={conversation.unreadCount}
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        conversation.lastMessage && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {conversation.lastMessage.sender.id === user?.id
                              ? 'You: '
                              : `${conversation.lastMessage.sender.username}: `}
                            {conversation.lastMessage.content}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                );
              })
            )}
          </List>
        </Paper>

        {/* Chat Area */}
        {conversationId ? (
          <ChatContainer sx={{ flex: 1 }}>
            {/* Chat Header */}
            <Box p={2} display="flex" alignItems="center" borderBottom={1} borderColor="divider">
              {selectedConversation && (
                <>
                  <OnlineBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    invisible={
                      selectedConversation.participants.find(p => p.id !== user?.id)?.status !==
                      'online'
                    }
                  >
                    <Avatar
                      src={
                        selectedConversation.participants.find(p => p.id !== user?.id)?.avatarUrl
                      }
                    />
                  </OnlineBadge>
                  <Box ml={2}>
                    <Typography variant="h6">
                      {selectedConversation.participants.find(p => p.id !== user?.id)?.username}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {selectedConversation.participants.find(p => p.id !== user?.id)?.status ===
                      'online'
                        ? 'Online'
                        : 'Offline'}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Messages */}
            <MessageList>
              {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                messages.map(message => (
                  <MessageBubble key={message.id} isOwn={message.sender.id === user?.id}>
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </MessageBubble>
                ))
              )}
              <div ref={messagesEndRef} />
            </MessageList>

            {/* Message Input */}
            <Box p={2} component="form" onSubmit={handleSendMessage}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" disabled={!newMessage.trim()} color="primary">
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </ChatContainer>
        ) : (
          <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="rgba(8, 95, 128, 0.1)"
            borderRadius="15px"
          >
            <Typography variant="h6" color="textSecondary">
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Messaging;
