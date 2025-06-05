import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const mockUser = {
  id: 1,
  username: 'ProGamer123',
  avatar: 'https://mui.com/static/images/avatar/1.jpg',
  bannerUrl: 'https://source.unsplash.com/random/1600x400/?gaming',
  email: 'progamer@example.com',
  bio: 'Professional gamer and content creator',
  level: 42,
  experience: 75,
  stats: {
    gamesPlayed: 1250,
    winRate: 65,
    avgRating: 4.2,
    teamRating: 85,
  },
  games: [
    { name: 'Valorant', rank: 'Diamond', hours: 500 },
    { name: 'CS:GO', rank: 'Global Elite', hours: 1200 },
    { name: 'League of Legends', rank: 'Platinum', hours: 800 },
  ],
  teams: [
    { id: 1, name: 'Elite Squad', role: 'Captain', members: 5 },
    { id: 2, name: 'Tournament Team', role: 'Member', members: 4 },
  ],
  languages: ['English', 'Spanish'],
  preferences: {
    roles: ['Entry Fragger', 'IGL'],
    playstyle: ['Aggressive', 'Strategic'],
    communication: ['Voice Chat', 'Discord'],
  },
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  friends: [],
  requests: [],
  friendRequests: [],
  notifications: [],
  unreadNotifications: 0,
  matches: [],
  theme: 'dark',
  conversations: {},
  activeConversation: null,
  unreadMessages: {},
  activities: [],
  settings: {
    emailNotifications: {
      frequency: 'daily-digest',
      messages: false,
      friendRequests: true,
      teamInvites: true,
      gameInvites: false,
      matchmaking: false,
      achievements: false,
      news: false,
      security: true,
      marketing: false,
    },
    emailDigestTime: '18:00',
    pushNotifications: true,
    profileVisibility: 'public',
    darkMode: true,
    language: 'en',
    matchmakingEnabled: true,
    showOnlineStatus: true,
    showGameActivity: true,
    allowFriendRequests: true,
    allowMessages: true,
    themeColor: '#085f80',
  },
  suggestions: [],
  posts: [],
};

// Mock data for testing
const mockRequests = [
  {
    id: 4,
    username: 'TacticalPlayer',
    avatar: 'https://mui.com/static/images/avatar/4.jpg',
    rank: 'Platinum',
    game: 'Valorant',
    mutualFriends: 2,
  },
  {
    id: 5,
    username: 'CompetitiveGamer',
    avatar: 'https://mui.com/static/images/avatar/5.jpg',
    rank: 'Diamond',
    game: 'CS:GO',
    mutualFriends: 4,
  },
];

const mockSuggestions = [
  {
    id: 6,
    username: 'AimMaster',
    avatar: 'https://mui.com/static/images/avatar/6.jpg',
    rank: 'Immortal',
    game: 'Valorant',
    mutualFriends: 6,
  },
  {
    id: 7,
    username: 'StrategyKing',
    avatar: 'https://mui.com/static/images/avatar/7.jpg',
    rank: 'Diamond',
    game: 'CS:GO',
    mutualFriends: 3,
  },
];

const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions - User
      setUser: user => set({ user, isAuthenticated: !!user }),
      updateUserProfile: updates =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Actions - Matches
      setMatches: matches => set({ matches }),
      addMatch: match =>
        set(state => ({
          matches: [...state.matches, match],
        })),
      removeMatch: matchId =>
        set(state => ({
          matches: state.matches.filter(m => m.id !== matchId),
        })),

      // Actions - Friends
      setFriends: friends => set({ friends }),
      addFriend: friend =>
        set(state => ({
          friends: [...state.friends, friend],
          friendRequests: state.friendRequests.filter(req => req.id !== friend.id)
        })),
      removeFriend: friendId =>
        set(state => ({
          friends: state.friends.filter(friend => friend.id !== friendId)
        })),
      setFriendRequests: requests => set({ friendRequests: requests }),
      addFriendRequest: request =>
        set(state => ({
          friendRequests: [...state.friendRequests, request]
        })),
      removeFriendRequest: requestId =>
        set(state => ({
          friendRequests: state.friendRequests.filter(req => req.id !== requestId)
        })),

      // Actions - Notifications
      addNotification: notification =>
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadNotifications: state.unreadNotifications + 1,
        })),
      markNotificationsAsRead: () => set({ unreadNotifications: 0 }),
      clearNotifications: () => set({ notifications: [], unreadNotifications: 0 }),

      // Actions - Theme
      toggleTheme: () =>
        set(state => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      // Actions - Chat
      setConversations: conversations => set({ conversations }),
      addMessage: (conversationId, message) =>
        set(state => {
          const conversation = state.conversations[conversationId] || [];
          return {
            conversations: {
              ...state.conversations,
              [conversationId]: [...conversation, message],
            },
            unreadMessages: {
              ...state.unreadMessages,
              [conversationId]:
                (state.unreadMessages[conversationId] || 0) +
                (state.activeConversation !== conversationId ? 1 : 0),
            },
          };
        }),
      setActiveConversation: conversationId =>
        set(state => ({
          activeConversation: conversationId,
          unreadMessages: {
            ...state.unreadMessages,
            [conversationId]: 0,
          },
        })),

      // Actions - Activities
      setActivities: activities => set({ activities }),
      addActivity: activity =>
        set(state => ({
          activities: [activity, ...state.activities],
        })),
      updateActivity: (activityId, updates) =>
        set(state => ({
          activities: state.activities.map(activity =>
            activity.id === activityId ? { ...activity, ...updates } : activity
          ),
        })),

      // Actions - Authentication
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false,
            requests: mockRequests,
            suggestions: mockSuggestions,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
          const newUser = {
            ...mockUser,
            username: userData.username,
            email: userData.email,
          };
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, friends: [], friendRequests: [], suggestions: [] });
      },
      clearError: () => set({ error: null }),

      // Actions - Settings
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // Actions - Suggestions
      updateSuggestions: (suggestions) => set({ suggestions }),

      // Friend management actions
      setRequests: (requests) => set({ requests }),
      acceptFriendRequest: (requestId) => set((state) => {
        const request = state.requests.find(r => r.id === requestId);
        if (!request) return state;

        const newFriend = {
          id: request.id,
          username: request.username,
          avatar: request.avatar,
          isOnline: true
        };

        return {
          friends: [...state.friends, newFriend],
          requests: state.requests.filter(r => r.id !== requestId)
        };
      }),

      rejectFriendRequest: (requestId) => set((state) => ({
        requests: state.requests.filter(r => r.id !== requestId)
      })),

      addFriend: (suggestion) => set((state) => ({
        friends: [...state.friends, suggestion],
        suggestions: state.suggestions.filter(s => s.id !== suggestion.id)
      })),

      removeFriend: (friendId) => set((state) => ({
        friends: state.friends.filter(f => f.id !== friendId)
      })),

      addPost: (content) => {
        const { user } = get();
        const newPost = {
          id: Date.now(),
          content,
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: [],
          shares: 0,
        };
        set((state) => ({ posts: [newPost, ...state.posts] }));
      },

      deletePost: (postId) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== postId),
        }));
      },

      likePost: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          ),
        }));
      },

      addComment: (postId, comment) => {
        const { user } = get();
        const newComment = {
          id: Date.now(),
          content: comment,
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          ),
        }));
      },

      sharePost: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, shares: post.shares + 1 } : post
          ),
        }));
      },
    }),
    {
      name: 'gamedin-storage',
      partialize: (state) => ({
        ...state,
        posts: state.posts,
      }),
    }
  )
);

export default useStore;
