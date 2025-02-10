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
  content: string;
  richText: RichTextContent;
  author: User;
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  comments: Comment[];
  attachments: Attachment[];
  visibility: 'public' | 'friends' | 'private';
  tags: string[];
  metadata: {
    views: number;
    shares: number;
    score: number; // For algorithmic sorting
  };
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
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  replies: Comment[];
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
  type: 'reaction' | 'comment' | 'reply' | 'mention' | 'follow' | 'system';
  recipient: User;
  actor: User;
  target: {
    type: 'post' | 'comment' | 'user';
    id: string;
  };
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
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
  avatar: string;
  presence: 'online' | 'offline' | 'in-game';
  bio?: string;
  rank?: string;
  level?: number;
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
  content: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  conversation: string;
  createdAt: string;
  updatedAt: string;
  attachments?: IAttachment[];
  metadata?: {
    isDeleted: boolean;
    isEdited: boolean;
  };
}

export interface IMessageInput {
  content: string;
  recipientId: string;
  attachments?: File[];
}

export interface IConversation {
  id: string;
  participants: IConversationParticipant[];
  lastMessage?: IMessage;
  unreadCount: number;
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
  user: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface IAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  progress?: {
    current: number;
    required: number;
  };
  game?: string;
  unlockedAt?: string;
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

export interface IUserProfile extends IUser {
  gamePreferences: IGamePreference[];
  socialLinks: ISocialLink[];
  achievements: IAchievement[];
  bannerUrl?: string;
}

export interface IPostMedia {
  type: 'image' | 'video';
  file: File;
  preview: string;
  url?: string;
}
