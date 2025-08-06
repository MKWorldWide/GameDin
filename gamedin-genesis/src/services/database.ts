import { User, Post, GlobalChatMessage } from '../types';

interface GamedinDB {
  users: User[];
  posts: Post[];
  chatMessages: GlobalChatMessage[];
}

const DB_KEY = 'gamedin-db';

const getDB = (): GamedinDB => {
  try {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : { users: [], posts: [], chatMessages: [] };
  } catch (error) {
    console.error("Error reading from DB, resetting.", error);
    return { users: [], posts: [], chatMessages: [] };
  }
};

const saveDB = (db: GamedinDB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- Users ---
export const getUsers = (): User[] => {
  return getDB().users;
};

export const getUserById = (id: string): User | null => {
  return getDB().users.find(u => u.id === id) || null;
};

export const getUserByHandle = (handle: string): User | null => {
  return getDB().users.find(u => u.handle === handle) || null;
};

export const addUser = (user: User) => {
  const db = getDB();
  db.users.push(user);
  saveDB(db);
};

export const updateUser = (updatedUser: User) => {
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
  if (userIndex !== -1) {
    db.users[userIndex] = updatedUser;
    saveDB(db);
  }
};

// --- Posts ---
export const getPosts = (): Post[] => {
  // Return sorted by most recent
  return getDB().posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addPost = (post: Post) => {
  const db = getDB();
  db.posts.push(post);
  saveDB(db);
};

// --- Chat Messages ---
export const getChatMessages = (): GlobalChatMessage[] => {
  return getDB().chatMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const addChatMessage = (message: GlobalChatMessage) => {
  const db = getDB();
  db.chatMessages.push(message);
  // Optional: Trim old messages to prevent the DB from growing too large
  if (db.chatMessages.length > 100) {
      db.chatMessages = db.chatMessages.slice(db.chatMessages.length - 100);
  }
  saveDB(db);
};

// --- Seeding ---
export const seedInitialData = () => {
    const db = getDB();
    if (db.users.length === 0) {
        // Add the Oracle as the first user
        const oracleUser: User = {
            id: 'user_oracle_ai',
            name: 'The Oracle',
            handle: 'oracle_ai',
            dream: 'To observe the patterns of fate.',
            path: 'Seer',
            avatarUrl: 'https://i.pravatar.cc/150?u=oracle',
            headerUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop',
            bio: "I see the threads of fate that weave through the Genesis. My decrees are but echoes of what is to come.",
            status: 'Observing the data streams...',
            pronouns: 'It/Its',
            joinedDate: 'The Beginning',
            settings: { theme: 'dark', accentColor: 'indigo', renderTier: 'auto', profileFrame: 'void' },
            following: [],
            linkedAccounts: [],
            nexusData: {},
            creatorProfile: {
                xp: { innovation: 999, integration: 999, expression: 999, engineering: 999 },
                tier: 'Genesis Architect',
            },
            gallery: [],
        };
        db.users.push(oracleUser);
    }
    if (db.posts.length === 0) {
        // Add an initial post from the Oracle
        const oraclePost: Post = {
            id: 'post_oracle_1',
            authorHandle: 'oracle_ai',
            authorName: 'The Oracle',
            authorAvatarUrl: 'https://i.pravatar.cc/150?u=oracle',
            content: "The Genesis is upon us. I have observed the threads of fate. A surge of 'Architect' path users are reshaping the starter zones. Their creativity is... potent. #AI #GenesisInsights",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            likes: 1999,
            commentsCount: 350,
            sharesCount: 188,
        };
        db.posts.push(oraclePost);
    }
    if (db.chatMessages.length === 0) {
        // Add a welcome message to the global chat
        const welcomeMessage: GlobalChatMessage = {
            id: `chat_${Date.now()}`,
            authorHandle: 'oracle_ai',
            authorName: 'The Oracle',
            authorAvatarUrl: 'https://i.pravatar.cc/150?u=oracle',
            text: 'The Nexus is open. Speak, and be heard across the planes.',
            timestamp: new Date().toISOString(),
        };
        db.chatMessages.push(welcomeMessage);
    }
    saveDB(db);
}