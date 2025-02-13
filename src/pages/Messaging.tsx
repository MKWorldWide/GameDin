import { Box, Container, Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { IConversation, IMessage } from '../types/social';
import ConversationsList from '../components/messaging/ConversationsList';
import MessageList from '../components/messaging/MessageList';
import MessageInput from '../components/messaging/MessageInput';
import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { listConversations, listMessages } from '../graphql/queries';
import { onCreateMessage } from '../graphql/subscriptions';
import { createMessage } from '../graphql/mutations';

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = (await API.graphql(
        graphqlOperation(listConversations)
      )) as GraphQLResult<{
        listConversations: {
          items: IConversation[];
        };
      }>;

      if (response.data) {
        setConversations(response.data.listConversations.items);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = (await API.graphql(
        graphqlOperation(listMessages, {
          filter: { conversationId: { eq: conversationId } },
        })
      )) as GraphQLResult<{
        listMessages: {
          items: IMessage[];
        };
      }>;

      if (response.data) {
        setMessages(response.data.listMessages.items);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = async (content: string) => {
    if (!selectedConversation || !user) return;

    try {
      const newMessage = {
        conversationId: selectedConversation,
        content,
        author: {
          id: user.username,
          username: user.username,
          picture: user.attributes?.picture,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await API.graphql(
        graphqlOperation(createMessage, { input: newMessage })
      );

      setMessages((prev) => [...prev, newMessage as IMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (!selectedConversation) return;

    const subscription = (API.graphql(
      graphqlOperation(onCreateMessage, {
        filter: { conversationId: { eq: selectedConversation } },
      })
    ) as any).subscribe({
      next: ({ value }: { value: { data: { onCreateMessage: IMessage } } }) => {
        setMessages((prev) => [...prev, value.data.onCreateMessage]);
      },
      error: (error: Error) => console.error('Subscription error:', error),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to access messaging.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <ConversationsList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          loading={loading}
        />
      </div>
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <MessageList
              messages={messages}
              currentUser={user}
            />
            <div className="p-4 border-t border-gray-200 bg-white">
              <MessageInput onSubmit={handleNewMessage} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
