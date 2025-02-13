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