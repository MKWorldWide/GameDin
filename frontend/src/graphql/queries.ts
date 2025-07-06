export const listConversations = /* GraphQL */ `
  query ListConversations {
    listConversations {
      items {
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
  }
`;

export const listMessages = /* GraphQL */ `
  query ListMessages($filter: MessageFilterInput) {
    listMessages(filter: $filter) {
      items {
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
  }
`;
