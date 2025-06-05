import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),

  register: (credentials: { username: string; email: string; password: string }) =>
    api.post('/auth/register', credentials),

  logout: () => api.post('/auth/logout'),

  getProfile: (username: string) => api.get(`/users/${username}`),

  updateProfile: (username: string, data: any) => api.put(`/users/${username}`, data),
};

// Posts API
export const postsApi = {
  getPosts: () => api.get('/posts'),
  createPost: (data: FormData) =>
    api.post('/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  likePost: (postId: string) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId: string) => api.delete(`/posts/${postId}/like`),
};

// Tournaments API
export const tournamentsApi = {
  getTournaments: () => api.get('/tournaments'),
  createTournament: (data: any) => api.post('/tournaments', data),
  registerTeam: (tournamentId: string, teamId: string) =>
    api.post(`/tournaments/${tournamentId}/teams/${teamId}`),
  unregisterTeam: (tournamentId: string, teamId: string) =>
    api.delete(`/tournaments/${tournamentId}/teams/${teamId}`),
};

// Teams API
export const teamsApi = {
  getTeams: () => api.get('/teams'),
  createTeam: (data: any) => api.post('/teams', data),
  updateTeam: (teamId: string, data: any) => api.put(`/teams/${teamId}`, data),
  deleteTeam: (teamId: string) => api.delete(`/teams/${teamId}`),
  joinTeam: (teamId: string) => api.post(`/teams/${teamId}/join`),
  leaveTeam: (teamId: string) => api.delete(`/teams/${teamId}/leave`),
};

// Messages API
export const messagesApi = {
  getConversations: () => api.get('/messages'),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  sendMessage: (conversationId: string, content: string) =>
    api.post(`/messages/${conversationId}`, { content }),
  createConversation: (userId: string) => api.post('/messages', { userId }),
};

// Forums API
export const forumsApi = {
  getCategories: () => api.get('/forums/categories'),
  getThreads: (categoryId: string) => api.get(`/forums/categories/${categoryId}/threads`),
  createThread: (categoryId: string, data: any) =>
    api.post(`/forums/categories/${categoryId}/threads`, data),
  getPosts: (threadId: string) => api.get(`/forums/threads/${threadId}/posts`),
  createPost: (threadId: string, content: string) =>
    api.post(`/forums/threads/${threadId}/posts`, { content }),
};

// Achievements API
export const achievementsApi = {
  getAchievements: () => api.get('/achievements'),
  getUserAchievements: (username: string) => api.get(`/users/${username}/achievements`),
  claimAchievement: (achievementId: string) => api.post(`/achievements/${achievementId}/claim`),
};

// Analytics API
export const analyticsApi = {
  getUserStats: (username: string) => api.get(`/users/${username}/stats`),
  getGameStats: (gameId: string) => api.get(`/games/${gameId}/stats`),
  getTeamStats: (teamId: string) => api.get(`/teams/${teamId}/stats`),
};

export default api;
