import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import useStore from '../../store/useStore';

const mockMessages = {
  1: [
    { id: 1, sender: 'Player1', text: 'Hey, want to team up for the tournament?', timestamp: '10:25 AM' },
    { id: 2, sender: 'currentUser', text: 'Sure! What time are you thinking?', timestamp: '10:27 AM' },
    { id: 3, sender: 'Player1', text: 'How about 8 PM EST? I heard there\'s a big Valorant tournament.', timestamp: '10:30 AM' },
  ],
  2: [
    { id: 1, sender: 'GamerPro', text: 'That was an amazing clutch yesterday!', timestamp: 'Yesterday 9:15 PM' },
    { id: 2, sender: 'currentUser', text: 'Thanks! Been practicing those smoke lineups.', timestamp: 'Yesterday 9:20 PM' },
    { id: 3, sender: 'GamerPro', text: 'It really showed. Want to run some ranked games later?', timestamp: 'Yesterday 9:25 PM' },
  ],
  3: [
    { id: 1, sender: 'EsportsCoach', text: 'I watched your recent matches. Your game sense has improved a lot.', timestamp: 'Yesterday 3:00 PM' },
    { id: 2, sender: 'currentUser', text: 'Thank you! I\'ve been focusing on positioning and timing.', timestamp: 'Yesterday 3:05 PM' },
    { id: 3, sender: 'EsportsCoach', text: 'Keep it up! Let\'s schedule a coaching session next week.', timestamp: 'Yesterday 3:10 PM' },
  ],
};

const mockConversations = [
  {
    id: 1,
    username: 'Player1',
    avatar: 'https://mui.com/static/images/avatar/1.jpg',
    lastMessage: 'How about 8 PM EST? I heard there\'s a big Valorant tournament.',
    timestamp: '10:30 AM',
    status: 'online',
    rank: 'Diamond',
    game: 'Valorant',
  },
  {
    id: 2,
    username: 'GamerPro',
    avatar: 'https://mui.com/static/images/avatar/2.jpg',
    lastMessage: 'It really showed. Want to run some ranked games later?',
    timestamp: 'Yesterday',
    status: 'offline',
    rank: 'Immortal',
    game: 'Valorant',
  },
  {
    id: 3,
    username: 'EsportsCoach',
    avatar: 'https://mui.com/static/images/avatar/3.jpg',
    lastMessage: 'Keep it up! Let\'s schedule a coaching session next week.',
    timestamp: 'Yesterday',
    status: 'online',
    rank: 'Radiant',
    game: 'Valorant',
  },
];

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const { user } = useStore();

  useEffect(() => {
    // Load initial conversation if none selected
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      id: messages[selectedConversation.id].length + 1,
      sender: 'currentUser',
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update messages
    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...prev[selectedConversation.id], newMessage],
    }));

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: messageInput.trim(), timestamp: 'Just now' }
          : conv
      )
    );

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses = [
        "Sure, I'm up for that! Let me know when you're ready.",
        "That's a great idea! I've been wanting to try that strategy.",
        "Nice! I'll be online in a few minutes.",
        "Perfect timing, I just finished my last match.",
      ];
      
      const aiResponse = {
        id: messages[selectedConversation.id].length + 2,
        sender: selectedConversation.username,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => ({
        ...prev,
        [selectedConversation.id]: [...prev[selectedConversation.id], aiResponse],
      }));

      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: aiResponse.text, timestamp: 'Just now' }
            : conv
        )
      );
    }, 1000);

    setMessageInput('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', overflow: 'auto', bgcolor: '#1a1a2e' }}>
            <Typography variant="h6" sx={{ p: 2, color: 'white' }}>
              Conversations
            </Typography>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <List>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'rgba(147, 112, 219, 0.1)',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(147, 112, 219, 0.05)',
                    },
                    cursor: 'pointer',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={conversation.avatar} alt={conversation.username} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography color="white">{conversation.username}</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          ({conversation.rank})
                        </Typography>
                      </Box>
                    }
                    secondary={conversation.lastMessage}
                    secondaryTypographyProps={{
                      noWrap: true,
                      style: { maxWidth: '200px', color: 'rgba(255,255,255,0.5)' },
                    }}
                  />
                  <Box textAlign="right">
                    <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block">
                      {conversation.timestamp}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: conversation.status === 'online' ? '#4CAF50' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {conversation.status}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a2e' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={selectedConversation.avatar} alt={selectedConversation.username} />
                    <Box>
                      <Typography variant="h6" color="white">{selectedConversation.username}</Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        {selectedConversation.rank} • {selectedConversation.game}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Messages Area */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#16162a' }}>
                  {messages[selectedConversation.id]?.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'currentUser' ? 'flex-end' : 'flex-start',
                        mb: 2,
                        gap: 1,
                        alignItems: 'flex-end',
                      }}
                    >
                      {message.sender !== 'currentUser' && (
                        <Avatar
                          src={selectedConversation.avatar}
                          alt={selectedConversation.username}
                          sx={{ width: 32, height: 32 }}
                        />
                      )}
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: message.sender === 'currentUser' ? '#7c4dff' : '#2d2d44',
                          color: 'white',
                          borderRadius: 2,
                          p: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          position: 'relative',
                          '&::before': message.sender !== 'currentUser' ? {
                            content: '""',
                            position: 'absolute',
                            left: -8,
                            bottom: 8,
                            borderStyle: 'solid',
                            borderWidth: '8px 8px 8px 0',
                            borderColor: `transparent #2d2d44 transparent transparent`,
                          } : {
                            content: '""',
                            position: 'absolute',
                            right: -8,
                            bottom: 8,
                            borderStyle: 'solid',
                            borderWidth: '8px 0 8px 8px',
                            borderColor: `transparent transparent transparent #7c4dff`,
                          },
                        }}
                      >
                        {message.sender !== 'currentUser' && (
                          <Typography variant="subtitle2" color="#b388ff" gutterBottom>
                            {selectedConversation.username}
                          </Typography>
                        )}
                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.5,
                            color: 'rgba(255,255,255,0.7)',
                          }}
                        >
                          {message.timestamp}
                        </Typography>
                      </Box>
                      {message.sender === 'currentUser' && (
                        <Avatar
                          src={user?.avatar || '/default-avatar.png'}
                          alt="You"
                          sx={{ width: 32, height: 32 }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            bgcolor: '#2d2d44',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#7c4dff',
                            },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255,255,255,0.5)',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        sx={{
                          bgcolor: '#7c4dff',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#9575cd',
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'rgba(124, 77, 255, 0.3)',
                            color: 'rgba(255,255,255,0.3)',
                          },
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                <Typography>
                  Select a conversation to start chatting
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MessagesPage; 