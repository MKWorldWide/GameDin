<<<<<<< HEAD
export const createMessage = /* GraphQL */ `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      conversationId
      content
      author {
        id
        username
        name
        picture
        avatar
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
=======
import { gql } from '@apollo/client';

export const createMessageMutation = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      userId
      userName
      userAvatar
      timestamp
      read
      conversationId
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
    }
  }
`;

<<<<<<< HEAD
export const createConversation = /* GraphQL */ `
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
      id
      title
      description
      type
      participants {
        id
        role
        user {
          id
          username
          name
          picture
          avatar
          createdAt
          updatedAt
        }
        conversation {
          id
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      lastMessage {
        id
        conversationId
        content
        author {
          id
          username
          name
          picture
          avatar
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
=======
export const onCreateMessageSubscription = gql`
  subscription OnCreateMessage {
    onCreateMessage {
      id
      content
      userId
      userName
      userAvatar
      timestamp
      read
      conversationId
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
    }
  }
`; 