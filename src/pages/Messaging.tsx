<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, TextField, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box } from '@mui/material';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { IConversation, IMessage } from '../types/social';

const client = generateClient();

interface ConversationParticipant {
  id: string;
  username: string;
  picture: string;
}

interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    picture: string;
  };
  createdAt: string;
}

const Messaging: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      const subscription = subscribeToNewMessages(selectedConversation);
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await client.graphql({
        query: `
          query ListConversations {
            listConversations {
              items {
                id
                participants {
                  id
                  username
                  picture
                }
                lastMessage {
                  id
                  content
                  createdAt
                }
              }
            }
          }
        `
      });
      if ('data' in response) {
        setConversations(response.data.listConversations.items);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await client.graphql({
        query: `
          query GetMessages($conversationId: ID!) {
            getMessages(conversationId: $conversationId) {
              items {
                id
                content
                sender {
                  id
                  username
                  picture
                }
                createdAt
              }
            }
          }
        `,
        variables: { conversationId }
      });
      if ('data' in response) {
        setMessages(response.data.getMessages.items);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToNewMessages = (conversationId: string) => {
    try {
      const subscription = client.graphql({
        query: `
          subscription OnNewMessage($conversationId: ID!) {
            onNewMessage(conversationId: $conversationId) {
              id
              content
              sender {
                id
                username
                picture
              }
              createdAt
            }
          }
        `,
        variables: { conversationId }
      }).subscribe({
        next: (result: { data?: { onNewMessage: Message } }) => {
          if (result.data?.onNewMessage) {
            setMessages(prev => [...prev, result.data!.onNewMessage]);
          }
        },
        error: (error: Error) => console.error('Subscription error:', error)
      });

      return subscription;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await client.graphql({
        query: `
          mutation SendMessage($input: SendMessageInput!) {
            sendMessage(input: $input) {
              id
              content
              sender {
                id
                username
                picture
              }
              createdAt
            }
          }
        `,
        variables: {
          input: {
            conversationId: selectedConversation,
            content: newMessage
          }
        }
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Conversations
            </Typography>
            <List>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  selected={selectedConversation === conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <ListItemAvatar>
                    <Avatar src={conversation.participants[0].picture} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.participants[0].username}
                    secondary={conversation.lastMessage?.content}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender.id === user?.id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.sender.id === user?.id ? 'primary.light' : 'grey.100'
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messaging;
=======
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useVirtual } from 'react-virtual';
import useStore from '../store/useStore';
import { useMessaging } from '../hooks/useMessaging'; 
import type { IConversation, IMessage, IUser } from '../types/social';

// Memoized conversation list item component
const ConversationItem = memo(({ 
  conversation, 
  isSelected, 
  onSelect 
}: { 
  conversation: IConversation; 
  isSelected: boolean; 
  onSelect: (conversation: IConversation) => void;
}) => {
  return (
    <button
      onClick={() => onSelect(conversation)}
      className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-gray-50 dark:bg-gray-700' : ''
      }`}
      aria-label={`Conversation with ${conversation.participants[0].user.name}`}
      aria-selected={isSelected}
      role="option"
    >
      <img
        src={conversation.participants[0].user.picture}
        alt=""
        className="w-12 h-12 rounded-full object-cover"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {conversation.participants[0].user.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {conversation.lastMessage?.content || 'No messages yet'}
        </p>
      </div>
    </button>
  );
});

// Memoized message item component
const MessageItem = memo(({ message, isOwnMessage }: { message: IMessage; isOwnMessage: boolean }) => {
  return (
    <div className={`mb-4 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block rounded-lg p-3 max-w-xs sm:max-w-md ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        <p>{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
});

export default function Messaging() {
  // Get data and methods from custom hook
  const { 
    user, 
    conversations,
    activeConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    hasMoreMessages,
    typingUsers,
    setActiveConversation,
    loadConversations,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    sendTypingIndicator
  } = useMessaging();
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Memoized conversation selector
  const handleSelectConversation = useCallback((conversation: IConversation) => {
    setActiveConversation(conversation.id);
    loadMessages();
  }, [setActiveConversation, loadMessages]);
  
  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);
  
  // Setup message virtualization
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtual({
    size: messages.length,
    parentRef,
    estimateSize: useCallback(() => 80, []), // Estimated height of each message
    overscan: 10, // Number of items to render outside the visible area
  });
  
  // Memoized handler for sending messages
  const handleSendMessage = useCallback(async () => {
    if (!activeConversation || !newMessage.trim()) return;
    
    await sendMessage(newMessage.trim());
    setNewMessage('');
    setIsTyping(false);
  }, [activeConversation, newMessage, sendMessage]);

  // Optimized keyboard event handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Handle typing indicator with debounce
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (value && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    } else if (!value && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  }, [isTyping, sendTypingIndicator]);
  
  // Return early if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to access messages.
        </p>
      </div>
    );
  }

  // Optimized render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-12 min-h-[600px]">
          {/* Conversations List */}
          <div className="col-span-4 border-r dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
            </div>
            <div 
              className="overflow-y-auto h-[calc(600px-4rem)]"
              role="listbox"
              aria-label="Conversations"
            >
              {isLoadingConversations ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={activeConversation?.id === conversation.id}
                    onSelect={handleSelectConversation}
                  />
                ))
              ) : (
                <p className="text-center p-4 text-gray-500 dark:text-gray-400">No conversations yet</p>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="col-span-8 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <img
                      src={activeConversation.participants[0].user.picture}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {activeConversation.participants[0].user.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activeConversation.participants[0].user.rank} • Level{' '}
                        {activeConversation.participants[0].user.level}
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  ref={parentRef} 
                  className="flex-1 overflow-y-auto p-4"
                  role="log"
                  aria-label="Message thread"
                  aria-live="polite"
                >
                  {isLoadingMessages ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    <div 
                      className="relative" 
                      style={{ height: `${rowVirtualizer.totalSize}px` }}
                    >
                      {rowVirtualizer.virtualItems.map((virtualRow) => {
                        const message = messages[virtualRow.index];
                        const isOwnMessage = message.author.id === user.id;
                        
                        return (
                          <div
                            key={message.id}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                          >
                            <MessageItem 
                              message={message} 
                              isOwnMessage={isOwnMessage} 
                            />
                          </div>
                        );
                      })}
                      
                      {hasMoreMessages && (
                        <button
                          onClick={loadMoreMessages}
                          className="w-full text-center text-blue-500 p-2 hover:underline"
                          aria-label="Load more messages"
                        >
                          Load more
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No messages yet
                    </p>
                  )}
                  
                  {typingUsers.length > 0 && (
                    <div className="text-sm text-gray-500 italic mt-2">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                </div>

                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex space-x-3">
                    <textarea
                      value={newMessage}
                      onChange={handleMessageChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 resize-none rounded-lg border dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      aria-label="Message input"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
