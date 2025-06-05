import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Fab,
  Drawer,
  useTheme,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { aiModerator } from '../../services/aiModeration';
import useStore from '../../store/useStore';

const AIChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m GameDin\'s AI Moderator. I can help you with:\n\n• Finding gaming partners\n• Game recommendations\n• Platform guidance\n• Issue resolution\n\nHow can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const user = useStore(state => state.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiModerator.processUserMessage(userMessage.content);
      const assistantMessage = {
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setError(error.message || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = messages[messages.length - 2];
    if (lastUserMessage.role !== 'user') return;

    setError(null);
    setIsLoading(true);
    
    try {
      const response = await aiModerator.processUserMessage(lastUserMessage.content);
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Failed to retry AI response:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    aiModerator.clearHistory();
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m GameDin\'s AI Moderator. I can help you with:\n\n• Finding gaming partners\n• Game recommendations\n• Platform guidance\n• Issue resolution\n\nHow can I assist you today?',
      },
    ]);
    setError(null);
  };

  return (
    <>
      <Tooltip title="AI Assistant" placement="left">
        <Fab
          color="primary"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 400,
            borderRadius: 0,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: 'background.default',
          }}
        >
          {/* Header */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 0,
            }}
          >
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <BotIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6">AI Moderator</Typography>
              <Typography variant="body2" color="text.secondary">
                Here to help 24/7
              </Typography>
            </Box>
            <IconButton onClick={handleReset} title="Reset conversation">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Paper>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((message, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
                sx={{ maxWidth: '80%' }}
              >
                {message.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <BotIcon />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor:
                      message.role === 'user'
                        ? theme.palette.primary.main
                        : theme.palette.background.paper,
                    color:
                      message.role === 'user'
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-wrap' }}
                  >
                    {message.content}
                  </Typography>
                </Paper>
                {message.role === 'user' && (
                  <Avatar src={user?.avatar} alt={user?.username} />
                )}
              </Stack>
            ))}
            {isLoading && (
              <Box display="flex" alignItems="center" gap={1} alignSelf="flex-start">
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <BotIcon />
                </Avatar>
                <CircularProgress size={24} />
              </Box>
            )}
            {error && (
              <Alert
                severity="error"
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={handleRetry}
                  >
                    <RefreshIcon />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 0,
            }}
          >
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                variant="outlined"
                size="small"
                disabled={isLoading}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      </Drawer>
    </>
  );
};

export default AIChatInterface; 