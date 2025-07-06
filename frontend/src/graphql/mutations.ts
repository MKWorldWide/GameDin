/**
 * GraphQL Mutations for GameDin Application
 *
 * This module defines all GraphQL mutations for the gaming social platform
 * including message creation, conversation management, and user interactions.
 *
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

import { gql } from '@apollo/client';

// Message mutations
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
    }
  }
`;

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
    }
  }
`;

// Conversation mutations
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
    }
  }
`;

export const updateConversation = /* GraphQL */ `
  mutation UpdateConversation($input: UpdateConversationInput!) {
    updateConversation(input: $input) {
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
    }
  }
`;

export const deleteConversation = /* GraphQL */ `
  mutation DeleteConversation($input: DeleteConversationInput!) {
    deleteConversation(input: $input) {
      id
      title
      description
      type
      createdAt
      updatedAt
    }
  }
`;

// User mutations
export const updateUser = /* GraphQL */ `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      username
      email
      name
      picture
      avatar
      bio
      level
      rank
      status
      lastSeen
      createdAt
      updatedAt
    }
  }
`;

// Post mutations
export const createPost = /* GraphQL */ `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
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
      likes
      comments
      createdAt
      updatedAt
    }
  }
`;

export const updatePost = /* GraphQL */ `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      id
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
      likes
      comments
      createdAt
      updatedAt
    }
  }
`;

export const deletePost = /* GraphQL */ `
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      id
      content
      createdAt
      updatedAt
    }
  }
`;

// Comment mutations
export const createComment = /* GraphQL */ `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
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
      post {
        id
        content
        createdAt
        updatedAt
      }
      postId
      createdAt
      updatedAt
    }
  }
`;

export const updateComment = /* GraphQL */ `
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      id
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
      post {
        id
        content
        createdAt
        updatedAt
      }
      postId
      createdAt
      updatedAt
    }
  }
`;

export const deleteComment = /* GraphQL */ `
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
      content
      postId
      createdAt
      updatedAt
    }
  }
`;
