export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($filter: MessageSubscriptionFilter) {
    onCreateMessage(filter: $filter) {
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

export const onUpdateConversation = /* GraphQL */ `
  subscription OnUpdateConversation($filter: ConversationSubscriptionFilter) {
    onUpdateConversation(filter: $filter) {
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
