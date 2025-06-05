export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  rank?: string;
  level?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  comments: Comment[];
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface RichTextContent {
  blocks: Array<{
    id: string;
    type: 'paragraph' | 'heading' | 'list' | 'code' | 'image' | 'video';
    content: string;
    metadata?: Record<string, any>;
  }>;
  formatting: Array<{
    blockId: string;
    range: [number, number];
    style: 'bold' | 'italic' | 'link' | 'mention' | 'hashtag';
    data?: Record<string, any>;
  }>;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
  userId: string;
  createdAt: string;
}

export interface Attachment {
  url: string;
  type: 'image' | 'video' | 'link';
  description?: string;
}

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'message';
  sender: User;
  recipient: User;
  post?: Post;
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  id: string;
  type: 'post' | 'shared' | 'activity';
  content: PostContent;
  author: User;
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  comments: Comment[];
  score: number;
  position: number;
  seen: boolean;
  promoted: boolean;
}

export interface PostContent {
  text: string;
  richText: any | null; // Replace with proper rich text type when implemented
  attachments: Attachment[];
}

export interface SharedContent extends Post {
  originalPost: Post;
  sharerComment?: string;
}

export interface ActivityContent {
  type: 'follow' | 'reaction' | 'achievement';
  actors: User[];
  target: Post | User;
  timestamp: string;
}

export interface FeedState {
  items: FeedItem[];
  lastFetched: string;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
  filters: {
    type: string[];
    timeRange: string;
    following: boolean;
  };
}

export interface WebSocketMessage {
  id: string;
  type: 'ACTIVITY_CREATE' | 'ACTIVITY_UPDATE' | 'ACTIVITY_DELETE' | 'MESSAGE_CREATE' | 'MESSAGE_UPDATE' | 'MESSAGE_DELETE';
  data: {
    activity?: IActivity;
    activityId?: string;
    message?: IMessage;
    messageId?: string;
  };
  timestamp: string;
}

export interface CacheConfig {
  key: string;
  ttl: number;
  version: string;
  dependencies: string[];
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  name: string;
  picture?: string;
  avatar?: string;
  bio?: string;
  rank?: string;
  createdAt: string;
  updatedAt: string;
  attributes?: {
    email?: string;
    name?: string;
    picture?: string;
    rank?: string;
    [key: string]: any;
  };
}

export interface IConversationParticipant {
  id: string;
  user: IUser;
  conversation: IConversation;
  lastRead?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  content: string;
  author: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface IMessageInput {
  content: string;
  recipientId: string;
  attachments?: File[];
}

export interface IConversation {
  id: string;
  title?: string;
  description?: string;
  type: 'PRIVATE' | 'GROUP';
  participants: {
    user: IUser;
    role: 'ADMIN' | 'MEMBER';
  }[];
  lastMessage?: IMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ExtendedConversation extends IConversation {
  name: string;
}

export interface IActivity {
  id: string;
  type: 'post' | 'achievement' | 'game';
  content: string;
  user: IUser;
  likes: number;
  isLiked: boolean;
  comments: IComment[];
  media?: IPostMedia;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  id: string;
  content: string;
  author: IUser;
  post: Post;
  createdAt: string;
  updatedAt: string;
}

export interface IAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface IGamePreference {
  id: string;
  name: string;
  genre: string;
  platform: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
}

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface IUserProfile {
  id: string;
  user: IUser;
  posts: Post[];
  followers: IUser[];
  following: IUser[];
  createdAt: string;
  updatedAt: string;
}

export interface IPostMedia {
  type: 'image' | 'video';
  file: File;
  preview: string;
  url?: string;
}

export interface IGameActivity {
  id: string;
  game: {
    id: string;
    title: string;
    coverImage: string;
  };
  user: IUser;
  type: 'played' | 'reviewed' | 'rated' | 'achieved';
  score?: number;
  review?: string;
  achievement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupParticipant {
  id: string;
  role: 'owner' | 'admin' | 'member';
  user: IUser;
  conversation: IConversation;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  id: string;
  type: 'MESSAGE' | 'FRIEND_REQUEST' | 'ACHIEVEMENT' | 'SYSTEM';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  data?: {
    conversationId?: string;
    userId?: string;
    achievementId?: string;
    post?: Post;
  };
}
