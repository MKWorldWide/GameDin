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
      return () => subscription.unsubscribe();
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
    });

    return subscription.subscribe({
      next: (result: { data?: { onNewMessage: Message } }) => {
        if (result.data?.onNewMessage) {
          setMessages(prev => [...prev, result.data!.onNewMessage]);
        }
      },
      error: (error: Error) => console.error('Subscription error:', error)
    });
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
              <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                Select a conversation to start messaging
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messaging;
